// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IVenueAdapter
 * @notice Interface for venue adapters that execute trades on different DEXs
 */
interface IVenueAdapter {
    /**
     * @notice Execute a trade on the venue
     * @param assetIn Address of the input token
     * @param assetOut Address of the output token
     * @param amountIn Amount of input token
     * @param minAmountOut Minimum acceptable amount of output token
     * @param recipient Address to receive the output tokens
     * @return amountOut Actual amount of output tokens received
     */
    function executeTrade(
        address assetIn,
        address assetOut,
        uint256 amountIn,
        uint256 minAmountOut,
        address recipient
    ) external returns (uint256 amountOut);

    /**
     * @notice Get the venue name/identifier
     * @return string Name of the venue
     */
    function venueName() external view returns (string memory);

    /**
     * @notice Get quote for a potential trade
     * @param assetIn Address of the input token
     * @param assetOut Address of the output token
     * @param amountIn Amount of input token
     * @return amountOut Expected amount of output token
     */
    function getQuote(
        address assetIn,
        address assetOut,
        uint256 amountIn
    ) external view returns (uint256 amountOut);
}
