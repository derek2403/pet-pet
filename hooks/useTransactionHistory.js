import { useTransactionPopup } from "@blockscout/app-sdk";

/**
 * Custom hook for handling transaction history popup
 * @param {string} chainId - The blockchain network chain ID (default: "1" for Ethereum mainnet)
 */
export const useTransactionHistory = (chainId = "1") => {
  const { openPopup } = useTransactionPopup();

  /**
   * Show transactions for a specific address
   * @param {string} address - Wallet address to filter transactions
   * @param {string} customChainId - Optional chain ID override
   */
  const showAddressTransactions = (address, customChainId = null) => {
    try {
      openPopup({
        chainId: customChainId || chainId,
        address: address,
      });
    } catch (error) {
      console.error("Failed to open address transactions:", error);
    }
  };

  /**
   * Show all transactions for the chain
   * @param {string} customChainId - Optional chain ID override
   */
  const showAllTransactions = (customChainId = null) => {
    try {
      openPopup({
        chainId: customChainId || chainId,
      });
    } catch (error) {
      console.error("Failed to open transaction history:", error);
    }
  };

  /**
   * Generic method to open popup with custom options
   * @param {Object} options - Popup options
   * @param {string} options.chainId - Chain ID
   * @param {string} options.address - Optional wallet address
   */
  const openTransactionPopup = (options = {}) => {
    try {
      openPopup({
        chainId: options.chainId || chainId,
        address: options.address,
      });
    } catch (error) {
      console.error("Failed to open transaction popup:", error);
    }
  };

  return {
    showAddressTransactions,
    showAllTransactions,
    openTransactionPopup,
  };
};

