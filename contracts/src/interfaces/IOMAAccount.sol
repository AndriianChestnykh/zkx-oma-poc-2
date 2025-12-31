// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IOMAAccount {
    struct Intent {
        address user;
        address assetIn;
        address assetOut;
        uint256 amountIn;
        uint256 amountOutMin;
        string venue;
        uint256 deadline;
        uint256 nonce;
    }

    event IntentSubmitted(bytes32 indexed intentId, address indexed user, Intent intent);
    event IntentExecuted(bytes32 indexed intentId, uint256 amountOut);
    event PolicyCheckPassed(bytes32 indexed intentId, string policyName);
    event PolicyCheckFailed(bytes32 indexed intentId, string policyName, string reason);

    function executeIntent(Intent calldata intent, bytes calldata signature) external returns (uint256);
}
