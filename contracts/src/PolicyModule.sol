// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title PolicyModule
/// @notice Policy enforcement logic for intent validation
/// @dev Contract stub for Step 1 - will be implemented in Step 4
contract PolicyModule {
    mapping(address => bool) public allowedVenues;
    mapping(address => bool) public allowedAssets;

    /// @notice Check if a venue is allowed
    /// @dev Currently a stub - implementation in Step 4
    function checkVenueAllowlist(address venue) external view returns (bool) {
        // Stub implementation
        return true;
    }

    /// @notice Check if an asset is allowed
    /// @dev Currently a stub - implementation in Step 4
    function checkAssetAllowlist(address asset) external view returns (bool) {
        // Stub implementation
        return true;
    }
}
