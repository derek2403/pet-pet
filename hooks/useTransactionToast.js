import { useNotification } from "@blockscout/app-sdk";

/**
 * Custom hook for handling transaction toast notifications
 * @param {string} chainId - The blockchain network chain ID (default: "1" for Ethereum mainnet)
 */
export const useTransactionToast = (chainId = "1") => {
  const { openTxToast } = useNotification();

  /**
   * Show a transaction notification toast
   * @param {string} txHash - The transaction hash
   * @param {string} customChainId - Optional chain ID override
   */
  const showTransactionToast = (txHash, customChainId = null) => {
    try {
      openTxToast(customChainId || chainId, txHash);
    } catch (error) {
      console.error("Failed to show transaction toast:", error);
    }
  };

  /**
   * Handle transaction with automatic notification
   * @param {Function} transactionFn - Async function that returns transaction hash or transaction object
   * @param {Object} options - Configuration options
   */
  const handleTransactionWithNotification = async (transactionFn, options = {}) => {
    const { 
      onSuccess, 
      onError, 
      customChainId,
      showToast = true 
    } = options;

    try {
      const result = await transactionFn();
      
      // Extract transaction hash from different possible return formats
      let txHash;
      if (typeof result === 'string') {
        txHash = result; // Direct hash string
      } else if (result?.hash) {
        txHash = result.hash; // Transaction object with hash property
      } else if (result?.transactionHash) {
        txHash = result.transactionHash; // Receipt object
      }

      if (txHash && showToast) {
        showTransactionToast(txHash, customChainId);
      }

      if (onSuccess) {
        onSuccess(result, txHash);
      }

      return result;
    } catch (error) {
      console.error("Transaction failed:", error);
      
      if (onError) {
        onError(error);
      }
      
      throw error; // Re-throw to allow component-level error handling
    }
  };

  return {
    showTransactionToast,
    handleTransactionWithNotification,
  };
};

