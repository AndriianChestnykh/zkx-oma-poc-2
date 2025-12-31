/**
 * Contract addresses and ABIs
 * Loads contract artifacts from Foundry build output
 */
import { Address } from 'viem';
import OMAAccountArtifact from '../../../contracts/out/OMAAccount.sol/OMAAccount.json';
import PolicyModuleArtifact from '../../../contracts/out/PolicyModule.sol/PolicyModule.json';
import VenueAdapterMockArtifact from '../../../contracts/out/VenueAdapterMock.sol/VenueAdapterMock.json';

// Contract addresses - these should be set after deployment
// You can override these with environment variables
export const CONTRACT_ADDRESSES = {
  OMAAccount: (process.env.NEXT_PUBLIC_OMA_ACCOUNT_ADDRESS ||
    '0x0000000000000000000000000000000000000000') as Address,
  PolicyModule: (process.env.NEXT_PUBLIC_POLICY_MODULE_ADDRESS ||
    '0x0000000000000000000000000000000000000000') as Address,
  VenueAdapterMock: (process.env.NEXT_PUBLIC_VENUE_ADAPTER_ADDRESS ||
    '0x0000000000000000000000000000000000000000') as Address,
};

// Contract ABIs
export const OMAAccountABI = OMAAccountArtifact.abi;
export const PolicyModuleABI = PolicyModuleArtifact.abi;
export const VenueAdapterMockABI = VenueAdapterMockArtifact.abi;

/**
 * Check if contracts are deployed (addresses are set)
 */
export function areContractsDeployed(): boolean {
  return (
    CONTRACT_ADDRESSES.OMAAccount !== '0x0000000000000000000000000000000000000000' &&
    CONTRACT_ADDRESSES.PolicyModule !== '0x0000000000000000000000000000000000000000' &&
    CONTRACT_ADDRESSES.VenueAdapterMock !== '0x0000000000000000000000000000000000000000'
  );
}

/**
 * Get contract configuration for a specific contract
 */
export function getContractConfig(contractName: 'OMAAccount' | 'PolicyModule' | 'VenueAdapterMock') {
  const configs = {
    OMAAccount: {
      address: CONTRACT_ADDRESSES.OMAAccount,
      abi: OMAAccountABI,
    },
    PolicyModule: {
      address: CONTRACT_ADDRESSES.PolicyModule,
      abi: PolicyModuleABI,
    },
    VenueAdapterMock: {
      address: CONTRACT_ADDRESSES.VenueAdapterMock,
      abi: VenueAdapterMockABI,
    },
  };

  return configs[contractName];
}
