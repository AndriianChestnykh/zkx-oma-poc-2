// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IVenueAdapter.sol";

/// @title VenueAdapterMock
/// @notice Mock venue adapter for simulating trade execution
/// @dev Provides simple mock pricing for testing
contract VenueAdapterMock is IVenueAdapter {
    event TradeExecuted(
        address indexed assetIn,
        address indexed assetOut,
        uint256 amountIn,
        uint256 amountOut,
        address indexed recipient,
        uint256 timestamp
    );

    // Mock exchange rate: 95% of input (simulates 5% slippage)
    uint256 private constant EXCHANGE_RATE = 95;
    uint256 private constant RATE_DENOMINATOR = 100;

    error InsufficientOutput(uint256 expected, uint256 actual);

    /// @notice Execute a mock trade
    /// @param assetIn Address of the input token
    /// @param assetOut Address of the output token
    /// @param amountIn Amount of input token
    /// @param minAmountOut Minimum acceptable amount of output token
    /// @param recipient Address to receive the output tokens
    /// @return amountOut Actual amount of output tokens received
    function executeTrade(
        address assetIn,
        address assetOut,
        uint256 amountIn,
        uint256 minAmountOut,
        address recipient
    ) external override returns (uint256 amountOut) {
        // Calculate output amount with mock exchange rate
        amountOut = (amountIn * EXCHANGE_RATE) / RATE_DENOMINATOR;

        // Check minimum output requirement
        if (amountOut < minAmountOut) {
            revert InsufficientOutput(minAmountOut, amountOut);
        }

        // Emit trade event
        emit TradeExecuted(
            assetIn,
            assetOut,
            amountIn,
            amountOut,
            recipient,
            block.timestamp
        );

        return amountOut;
    }

    /// @notice Get the venue name
    /// @return Name of this mock venue
    function venueName() external pure override returns (string memory) {
        return "MockVenue";
    }

    /// @notice Get quote for a potential trade
    /// @param assetIn Address of the input token (unused in mock)
    /// @param assetOut Address of the output token (unused in mock)
    /// @param amountIn Amount of input token
    /// @return amountOut Expected amount of output token
    function getQuote(
        address assetIn,
        address assetOut,
        uint256 amountIn
    ) external pure override returns (uint256 amountOut) {
        // Simple mock quote: 95% of input
        return (amountIn * EXCHANGE_RATE) / RATE_DENOMINATOR;
    }
}
