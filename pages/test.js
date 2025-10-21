import { useState } from 'react';
import { ethers } from 'ethers';
import REGISTRY_ABI from '../utils/abi.json';

// Your deployed PetRegistry address on Base Sepolia
const REGISTRY_ADDRESS = '0xaC73F8dB1AdaB4bbf3Ec511e2E078ab78c51a789';

// Base Sepolia RPC URL (fallback)
const BASE_SEPOLIA_RPC = 'https://sepolia.base.org';

// Pet contract ABI (minimal - just what we need)
const PET_ABI = [
  {
    "inputs": [],
    "name": "petName",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "duration", "type": "uint256" }],
    "name": "walk",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "duration", "type": "uint256" }],
    "name": "run",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }],
    "name": "eat",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }],
    "name": "drink",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getStats",
    "outputs": [
      { "internalType": "uint256", "name": "walks", "type": "uint256" },
      { "internalType": "uint256", "name": "runs", "type": "uint256" },
      { "internalType": "uint256", "name": "rests", "type": "uint256" },
      { "internalType": "uint256", "name": "food", "type": "uint256" },
      { "internalType": "uint256", "name": "water", "type": "uint256" },
      { "internalType": "uint256", "name": "interactions", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export default function TestPage() {
  const [account, setAccount] = useState(null);
  const [petName, setPetName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [myPets, setMyPets] = useState([]);
  const [allPets, setAllPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [petStats, setPetStats] = useState(null);

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
      const code = await provider.getCode(REGISTRY_ADDRESS);
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

  // Load user's pets and all pets
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
        setMessage('❌ Contract not found! Make sure you deployed to Base Sepolia at: ' + REGISTRY_ADDRESS);
        return;
      }
      
      const registry = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, provider);
      console.log('Registry contract created');
      
      // Get total count
      const count = await registry.getPetCount();
      console.log('Total pet count:', count.toString());
      
      // Get user's pets
      const userPets = await registry.getPetsByOwner(userAddress);
      console.log('User pets:', userPets);
      setMyPets(userPets);
      
      // Get all pets
      const all = await registry.getAllPets();
      console.log('All pets:', all);
      setAllPets(all);
      
      setMessage(`📊 Total pets in system: ${count.toString()} | Your pets: ${userPets.length}`);
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
      setMessage('🔄 Compiling contract for pet "' + petName + '"...');

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const registry = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, signer);

      // Check if name is available
      const available = await registry.isPetNameAvailable(petName);
      if (!available) {
        setMessage('❌ Pet name already taken!');
        setLoading(false);
        return;
      }

      // Deploy pet via backend API
      setMessage('⏳ Deploying contract (this may take 30-60 seconds)...');
      
      const deployResponse = await fetch('/api/deploy-pet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          petName: petName,
          ownerAddress: account 
        }),
      });

      const deployResult = await deployResponse.json();
      
      if (!deployResult.success) {
        throw new Error(deployResult.error || 'Deployment failed');
      }

      const petAddress = deployResult.address;
      console.log('Pet deployed at:', petAddress);
      setMessage(`✅ Contract deployed! Registering in registry...`);

      // Register the pet in the registry
      const tx = await registry.registerPet(petName, petAddress, account);
      setMessage('⏳ Registering pet...');
      await tx.wait();

      setMessage(`✅ Pet "${petName}" (contract ${deployResult.contractName}) created at ${petAddress}`);
      
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
              contractName: deployResult.contractName
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
      setMessage('❌ Error: ' + (error.message || 'Failed to create pet'));
    } finally {
      setLoading(false);
    }
  };

  // View pet details
  const viewPet = async (petAddress) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const pet = new ethers.Contract(petAddress, PET_ABI, provider);
      
      const name = await pet.petName();
      const owner = await pet.owner();
      const stats = await pet.getStats();
      
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
      setMessage('❌ Error loading pet details');
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

  // Log activity
  const logActivity = async (type, value) => {
    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const pet = new ethers.Contract(selectedPet.address, PET_ABI, signer);
      
      let tx;
      if (type === 'walk') tx = await pet.walk(value);
      else if (type === 'run') tx = await pet.run(value);
      else if (type === 'eat') tx = await pet.eat(value);
      else if (type === 'drink') tx = await pet.drink(value);
      
      setMessage('⏳ Logging activity...');
      await tx.wait();
      setMessage(`✅ Activity logged!`);
      
      // Refresh pet stats
      viewPet(selectedPet.address);
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
        Connected to Base Sepolia | Registry: <code>{REGISTRY_ADDRESS}</code>
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
          <p style={{ color: 'green', marginBottom: '20px' }}>{message}</p>
          
          {/* Create Pet Section */}
          <div style={{ 
            border: '2px solid #eaeaea', 
            borderRadius: '12px', 
            padding: '30px',
            marginBottom: '30px',
            background: '#fafafa'
          }}>
            <h2>➕ Create New Pet</h2>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <input
                type="text"
                placeholder="Enter pet name"
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
            <h2>🐕 My Pets ({myPets.length})</h2>
            {myPets.length === 0 ? (
              <p style={{ color: '#666' }}>You haven't created any pets yet.</p>
            ) : (
              <div style={{ display: 'grid', gap: '10px', marginTop: '20px' }}>
                {myPets.map((petAddr, idx) => (
                  <div 
                    key={idx}
                    onClick={() => viewPet(petAddr)}
                    style={{
                      padding: '15px',
                      background: selectedPet?.address === petAddr ? '#e3f2fd' : 'white',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <code>{petAddr}</code>
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
                {allPets.map((petAddr, idx) => (
                  <div 
                    key={idx}
                    onClick={() => viewPet(petAddr)}
                    style={{
                      padding: '15px',
                      background: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <code>{petAddr}</code>
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
        <p><strong>Registry Address:</strong> <code>{REGISTRY_ADDRESS}</code></p>
        <p><strong>System:</strong> Dynamic pet contracts (each pet = unique contract name)</p>
        <p>
          <a 
            href={`https://base-sepolia.blockscout.com/address/${REGISTRY_ADDRESS}`} 
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
          <li>If you see "could not decode result data", check:
            <ul>
              <li>✅ You're on Base Sepolia (not Ethereum Sepolia or other network)</li>
              <li>✅ The contract exists at the address (click BaseScan link above)</li>
              <li>✅ Browser console shows "Contract code length: &gt; 2"</li>
            </ul>
          </li>
          <li>Get testnet ETH: <a href="https://www.coinbase.com/faucets/base-ethereum-goerli-faucet" target="_blank" rel="noopener noreferrer" style={{ color: '#0070f3' }}>Base Sepolia Faucet</a></li>
        </ul>
      </div>
    </div>
  );
}

