/**
 * Wallet provider component
 * Wraps app with Wagmi and RainbowKit providers
 */
'use client';

import { ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { wagmiConfig, queryClient } from '@/lib/wallet/config';
import { useTheme } from '@/components/theme/ThemeProvider';

import '@rainbow-me/rainbowkit/styles.css';

interface WalletProviderProps {
  children: ReactNode;
}

function RainbowKitWrapper({ children }: { children: ReactNode }) {
  const { theme } = useTheme();

  return (
    <RainbowKitProvider
      theme={theme === 'dark' ? darkTheme({
        accentColor: 'hsl(217, 91%, 60%)',
        accentColorForeground: 'white',
        borderRadius: 'medium',
      }) : lightTheme({
        accentColor: 'hsl(217, 91%, 60%)',
        accentColorForeground: 'white',
        borderRadius: 'medium',
      })}
    >
      {children}
    </RainbowKitProvider>
  );
}

export function WalletProvider({ children }: WalletProviderProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitWrapper>{children}</RainbowKitWrapper>
      </QueryClientProvider>
    </WagmiProvider>
  );
}