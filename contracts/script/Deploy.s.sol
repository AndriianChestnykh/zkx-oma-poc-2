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

        // Add default assets (using test addresses)
        // WETH on Anvil
        policyModule.addAsset(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);
        // USDC on Anvil
        policyModule.addAsset(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
        // DAI on Anvil
        policyModule.addAsset(0x6B175474E89094C44Da98b954EedeAC495271d0F);
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
