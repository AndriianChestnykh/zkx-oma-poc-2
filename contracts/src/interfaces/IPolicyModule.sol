// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IPolicyModule
 * @notice Interface for the policy enforcement module
 */
interface IPolicyModule {
    /**
     * @notice Check if a venue is allowed
     * @param venue Address of the venue to check
     * @return bool True if venue is allowed
     */
    function checkVenueAllowlist(address venue) external view returns (bool);

    /**
     * @notice Check if an asset is allowed
     * @param asset Address of the asset to check
     * @return bool True if asset is allowed
     */
    function checkAssetAllowlist(address asset) external view returns (bool);

    /**
     * @notice Check if an address is sanctioned
     * @param addr Address to check
     * @return bool True if address is sanctioned
     */
    function isSanctioned(address addr) external view returns (bool);

    /**
     * @notice Add venue to allowlist (admin only)
     * @param venue Address of the venue to add
     */
    function addVenue(address venue) external;

    /**
     * @notice Remove venue from allowlist (admin only)
     * @param venue Address of the venue to remove
     */
    function removeVenue(address venue) external;

    /**
     * @notice Add asset to allowlist (admin only)
     * @param asset Address of the asset to add
     */
    function addAsset(address asset) external;

    /**
     * @notice Remove asset from allowlist (admin only)
     * @param asset Address of the asset to remove
     */
    function removeAsset(address asset) external;
}
