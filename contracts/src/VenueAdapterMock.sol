// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title VenueAdapterMock
/// @notice Mock venue adapter for simulating trade execution
/// @dev Contract stub for Step 1 - will be implemented in Step 4
contract VenueAdapterMock {
    event TradeExecuted(
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        uint256 timestamp
    );

    /// @notice Execute a mock trade
    /// @dev Currently a stub - implementation in Step 4
    function executeTrade(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut
    ) external returns (uint256) {
        // Stub implementation
        uint256 amountOut = amountIn; // 1:1 mock price
        emit TradeExecuted(tokenIn, tokenOut, amountIn, amountOut, block.timestamp);
        return amountOut;
    }
}
