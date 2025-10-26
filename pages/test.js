import { useState } from 'react';
import { ethers } from 'ethers';
import { REGISTRY_ADDRESS, PET_ABI } from '../config/contracts';
import { useTransactionToast } from '../hooks/useTransactionToast';
import { useTransactionHistory } from '../hooks/useTransactionHistory';

const REGISTRY_ABI = REGISTRY_ADDRESS.abi;

// Base Sepolia RPC URL (fallback)
const BASE_SEPOLIA_RPC = 'https://sepolia.base.org';

// Retry helper for unstable RPC calls
const retryWithBackoff = async (fn, maxRetries = 3, delayMs = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      const isLastRetry = i === maxRetries - 1;
      
      // If it's the last retry, throw the error
      if (isLastRetry) {
        throw error;
      }
      
      // Check if it's a retryable error
      const isRetryable = 
        error.code === 'CALL_EXCEPTION' ||
        error.code === 'NETWORK_ERROR' ||
        error.code === 'TIMEOUT' ||
        error.message?.includes('missing revert data') ||
        error.message?.includes('could not detect network') ||
        error.message?.includes('network changed');
      
      if (!isRetryable) {
        throw error; // Don't retry non-network errors
      }
      
      console.log(`Retry ${i + 1}/${maxRetries} after error:`, error.message);
      
      // Exponential backoff: wait longer each retry
      const waitTime = delayMs * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
};

export default function TestPage() {
  const [account, setAccount] = useState(null);
  const [petName, setPetName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [myPets, setMyPets] = useState([]); // Array of {address, name}
  const [allPets, setAllPets] = useState([]); // Array of {address, name}
  const [selectedPet, setSelectedPet] = useState(null);
  const [petStats, setPetStats] = useState(null);
  const [interactPetName, setInteractPetName] = useState(''); // For searching pet by name
  const [interactAddress, setInteractAddress] = useState(''); // For direct address entry
  const [interactDuration, setInteractDuration] = useState(600); // Default 10 minutes

  // Initialize transaction hooks with Base Sepolia chain ID
  const { showTransactionToast, handleTransactionWithNotification } = useTransactionToast("84532");
  const { showAddressTransactions, openTransactionPopup } = useTransactionHistory("84532");

  // Connect wallet
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setMessage('❌ Please install MetaMask!');
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Check network first
      const network = await provider.getNetwork();
      console.log('Connected to network:', network.chainId.toString());
      
      if (network.chainId !== 84532n) {
        setMessage('⚠️ Please switch MetaMask to Base Sepolia (Chain ID: 84532)');
        
        // Try to switch network automatically
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x14a34' }], // 84532 in hex
          });
        } catch (switchError) {
          // If network doesn't exist, add it
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0x14a34',
                  chainName: 'Base Sepolia',
                  nativeCurrency: {
                    name: 'Ethereum',
                    symbol: 'ETH',
                    decimals: 18
                  },
                  rpcUrls: ['https://sepolia.base.org'],
                  blockExplorerUrls: ['https://sepolia.basescan.org']
                }]
              });
            } catch (addError) {
              console.error('Error adding network:', addError);
              return;
            }
          }
        }
      }
      
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      setMessage(`✅ Connected: ${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`);
      
      // Load pets after connecting
      loadPets(accounts[0]);
    } catch (error) {
      console.error(error);
      setMessage('❌ Error connecting wallet: ' + error.message);
    }
  };

  // Verify contract is deployed
  const verifyContract = async (provider) => {
    try {
      const code = await provider.getCode(REGISTRY_ADDRESS.address);
      console.log('Contract code length:', code.length);
      if (code === '0x') {
        throw new Error('No contract found at this address on Base Sepolia');
      }
      return true;
    } catch (error) {
      console.error('Contract verification failed:', error);
      return false;
    }
  };

  // Helper function to fetch pet name from contract
  const fetchPetName = async (petAddress, provider) => {
    try {
      return await retryWithBackoff(async () => {
        const pet = new ethers.Contract(petAddress, PET_ABI, provider);
        const name = await pet.petName();
        return name;
      });
    } catch (error) {
      console.error(`Error fetching name for ${petAddress}:`, error);
      return 'Unknown'; // Fallback if we can't fetch the name
    }
  };

  // Load user's pets and all pets with their names
  const loadPets = async (userAddress) => {
    try {
      let provider;
      
      try {
        provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        console.log('MetaMask network:', network.chainId.toString());
        
        if (network.chainId !== 84532n) {
          setMessage(`⚠️ Wrong network! Please switch to Base Sepolia (Chain ID: 84532). Current: ${network.chainId}`);
          return;
        }
      } catch (err) {
        console.warn('MetaMask provider issue, using fallback RPC');
        provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC);
      }
      
      // Verify contract exists
      const contractExists = await verifyContract(provider);
      if (!contractExists) {
        setMessage('❌ Contract not found! Make sure you deployed to Base Sepolia at: ' + REGISTRY_ADDRESS.address);
        return;
      }
      
      const registry = new ethers.Contract(REGISTRY_ADDRESS.address, REGISTRY_ABI, provider);
      console.log('Registry contract created');
      
      // Get total count with retry
      const count = await retryWithBackoff(() => registry.getPetCount());
      console.log('Total pet count:', count.toString());
      
      // Get user's pets with retry
      const userPetsAddresses = await retryWithBackoff(() => registry.getPetsByOwner(userAddress));
      console.log('User pet addresses:', userPetsAddresses);
      
      // Fetch names for user's pets (with built-in retry in fetchPetName)
      const userPetsWithNames = await Promise.all(
        userPetsAddresses.map(async (address) => ({
          address,
          name: await fetchPetName(address, provider)
        }))
      );
      setMyPets(userPetsWithNames);
      
      // Get all pets with retry
      const allPetsAddresses = await retryWithBackoff(() => registry.getAllPets());
      console.log('All pet addresses:', allPetsAddresses);
      
      // Fetch names for all pets
      const allPetsWithNames = await Promise.all(
        allPetsAddresses.map(async (address) => ({
          address,
          name: await fetchPetName(address, provider)
        }))
      );
      setAllPets(allPetsWithNames);
      
      setMessage(`📊 Total pets in system: ${count.toString()} | Your pets: ${userPetsWithNames.length}`);
    } catch (error) {
      console.error('Error loading pets:', error);
      setMessage(`❌ Error: ${error.message || 'Failed to load pets. Check console for details.'}`);
    }
  };

  // Create a new pet
  const createPet = async () => {
    if (!petName.trim()) {
      setMessage('❌ Please enter a pet name');
      return;
    }

    try {
      setLoading(true);
      setMessage('🔍 Checking name availability...');

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const registry = new ethers.Contract(REGISTRY_ADDRESS.address, REGISTRY_ABI, signer);

      // Check if name is available (case-insensitive check in registry) with retry
      const available = await retryWithBackoff(async () => {
        return await registry.isPetNameAvailable(petName);
      }, 3, 1000);
      
      if (!available) {
        setMessage(`❌ Pet name "${petName}" already taken! (Names are case-insensitive)`);
        setLoading(false);
        return;
      }
      
      console.log(`✅ Name "${petName}" is available`);
      setMessage('🔄 Compiling contract for pet "' + petName + '"...');

      // Compile contract via backend API
      setMessage('⏳ Compiling contract (this may take 10-20 seconds)...');
      
      const compileResponse = await fetch('/api/compile-pet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petName: petName }),
      });

      const compileResult = await compileResponse.json();
      
      if (!compileResult.success) {
        throw new Error(compileResult.error || 'Compilation failed');
      }

      console.log('Contract compiled:', compileResult.contractName);
      setMessage(`✅ Compiled! Now deploying with your wallet...`);

      // Deploy using user's wallet
      const ContractFactory = new ethers.ContractFactory(
        compileResult.abi,
        compileResult.bytecode,
        signer
      );

      setMessage('⏳ Please confirm transaction in MetaMask...');
      
      // Deploy contract
      const contract = await ContractFactory.deploy(petName, account);
      const deployTx = contract.deploymentTransaction();
      
      // Show deployment toast
      if (deployTx && deployTx.hash) {
        showTransactionToast(deployTx.hash);
      }
      
      setMessage('⏳ Waiting for deployment confirmation...');
      await contract.waitForDeployment();
      
      const petAddress = await contract.getAddress();
      console.log('Pet deployed at:', petAddress);
      setMessage(`✅ Contract deployed! Registering in registry...`);

      // Register the pet in the registry with transaction toast
      try {
        await handleTransactionWithNotification(
          async () => {
            const tx = await registry.registerPet(petName, petAddress, account);
            setMessage('⏳ Registering pet in registry...');
            await tx.wait();
            return tx;
          },
          {
            onSuccess: (result, txHash) => {
              console.log('Registration transaction:', txHash);
            },
            showToast: true
          }
        );
      } catch (regError) {
        // Handle race condition where name was taken between check and registration
        if (regError.message && regError.message.includes('Pet name already exists')) {
          setMessage(`❌ Pet name was taken by someone else during deployment. Contract deployed at ${petAddress} but not registered.`);
          setLoading(false);
          return;
        }
        throw regError; // Re-throw if it's a different error
      }

      setMessage(`✅ Pet "${petName}" (contract ${compileResult.contractName}) created at ${petAddress}`);
      
      // Auto-verify then cleanup
      setTimeout(async () => {
        console.log('Starting auto-verification for:', petAddress, petName, account);
        await verifyPetContract(petAddress, petName, account);
        
        // Delete temp files after verification
        try {
          await fetch('/api/cleanup-temp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contractName: compileResult.contractName
            }),
          });
          console.log('Temp files cleaned up');
        } catch (e) {
          console.log('Cleanup error:', e);
        }
      }, 5000);
      
      setPetName('');
      loadPets(account);
    } catch (error) {
      console.error(error);
      
      // Provide helpful error message based on error type
      let errorMsg = 'Failed to create pet';
      if (error.message?.includes('missing revert data') || error.code === 'CALL_EXCEPTION') {
        errorMsg = 'RPC connection failed after 3 retries. Please try again in a few seconds.';
      } else if (error.message?.includes('user rejected')) {
        errorMsg = 'Transaction rejected by user';
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setMessage('❌ Error: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // View pet details
  const viewPet = async (petAddress) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const pet = new ethers.Contract(petAddress, PET_ABI, provider);
      
      // Fetch pet details with retry
      const [name, owner, stats] = await retryWithBackoff(async () => {
        return await Promise.all([
          pet.petName(),
          pet.owner(),
          pet.getStats()
        ]);
      });
      
      setSelectedPet({
        address: petAddress,
        name,
        owner,
        walks: stats[0].toString(),
        runs: stats[1].toString(),
        rests: stats[2].toString(),
        food: stats[3].toString(),
        water: stats[4].toString(),
        interactions: stats[5].toString()
      });
    } catch (error) {
      console.error('Error viewing pet:', error);
      setMessage('❌ Error loading pet details: ' + error.message);
    }
  };

  // Verify pet contract on Blockscout
  const verifyPetContract = async (petAddress, petName, ownerAddress) => {
    try {
      setLoading(true);
      setMessage('🔍 Verifying contract on Blockscout...');
      
      const response = await fetch('/api/verify-pet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petAddress, petName, ownerAddress }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setMessage(`✅ Contract verified! View on Blockscout: ${result.explorerUrl}`);
        window.open(result.explorerUrl, '_blank');
      } else {
        setMessage(`⚠️ ${result.error || 'Verification failed. Contract may already be verified.'}`);
      }
    } catch (error) {
      console.error('Verification error:', error);
      setMessage('❌ Verification failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Look up pet address by name from registry
  const lookupPetByName = async (name) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const registry = new ethers.Contract(REGISTRY_ADDRESS.address, REGISTRY_ABI, provider);
      
      const address = await retryWithBackoff(async () => {
        return await registry.getPetByName(name);
      });
      
      if (address === ethers.ZeroAddress || address === '0x0000000000000000000000000000000000000000') {
        setMessage(`❌ Pet "${name}" not found in registry`);
        return null;
      }
      
      return address;
    } catch (error) {
      console.error('Error looking up pet:', error);
      setMessage(`❌ Error looking up pet: ${error.message}`);
      return null;
    }
  };

  // Handle pet interaction
  const handleInteract = async () => {
    try {
      setLoading(true);
      
      // Determine which address to use
      let targetAddress = null;
      
      if (interactAddress.trim()) {
        // Use direct address if provided
        if (!ethers.isAddress(interactAddress)) {
          setMessage('❌ Invalid Ethereum address');
          setLoading(false);
          return;
        }
        targetAddress = interactAddress;
      } else if (interactPetName.trim()) {
        // Look up by name
        setMessage('🔍 Looking up pet by name...');
        targetAddress = await lookupPetByName(interactPetName);
        if (!targetAddress) {
          setLoading(false);
          return;
        }
      } else {
        setMessage('❌ Please enter a pet name or contract address');
        setLoading(false);
        return;
      }
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const pet = new ethers.Contract(selectedPet.address, PET_ABI, signer);
      
      // Execute interaction with toast
      await handleTransactionWithNotification(
        async () => {
          const tx = await pet.interact(targetAddress, interactDuration);
          setMessage('⏳ Recording interaction...');
          await tx.wait();
          return tx;
        },
        {
          onSuccess: () => {
            setMessage(`✅ Interaction successful! Both pets recorded the interaction (contract-to-contract call)`);
            // Clear input fields
            setInteractPetName('');
            setInteractAddress('');
            // Refresh pet stats
            viewPet(selectedPet.address);
          },
          onError: (error) => {
            setMessage('❌ Error: ' + (error.reason || error.message));
          },
          showToast: true
        }
      );
    } catch (error) {
      console.error(error);
      setMessage('❌ Error: ' + (error.reason || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Log activity
  const logActivity = async (type, value) => {
    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const pet = new ethers.Contract(selectedPet.address, PET_ABI, signer);
      
      // Execute transaction with toast
      await handleTransactionWithNotification(
        async () => {
          let tx;
          if (type === 'walk') tx = await pet.walk(value);
          else if (type === 'run') tx = await pet.run(value);
          else if (type === 'eat') tx = await pet.eat(value);
          else if (type === 'drink') tx = await pet.drink(value);
          
          setMessage('⏳ Logging activity...');
          await tx.wait();
          return tx;
        },
        {
          onSuccess: () => {
            setMessage(`✅ Activity logged!`);
            // Refresh pet stats
            viewPet(selectedPet.address);
          },
          onError: (error) => {
            setMessage('❌ Error: ' + (error.reason || error.message));
          },
          showToast: true
        }
      );
    } catch (error) {
      console.error(error);
      setMessage('❌ Error: ' + (error.reason || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '48px', marginBottom: '10px' }}>🐾 PetPet Test Page</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Connected to Base Sepolia | Registry: <code>{REGISTRY_ADDRESS.address}</code>
      </p>

      {/* Connect Wallet */}
      {!account ? (
        <button 
          onClick={connectWallet}
          style={{
            padding: '15px 30px',
            fontSize: '18px',
            background: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          Connect Wallet
        </button>
      ) : (
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <p style={{ color: 'green', margin: 0 }}>{message}</p>
            <button
              onClick={() => showAddressTransactions(account)}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                background: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              📜 View My Transaction History
            </button>
          </div>
          
          {/* Create Pet Section */}
          <div style={{ 
            border: '2px solid #eaeaea', 
            borderRadius: '12px', 
            padding: '30px',
            marginBottom: '30px',
            background: '#fafafa'
          }}>
            <h2>➕ Create New Pet</h2>
            <p style={{ color: '#666', fontSize: '14px', marginTop: '10px', marginBottom: '15px' }}>
              ℹ️ Pet names are <strong>case-insensitive</strong> and must be unique (e.g., "Buddy", "buddy", "BUDDY" are all the same)
            </p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <input
                type="text"
                placeholder="Enter pet name (e.g., Buddy, Max, Luna)"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                disabled={loading}
                style={{
                  padding: '12px',
                  fontSize: '16px',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  flex: 1
                }}
              />
              <button
                onClick={createPet}
                disabled={loading}
                style={{
                  padding: '12px 30px',
                  fontSize: '16px',
                  background: loading ? '#ccc' : '#0070f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Creating...' : 'Create Pet'}
              </button>
            </div>
          </div>

          {/* My Pets */}
          <div style={{ 
            border: '2px solid #eaeaea', 
            borderRadius: '12px', 
            padding: '30px',
            marginBottom: '30px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>🐕 My Pets ({myPets.length})</h2>
              {myPets.length > 0 && (
                <button
                  onClick={() => showAddressTransactions(account)}
                  style={{
                    padding: '8px 16px',
                    fontSize: '13px',
                    background: '#8b5cf6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  📊 View All Pet Transactions
                </button>
              )}
            </div>
            {myPets.length === 0 ? (
              <p style={{ color: '#666' }}>You haven't created any pets yet.</p>
            ) : (
              <div style={{ display: 'grid', gap: '10px', marginTop: '20px' }}>
                {myPets.map((pet, idx) => (
                  <div 
                    key={idx}
                    onClick={() => viewPet(pet.address)}
                    style={{
                      padding: '15px',
                      background: selectedPet?.address === pet.address ? '#e3f2fd' : 'white',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = selectedPet?.address === pet.address ? '#e3f2fd' : '#f5f5f5'}
                    onMouseLeave={(e) => e.currentTarget.style.background = selectedPet?.address === pet.address ? '#e3f2fd' : 'white'}
                  >
                    <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '5px', color: '#0070f3' }}>
                      🐾 {pet.name}
                    </div>
                    <code style={{ fontSize: '12px', color: '#666' }}>{pet.address}</code>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Pet Details */}
          {selectedPet && (
            <div style={{ 
              border: '2px solid #0070f3', 
              borderRadius: '12px', 
              padding: '30px',
              background: '#f0f9ff'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0 }}>🐾 {selectedPet.name}</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => showAddressTransactions(selectedPet.address)}
                    style={{
                      padding: '10px 20px',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    📜 Pet History
                  </button>
                  <button
                    onClick={() => verifyPetContract(selectedPet.address, selectedPet.name, selectedPet.owner)}
                    disabled={loading}
                    style={{
                      padding: '10px 20px',
                      background: '#8b5cf6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    🔍 Verify Contract
                  </button>
                </div>
              </div>
              <p><strong>Address:</strong> <code>{selectedPet.address}</code></p>
              <p><strong>Owner:</strong> <code>{selectedPet.owner}</code></p>
              
              <h3 style={{ marginTop: '20px' }}>📊 Statistics</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginTop: '15px' }}>
                <div style={{ padding: '15px', background: 'white', borderRadius: '8px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{selectedPet.walks}</div>
                  <div style={{ color: '#666' }}>Total Walk Time (s)</div>
                </div>
                <div style={{ padding: '15px', background: 'white', borderRadius: '8px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{selectedPet.runs}</div>
                  <div style={{ color: '#666' }}>Total Run Time (s)</div>
                </div>
                <div style={{ padding: '15px', background: 'white', borderRadius: '8px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{selectedPet.rests}</div>
                  <div style={{ color: '#666' }}>Total Rest Time (s)</div>
                </div>
                <div style={{ padding: '15px', background: 'white', borderRadius: '8px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{selectedPet.food}</div>
                  <div style={{ color: '#666' }}>Food Consumed (g)</div>
                </div>
                <div style={{ padding: '15px', background: 'white', borderRadius: '8px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{selectedPet.water}</div>
                  <div style={{ color: '#666' }}>Water Consumed (ml)</div>
                </div>
                <div style={{ padding: '15px', background: 'white', borderRadius: '8px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{selectedPet.interactions}</div>
                  <div style={{ color: '#666' }}>Interactions</div>
                </div>
              </div>

              {/* Quick Actions */}
              {selectedPet.owner.toLowerCase() === account.toLowerCase() && (
                <div style={{ marginTop: '30px' }}>
                  <h3>⚡ Quick Actions</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', marginTop: '15px' }}>
                    <button
                      onClick={() => logActivity('walk', 1800)}
                      disabled={loading}
                      style={{
                        padding: '15px',
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      🚶 Walk (30 min)
                    </button>
                    <button
                      onClick={() => logActivity('run', 600)}
                      disabled={loading}
                      style={{
                        padding: '15px',
                        background: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      🏃 Run (10 min)
                    </button>
                    <button
                      onClick={() => logActivity('eat', 200)}
                      disabled={loading}
                      style={{
                        padding: '15px',
                        background: '#8b5cf6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      🍖 Eat (200g)
                    </button>
                    <button
                      onClick={() => logActivity('drink', 500)}
                      disabled={loading}
                      style={{
                        padding: '15px',
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      💧 Drink (500ml)
                    </button>
                  </div>

                  {/* Pet Interaction Section */}
                  <div style={{ marginTop: '30px', padding: '20px', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <h3>🤝 Interact with Another Pet</h3>
                    <p style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>
                      Enter a pet name to look up from registry OR enter the contract address directly
                    </p>
                    <div style={{ 
                      background: '#f0f9ff', 
                      border: '1px solid #0ea5e9', 
                      padding: '10px', 
                      borderRadius: '6px', 
                      marginBottom: '15px',
                      fontSize: '13px'
                    }}>
                      <strong>ℹ️ Contract-to-Contract Interaction:</strong> When you interact, your pet's contract will call the other pet's contract directly, creating an internal transaction. Both pets will record the interaction automatically!
                    </div>
                    
                    <div style={{ display: 'grid', gap: '15px' }}>
                      {/* Pet Name Lookup Field */}
                      <div>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '14px' }}>
                          Search by Pet Name:
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Buddy, Max, Luna..."
                          value={interactPetName}
                          onChange={(e) => {
                            setInteractPetName(e.target.value);
                            // Clear address field when typing name
                            if (e.target.value) setInteractAddress('');
                          }}
                          disabled={loading}
                          style={{
                            width: '100%',
                            padding: '10px',
                            fontSize: '14px',
                            border: '2px solid #ddd',
                            borderRadius: '6px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      {/* Divider */}
                      <div style={{ textAlign: 'center', color: '#999', fontSize: '14px' }}>
                        — OR —
                      </div>

                      {/* Direct Address Field */}
                      <div>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '14px' }}>
                          Enter Contract Address Directly:
                        </label>
                        <input
                          type="text"
                          placeholder="0x..."
                          value={interactAddress}
                          onChange={(e) => {
                            setInteractAddress(e.target.value);
                            // Clear name field when typing address
                            if (e.target.value) setInteractPetName('');
                          }}
                          disabled={loading}
                          style={{
                            width: '100%',
                            padding: '10px',
                            fontSize: '14px',
                            border: '2px solid #ddd',
                            borderRadius: '6px',
                            fontFamily: 'monospace',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      {/* Duration Field */}
                      <div>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '14px' }}>
                          Interaction Duration (seconds):
                        </label>
                        <input
                          type="number"
                          value={interactDuration}
                          onChange={(e) => setInteractDuration(Number(e.target.value))}
                          disabled={loading}
                          min="1"
                          style={{
                            width: '100%',
                            padding: '10px',
                            fontSize: '14px',
                            border: '2px solid #ddd',
                            borderRadius: '6px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      {/* Submit Button */}
                      <button
                        onClick={handleInteract}
                        disabled={loading || (!interactPetName.trim() && !interactAddress.trim())}
                        style={{
                          padding: '15px',
                          fontSize: '16px',
                          background: loading || (!interactPetName.trim() && !interactAddress.trim()) ? '#ccc' : '#ec4899',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: loading || (!interactPetName.trim() && !interactAddress.trim()) ? 'not-allowed' : 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        {loading ? '⏳ Processing...' : '🤝 Record Interaction'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* All Pets in System */}
          <div style={{ 
            border: '2px solid #eaeaea', 
            borderRadius: '12px', 
            padding: '30px',
            marginTop: '30px'
          }}>
            <h2>🌐 All Pets in System ({allPets.length})</h2>
            {allPets.length === 0 ? (
              <p style={{ color: '#666' }}>No pets created yet.</p>
            ) : (
              <div style={{ display: 'grid', gap: '10px', marginTop: '20px' }}>
                {allPets.map((pet, idx) => (
                  <div 
                    key={idx}
                    onClick={() => viewPet(pet.address)}
                    style={{
                      padding: '15px',
                      background: selectedPet?.address === pet.address ? '#e3f2fd' : 'white',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = selectedPet?.address === pet.address ? '#e3f2fd' : '#f5f5f5'}
                    onMouseLeave={(e) => e.currentTarget.style.background = selectedPet?.address === pet.address ? '#e3f2fd' : 'white'}
                  >
                    <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '5px', color: '#10b981' }}>
                      🐾 {pet.name}
                    </div>
                    <code style={{ fontSize: '12px', color: '#666' }}>{pet.address}</code>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contract Info */}
      <div style={{ 
        marginTop: '40px', 
        padding: '20px', 
        background: '#f0f9ff', 
        border: '1px solid #0ea5e9',
        borderRadius: '8px'
      }}>
        <h3>🔗 Contract Information:</h3>
        <p><strong>Network:</strong> Base Sepolia (Chain ID: 84532)</p>
        <p><strong>Registry Address:</strong> <code>{REGISTRY_ADDRESS.address}</code></p>
        <p><strong>System:</strong> Dynamic pet contracts (each pet = unique contract name)</p>
        <p>
          <a 
            href={`https://base-sepolia.blockscout.com/address/${REGISTRY_ADDRESS.address}`} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: '#0070f3' }}
          >
            View Registry on Blockscout →
          </a>
        </p>
      </div>

      {/* Instructions */}
      <div style={{ 
        marginTop: '20px', 
        padding: '20px', 
        background: '#fffbeb', 
        border: '1px solid #fbbf24',
        borderRadius: '8px'
      }}>
        <h3>📖 Instructions:</h3>
        <ol style={{ lineHeight: '1.8' }}>
          <li>Make sure you're connected to <strong>Base Sepolia</strong> network in MetaMask</li>
          <li>Click "Connect Wallet" to connect your wallet</li>
          <li>Open browser console (F12) to see debug logs</li>
          <li>Enter a unique pet name and click "Create Pet"</li>
          <li>Wait for the transaction to confirm</li>
          <li>Click on your pet to view details and log activities</li>
        </ol>
        
        <h4 style={{ marginTop: '20px' }}>⚠️ Troubleshooting:</h4>
        <ul style={{ lineHeight: '1.8' }}>
          <li>If you see "could not decode result data" or "missing revert data":
            <ul>
              <li>✅ You're on Base Sepolia (not Ethereum Sepolia or other network)</li>
              <li>✅ The contract exists at the address (click BaseScan link above)</li>
              <li>✅ Browser console shows "Contract code length: &gt; 2"</li>
              <li>🔄 <strong>The app will automatically retry 3 times</strong> with exponential backoff</li>
              <li>⏱️ If RPC is slow, wait a few seconds - retries happen automatically</li>
            </ul>
          </li>
          <li>Get testnet tokens from the PetPet faucet</li>
          <li><strong>Network Instability:</strong> The PetPet testnet RPC can be unstable. All contract calls now retry automatically up to 3 times.</li>
        </ul>
      </div>
    </div>
  );
}

