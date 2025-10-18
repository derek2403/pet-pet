import { useState, useEffect } from 'react';
import Header from "../components/Header";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useTransactionToast } from '../hooks/useTransactionToast';
import { useTransactionHistory } from '../hooks/useTransactionHistory';
import { COUNTER_CONTRACT } from '../config/contracts';

export default function Counter() { 
  const { address, isConnected, chain } = useAccount();
  const [incrementValue, setIncrementValue] = useState('');
  const { showTransactionToast } = useTransactionToast("84532");
  const { showAddressTransactions, showAllTransactions } = useTransactionHistory("84532");
  
  // Read counter value
  const { data: counterValue, refetch, isLoading: isReading } = useReadContract({
    address: COUNTER_CONTRACT.address,
    abi: COUNTER_CONTRACT.abi,
    functionName: 'x',
  });

  // Write contract hooks
  const { writeContract, data: hash, isPending } = useWriteContract();
  
  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Show toast and refetch when transaction succeeds
  useEffect(() => {
    if (isSuccess && hash) {
      showTransactionToast(hash);
      refetch(); // Refresh counter value
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, hash]); // Only depend on state changes, not functions

  // Increment by 1
  const handleIncrement = () => {
    writeContract({
      address: COUNTER_CONTRACT.address,
      abi: COUNTER_CONTRACT.abi,
      functionName: 'inc',
    });
  };

  // Increment by custom value
  const handleIncrementBy = () => {
    const value = parseInt(incrementValue);
    if (!value || value <= 0) {
      alert('Please enter a positive number');
      return;
    }
    
    writeContract({
      address: COUNTER_CONTRACT.address,
      abi: COUNTER_CONTRACT.abi,
      functionName: 'incBy',
      args: [BigInt(value)],
    });
  };

  const isWrongNetwork = isConnected && chain?.id !== COUNTER_CONTRACT.chainId;
  const isProcessing = isPending || isConfirming;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            ⚡ Counter DApp
          </h1>
          <p className="text-gray-600 text-lg">
            Interact with your Counter smart contract on Base Sepolia
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          {!isConnected ? (
            // Not Connected State
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Connect Your Wallet
              </h2>
              <p className="text-gray-600 mb-6">
                Please connect your wallet to interact with the Counter contract
              </p>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 inline-block">
                <p className="text-sm text-blue-800">
                  👆 Click the "Connect Wallet" button in the header
                </p>
              </div>
            </div>
          ) : isWrongNetwork ? (
            // Wrong Network State
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Wrong Network
              </h2>
              <p className="text-gray-600 mb-6">
                Please switch to Base Sepolia network in your wallet
              </p>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200 inline-block">
                <p className="text-sm text-red-800">
                  Current: <strong>{chain?.name}</strong> → Required: <strong>Base Sepolia</strong>
                </p>
              </div>
            </div>
          ) : (
            // Connected & Correct Network - Main Interface
            <div>
              {/* Counter Display */}
              <div className="text-center mb-8">
                <p className="text-gray-600 text-sm font-medium mb-2">Current Counter Value</p>
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-8 mb-4">
                  <div className="text-6xl font-bold text-white mb-2">
                    {isReading ? (
                      <div className="animate-pulse">...</div>
                    ) : (
                      counterValue?.toString() || '0'
                    )}
                  </div>
                  <p className="text-blue-100 text-sm">Contract Value: x</p>
                </div>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => refetch()}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    🔄 Refresh Value
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={() => showAddressTransactions(address)}
                    className="text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors"
                  >
                    📜 My Transactions
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={() => showAllTransactions()}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                  >
                    🌐 All Transactions
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-4">
                {/* Increment by 1 */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">1</span>
                    Increment by 1
                  </h3>
                  <button
                    onClick={handleIncrement}
                    disabled={isProcessing}
                    className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-4 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      '➕ Increment by 1'
                    )}
                  </button>
                </div>

                {/* Increment by Custom Value */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="bg-indigo-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">2</span>
                    Increment by Custom Value
                  </h3>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      min="1"
                      value={incrementValue}
                      onChange={(e) => setIncrementValue(e.target.value)}
                      placeholder="Enter amount..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                    <button
                      onClick={handleIncrementBy}
                      disabled={isProcessing || !incrementValue}
                      className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300 text-white font-semibold px-6 py-3 rounded-lg transition-colors shadow-md hover:shadow-lg disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      ➕ Increment
                    </button>
                  </div>
                </div>
              </div>

              {/* Transaction Status */}
              {isProcessing && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="animate-spin h-5 w-5 text-yellow-600 mr-3" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-yellow-800">
                        {isPending ? 'Waiting for wallet confirmation...' : 'Transaction confirming...'}
                      </p>
                      {hash && (
                        <p className="text-xs text-yellow-600 mt-1 font-mono">
                          {hash.slice(0, 10)}...{hash.slice(-8)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Contract Info */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            📋 Contract Information
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Contract Address:</span>
              <a 
                href={`https://sepolia.basescan.org/address/${COUNTER_CONTRACT.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-blue-600 hover:text-blue-800 text-xs"
              >
                {COUNTER_CONTRACT.address.slice(0, 6)}...{COUNTER_CONTRACT.address.slice(-4)} ↗
              </a>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Network:</span>
              <span className="font-medium">Base Sepolia (Chain ID: 84532)</span>
            </div>
            {isConnected && (
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Your Address:</span>
                <span className="font-mono text-xs">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Custom Hooks Info */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-md p-6 border border-purple-100">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            🎣 Custom Hooks in Action
          </h3>
          <div className="space-y-3 text-sm">
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🍞</span>
                <div>
                  <h4 className="font-semibold text-purple-900 mb-1">useTransactionToast</h4>
                  <p className="text-gray-600 text-xs mb-2">
                    Shows toast notifications when transactions complete
                  </p>
                  <div className="bg-purple-50 rounded px-2 py-1 text-xs font-mono text-purple-700">
                    Auto-triggers after increment transactions
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📜</span>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">useTransactionHistory</h4>
                  <p className="text-gray-600 text-xs mb-2">
                    Opens Blockscout transaction history popup
                  </p>
                  <div className="flex gap-2">
                    <div className="bg-blue-50 rounded px-2 py-1 text-xs font-mono text-blue-700">
                      My Transactions button
                    </div>
                    <div className="bg-indigo-50 rounded px-2 py-1 text-xs font-mono text-indigo-700">
                      All Transactions button
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}