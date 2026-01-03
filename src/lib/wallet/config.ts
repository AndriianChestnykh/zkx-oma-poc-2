/**
 * Wagmi and RainbowKit configuration for wallet connection
 */
import { http, createConfig } from 'wagmi';
import { foundry } from 'wagmi/chains';
import { QueryClient } from '@tanstack/react-query';

/**
 * Wagmi configuration for Anvil/Foundry local chain
 */
export const wagmiConfig = createConfig({
  chains: [foundry],
  transports: {
    [foundry.id]: http('http://localhost:8545'),
  },
});

/**
 * React Query client for Wagmi
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});