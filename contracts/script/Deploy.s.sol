// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/OMAAccount.sol";
import "../src/PolicyModule.sol";
import "../src/VenueAdapterMock.sol";

/// @title DeployScript
/// @notice Deployment script for all contracts
/// @dev Deploys and configures OMAAccount, PolicyModule, and VenueAdapterMock
contract DeployScript is Script {
    function run() external {
        vm.startBroadcast();

        // Get deployer address (will be admin)
        address admin = msg.sender;

        // 1. Deploy PolicyModule
        PolicyModule policyModule = new PolicyModule(admin);
        console.log("PolicyModule deployed at:", address(policyModule));

        // 2. Deploy VenueAdapterMock
        VenueAdapterMock venueAdapter = new VenueAdapterMock();
        console.log("VenueAdapterMock deployed at:", address(venueAdapter));

        // 3. Deploy OMAAccount
        OMAAccount omaAccount = new OMAAccount(
            address(policyModule),
            address(venueAdapter)
        );
        console.log("OMAAccount deployed at:", address(omaAccount));

        // 4. Initialize PolicyModule with default allowlists for testing
        console.log("Initializing PolicyModule with default allowlists...");

        // Add default venues
        policyModule.addVenue("MockVenue");
        policyModule.addVenue("Uniswap");
        policyModule.addVenue("SushiSwap");
        console.log("Added default venues");

        // Add default assets (using mainnet addresses)
        // USDT
        policyModule.addAsset(0xdAC17F958D2ee523a2206206994597C13D831ec7);
        // WBTC
        policyModule.addAsset(0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599);
        // WETH
        policyModule.addAsset(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);
        console.log("Added default assets");

        console.log("\n=== Deployment Summary ===");
        console.log("OMAAccount:        ", address(omaAccount));
        console.log("PolicyModule:      ", address(policyModule));
        console.log("VenueAdapterMock:  ", address(venueAdapter));
        console.log("Admin:             ", admin);
        console.log("========================\n");

        vm.stopBroadcast();
    }
}
