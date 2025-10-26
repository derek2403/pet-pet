import "@/styles/globals.css";
import '@rainbow-me/rainbowkit/styles.css';
import { NotificationProvider, TransactionPopupProvider } from "@blockscout/app-sdk";
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-geist-sans",
  display: "swap",
});

const petPetTestnet = {
  id: 2403,
  name: 'PetPet Testnet',
  nativeCurrency: { name: 'PetPet', symbol: 'PETPET', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://c2e90a7139bb5f5fe1c6deab725ee1a45631b952-8545.dstack-prod5.phala.network/'] },
    public: { http: ['https://c2e90a7139bb5f5fe1c6deab725ee1a45631b952-8545.dstack-prod5.phala.network/'] }
  },
  blockExplorers: {
    default: { name: 'PetPet Explorer', url: 'https://petpet.cloud.blockscout.com/' }
  },
  testnet: true
};

const config = getDefaultConfig({
  appName: 'PetPet App',
  projectId: 'YOUR_PROJECT_ID', // Get your project ID at https://cloud.walletconnect.com
  chains: [petPetTestnet],
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
              <main className={poppins.variable}>
                <Component {...pageProps} />
              </main>
            </TransactionPopupProvider>
          </NotificationProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}


