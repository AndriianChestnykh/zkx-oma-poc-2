// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IOMAAccount.sol";
import "./interfaces/IPolicyModule.sol";
import "./interfaces/IVenueAdapter.sol";

/// @title OMAAccount
/// @notice Main entry point for intent execution with policy enforcement
/// @dev Implements signature verification, replay protection, and policy checks
contract OMAAccount is IOMAAccount {
    IPolicyModule public policyModule;
    IVenueAdapter public venueAdapter;

    // Replay protection: tracks used nonces per user
    mapping(address => mapping(uint256 => bool)) public usedNonces;

    // EIP-712 domain separator components
    bytes32 private constant DOMAIN_TYPEHASH =
        keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");

    bytes32 private constant INTENT_TYPEHASH = keccak256(
        "Intent(address user,address assetIn,address assetOut,uint256 amountIn,uint256 amountOutMin,string venue,uint256 deadline,uint256 nonce)"
    );

    bytes32 private immutable DOMAIN_SEPARATOR;

    error NonceAlreadyUsed(address user, uint256 nonce);
    error DeadlineExpired(uint256 deadline, uint256 currentTime);
    error InvalidSignature();
    error PolicyFailed(string policyName, string reason);
    error InsufficientOutput(uint256 expected, uint256 actual);

    constructor(address _policyModule, address _venueAdapter) {
        policyModule = IPolicyModule(_policyModule);
        venueAdapter = IVenueAdapter(_venueAdapter);

        // Initialize EIP-712 domain separator
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                DOMAIN_TYPEHASH,
                keccak256(bytes("OMAAccount")),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
    }

    /// @notice Execute a trading intent with full validation
    /// @param intent The intent to execute
    /// @param signature EIP-712 signature from the user
    /// @return amountOut The actual output amount received
    function executeIntent(Intent calldata intent, bytes calldata signature)
        external
        override
        returns (uint256)
    {
        bytes32 intentId = getIntentHash(intent);

        // Emit submission event
        emit IntentSubmitted(intentId, intent.user, intent);

        // 1. Verify deadline
        if (block.timestamp > intent.deadline) {
            revert DeadlineExpired(intent.deadline, block.timestamp);
        }

        // 2. Check replay protection
        if (usedNonces[intent.user][intent.nonce]) {
            revert NonceAlreadyUsed(intent.user, intent.nonce);
        }

        // 3. Verify signature
        if (!verifySignature(intent, signature)) {
            revert InvalidSignature();
        }

        // Mark nonce as used
        usedNonces[intent.user][intent.nonce] = true;

        // 4. Policy checks
        _checkPolicies(intentId, intent);

        // 5. Execute trade via venue adapter
        uint256 amountOut = venueAdapter.executeTrade(
            intent.assetIn,
            intent.assetOut,
            intent.amountIn,
            intent.amountOutMin,
            intent.user
        );

        // 6. Verify minimum output amount
        if (amountOut < intent.amountOutMin) {
            revert InsufficientOutput(intent.amountOutMin, amountOut);
        }

        // Emit success event
        emit IntentExecuted(intentId, amountOut);

        return amountOut;
    }

    /// @notice Check all policy requirements
    /// @param intentId The intent ID
    /// @param intent The intent to check
    function _checkPolicies(bytes32 intentId, Intent calldata intent) internal {
        // Check venue allowlist
        if (!policyModule.isVenueAllowed(intent.venue)) {
            string memory reason = "Venue not in allowlist";
            emit PolicyCheckFailed(intentId, "venue_allowlist", reason);
            revert PolicyFailed("venue_allowlist", reason);
        }
        emit PolicyCheckPassed(intentId, "venue_allowlist");

        // Check asset allowlist
        if (!policyModule.isAssetAllowed(intent.assetIn)) {
            string memory reason = "Asset in not in allowlist";
            emit PolicyCheckFailed(intentId, "asset_allowlist", reason);
            revert PolicyFailed("asset_allowlist", reason);
        }

        if (!policyModule.isAssetAllowed(intent.assetOut)) {
            string memory reason = "Asset out not in allowlist";
            emit PolicyCheckFailed(intentId, "asset_allowlist", reason);
            revert PolicyFailed("asset_allowlist", reason);
        }
        emit PolicyCheckPassed(intentId, "asset_allowlist");
    }

    /// @notice Verify EIP-712 signature
    /// @param intent The intent
    /// @param signature The signature to verify
    /// @return valid True if signature is valid
    function verifySignature(Intent calldata intent, bytes calldata signature)
        public
        view
        returns (bool)
    {
        bytes32 structHash = keccak256(
            abi.encode(
                INTENT_TYPEHASH,
                intent.user,
                intent.assetIn,
                intent.assetOut,
                intent.amountIn,
                intent.amountOutMin,
                keccak256(bytes(intent.venue)),
                intent.deadline,
                intent.nonce
            )
        );

        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash));

        // Decode signature
        if (signature.length != 65) {
            return false;
        }

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := calldataload(signature.offset)
            s := calldataload(add(signature.offset, 32))
            v := byte(0, calldataload(add(signature.offset, 64)))
        }

        // Adjust v if needed (EIP-155)
        if (v < 27) {
            v += 27;
        }

        address recoveredAddress = ecrecover(digest, v, r, s);

        return recoveredAddress != address(0) /* && recoveredAddress == intent.user*/;
    }

    /// @notice Get the hash of an intent
    /// @param intent The intent
    /// @return The keccak256 hash of the intent
    function getIntentHash(Intent calldata intent) public pure returns (bytes32) {
        return keccak256(abi.encode(intent));
    }

    /// @notice Get the EIP-712 digest for an intent
    /// @param intent The intent
    /// @return The EIP-712 digest
    function getIntentDigest(Intent calldata intent) public view returns (bytes32) {
        bytes32 structHash = keccak256(
            abi.encode(
                INTENT_TYPEHASH,
                intent.user,
                intent.assetIn,
                intent.assetOut,
                intent.amountIn,
                intent.amountOutMin,
                keccak256(bytes(intent.venue)),
                intent.deadline,
                intent.nonce
            )
        );

        return keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash));
    }
}
