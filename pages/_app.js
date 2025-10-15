import "@/styles/globals.css";
import { NotificationProvider, TransactionPopupProvider } from "@blockscout/app-sdk";


export default function App({ Component, pageProps }) {
  return (
    <NotificationProvider>
      <TransactionPopupProvider>
        <Component {...pageProps} />
      </TransactionPopupProvider>
    </NotificationProvider>
  );
}


