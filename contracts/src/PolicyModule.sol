// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IPolicyModule.sol";

/// @title PolicyModule
/// @notice Policy enforcement module with venue and asset allowlists
/// @dev Admin-controlled allowlists for venues and assets
contract PolicyModule is IPolicyModule {
    address public admin;

    // Allowlists
    mapping(string => bool) private allowedVenues;
    mapping(address => bool) private allowedAssets;

    error OnlyAdmin();

    modifier onlyAdmin() {
        if (msg.sender != admin) revert OnlyAdmin();
        _;
    }

    constructor(address _admin) {
        admin = _admin;
    }

    /// @notice Check if a venue is allowed
    /// @param venue Name of the venue to check
    /// @return True if venue is allowed
    function isVenueAllowed(string calldata venue) external view override returns (bool) {
        return allowedVenues[venue];
    }

    /// @notice Check if an asset is allowed
    /// @param asset Address of the asset to check
    /// @return True if asset is allowed
    function isAssetAllowed(address asset) external view override returns (bool) {
        return allowedAssets[asset];
    }

    /// @notice Add venue to allowlist
    /// @param venue Name of the venue to add
    function addVenue(string calldata venue) external override onlyAdmin {
        allowedVenues[venue] = true;
        emit VenueUpdated(venue, true);
    }

    /// @notice Remove venue from allowlist
    /// @param venue Name of the venue to remove
    function removeVenue(string calldata venue) external override onlyAdmin {
        allowedVenues[venue] = false;
        emit VenueUpdated(venue, false);
    }

    /// @notice Add asset to allowlist
    /// @param asset Address of the asset to add
    function addAsset(address asset) external override onlyAdmin {
        allowedAssets[asset] = true;
        emit AssetUpdated(asset, true);
    }

    /// @notice Remove asset from allowlist
    /// @param asset Address of the asset to remove
    function removeAsset(address asset) external override onlyAdmin {
        allowedAssets[asset] = false;
        emit AssetUpdated(asset, false);
    }

    /// @notice Update admin address
    /// @param newAdmin New admin address
    function updateAdmin(address newAdmin) external onlyAdmin {
        admin = newAdmin;
    }
}
