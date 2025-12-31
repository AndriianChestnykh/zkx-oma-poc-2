// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IPolicyModule
 * @notice Interface for the policy enforcement module
 */
interface IPolicyModule {
    event VenueUpdated(string venue, bool allowed);
    event AssetUpdated(address asset, bool allowed);

    /**
     * @notice Check if a venue is allowed
     * @param venue Name of the venue to check
     * @return bool True if venue is allowed
     */
    function isVenueAllowed(string calldata venue) external view returns (bool);

    /**
     * @notice Check if an asset is allowed
     * @param asset Address of the asset to check
     * @return bool True if asset is allowed
     */
    function isAssetAllowed(address asset) external view returns (bool);

    /**
     * @notice Add venue to allowlist (admin only)
     * @param venue Name of the venue to add
     */
    function addVenue(string calldata venue) external;

    /**
     * @notice Remove venue from allowlist (admin only)
     * @param venue Name of the venue to remove
     */
    function removeVenue(string calldata venue) external;

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
