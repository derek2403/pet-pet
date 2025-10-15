import "@/styles/globals.css";
import '@rainbow-me/rainbowkit/styles.css';
import { NotificationProvider, TransactionPopupProvider } from "@blockscout/app-sdk";
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum, base, baseSepolia } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const config = getDefaultConfig({
  appName: 'PetPet App',
  projectId: 'YOUR_PROJECT_ID', // Get your project ID at https://cloud.walletconnect.com
  chains: [mainnet, polygon, optimism, arbitrum, base, baseSepolia],
  ssr: true, // Enable server-side rendering for Next.js
});

const queryClient = new QueryClient();

export default function App({ Component, pageProps }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <NotificationProvider>
            <TransactionPopupProvider>
              <Component {...pageProps} />
            </TransactionPopupProvider>
          </NotificationProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}


