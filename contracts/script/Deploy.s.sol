// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/OMAAccount.sol";
import "../src/PolicyModule.sol";
import "../src/VenueAdapterMock.sol";

/// @title DeployScript
/// @notice Deployment script for all contracts
/// @dev Deployment script stub for Step 1 - will be enhanced in Step 4
contract DeployScript is Script {
    function run() external {
        vm.startBroadcast();

        // Deploy contracts
        OMAAccount omaAccount = new OMAAccount();
        PolicyModule policyModule = new PolicyModule();
        VenueAdapterMock venueAdapter = new VenueAdapterMock();

        console.log("OMAAccount deployed at:", address(omaAccount));
        console.log("PolicyModule deployed at:", address(policyModule));
        console.log("VenueAdapterMock deployed at:", address(venueAdapter));

        vm.stopBroadcast();
    }
}
