# PetPet Smart Contracts - Deployment Guide

## 🚀 Quick Deployment Steps

### Step 1: Compile Contracts

```bash
cd smartcontract
npx hardhat build
```

Expected output:
```
Compiled 3 Solidity files with solc 0.8.28
```

### Step 2: Run Tests

```bash
npx hardhat test
```

Expected output:
```
36 passing (Solidity tests)
44 passing (TypeScript tests)
```

### Step 3: Deploy to Local Network (Testing)

```bash
npx hardhat run scripts/interact-pet.ts
```

This will:
- Deploy PetFactory
- Create sample pets ("Buddy" and "Max")
- Log activities
- Display statistics

---

## 🌐 Deploy to Base Sepolia Testnet

### Prerequisites

1. **Get a wallet with testnet ETH:**
   - Visit [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
   - Enter your wallet address
   - Receive testnet ETH

2. **Create `.env` file** in `smartcontract/` directory:
   ```bash
   BASE_RPC_URL=https://sepolia.base.org
   PRIVATE_KEY=your_private_key_without_0x_prefix
   ```

   ⚠️ **IMPORTANT:** Never commit `.env` to git! It's already in `.gitignore`.

### Deploy PetFactory

```bash
npx hardhat ignition deploy ignition/modules/PetFactory.ts --network baseSepolia
```

Expected output:
```
[ PetFactoryModule ] successfully deployed 🚀

Deployed Addresses
PetFactoryModule#PetFactory - 0x1234...5678
```

**Save this address!** You'll need it for your frontend application.

### Verify on BaseScan (Optional)

```bash
npx hardhat ignition verify baseSepolia
```

Your contract will be verified and viewable at:
`https://sepolia.basescan.org/address/YOUR_CONTRACT_ADDRESS`

---

## 📦 Using Deployed Contracts

### From TypeScript/JavaScript

```typescript
import { ethers } from "ethers";

// Connect to Base Sepolia
const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Get PetFactory instance
const FACTORY_ADDRESS = "0x1234...5678"; // From deployment
const factory = new ethers.Contract(
  FACTORY_ADDRESS,
  PetFactoryABI,
  wallet
);

// Create a pet
const tx = await factory.addPet("Buddy");
await tx.wait();
console.log("Pet created!");

// Get pet address
const petAddress = await factory.getPetByName("Buddy");
const pet = new ethers.Contract(petAddress, PetABI, wallet);

// Log activities
await pet.walk(1800); // 30 minutes
await pet.eat(200);   // 200 grams
```

### Get Contract ABIs

After building, ABIs are in:
```
smartcontract/artifacts/contracts/PetFactory.sol/PetFactory.json
smartcontract/artifacts/contracts/Pet.sol/Pet.json
```

Extract the ABI field from these JSON files for your frontend.

---

## 🎯 Deployment Checklist

- [ ] Contracts compile without errors
- [ ] All tests pass (44/44)
- [ ] `.env` file created with testnet credentials
- [ ] Wallet has Base Sepolia ETH
- [ ] Deploy PetFactory to Base Sepolia
- [ ] Save deployed contract address
- [ ] Verify contract on BaseScan (optional)
- [ ] Test creating a pet on testnet
- [ ] Extract ABIs for frontend integration
- [ ] Update frontend with contract address

---

## 🔍 Verify Deployment

After deploying, verify it works:

```typescript
// Create test-deployment.ts
import { ethers } from "hardhat";

async function main() {
  const factoryAddress = "YOUR_DEPLOYED_ADDRESS";
  const factory = await ethers.getContractAt("PetFactory", factoryAddress);
  
  // Check it works
  const count = await factory.getPetCount();
  console.log("Current pet count:", count.toString());
  
  // Create a test pet
  const tx = await factory.addPet("TestPet");
  await tx.wait();
  console.log("Test pet created!");
  
  const petAddress = await factory.getPetByName("TestPet");
  console.log("Test pet address:", petAddress);
}

main();
```

Run it:
```bash
npx hardhat run test-deployment.ts --network baseSepolia
```

---

## 📊 Gas Estimates

Based on Base Sepolia:

| Operation | Estimated Gas | Estimated Cost (at 0.001 Gwei) |
|-----------|--------------|-------------------------------|
| Deploy PetFactory | ~2,000,000 | ~$0.001 |
| Create Pet | ~500,000 | ~$0.0003 |
| Log Walk/Run/Rest | ~50,000 | ~$0.00003 |
| Log Eat/Drink | ~50,000 | ~$0.00003 |
| Log Interaction | ~60,000 | ~$0.00004 |

*Note: Base Sepolia is very cheap for testing. Mainnet costs may vary.*

---

## 🛠️ Troubleshooting

### "Insufficient funds"
- Get more testnet ETH from the faucet
- Check your wallet has Base Sepolia ETH (not Ethereum Sepolia)

### "Network connection failed"
- Check your RPC URL is correct
- Try the public endpoint: `https://sepolia.base.org`
- Or get a free RPC from [Alchemy](https://www.alchemy.com/) or [Infura](https://infura.io/)

### "Pet name already exists"
- Pet names are globally unique across the factory
- Try a different name
- Or check existing pets with `factory.getPetByName("name")`

### "Only owner can perform this action"
- Make sure you're calling from the pet owner's wallet
- The wallet that created the pet is the owner

---

## 🎉 Next Steps After Deployment

1. **Build Your Frontend:**
   - Use the deployed factory address
   - Import the contract ABIs
   - Connect with wagmi/ethers
   - Create a pet profile UI

2. **Integrate with Explorer:**
   - Set up Blockscout or custom indexer
   - Index PetCreated events
   - Index activity events (Walk, Run, etc.)
   - Build activity timeline UI

3. **Add Features:**
   - ZK proof integration
   - GPS device binding
   - ENS naming (buddy.petpet.eth)
   - Social features (follow pets, share activities)

---

## 📝 Production Deployment (Future)

When deploying to mainnet:

1. **Use production compiler profile:**
   ```bash
   npx hardhat build --profile production
   ```

2. **Audit your contracts:**
   - Get professional security audit
   - Run static analysis tools
   - Test extensively on testnet

3. **Use hardware wallet:**
   - Never use private keys in plaintext for mainnet
   - Use hardware wallet (Ledger/Trezor)
   - Or use Gnosis Safe multisig

4. **Deploy to Base Mainnet:**
   ```bash
   npx hardhat ignition deploy ignition/modules/PetFactory.ts --network baseMainnet
   ```

---

## 📞 Support

- Issues with Hardhat? Check [Hardhat Docs](https://hardhat.org/)
- Questions about deployment? See [Hardhat Ignition Docs](https://hardhat.org/ignition/docs/getting-started)
- Base Sepolia issues? Visit [Base Docs](https://docs.base.org/)

---

**Happy Deploying! 🚀**

