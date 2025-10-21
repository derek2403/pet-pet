# PetPet Smart Contracts

This is the smart contract component of the **PetPet** project - a pet-centric blockchain system where each pet has its own verifiable on-chain activity tracker.

Built with **Hardhat 3** using Solidity 0.8.28, TypeScript, and ethers.js v6.

---

## 🐾 What is PetPet?

PetPet is a factory-based smart contract system where:
- Each pet is deployed as a **separate contract instance**
- Pet owners can log verifiable activities: `walk()`, `run()`, `rest()`, `eat()`, `drink()`, `interact()`
- All activity data is **immutable and on-chain**
- Pet names are **globally unique** (case-insensitive)
- Each pet maintains **aggregated statistics** and complete **activity history**

Perfect for building pet care tracking apps, vet record systems, daycare verification, and more!

---

## 📁 Project Structure

```
smartcontract/
├── contracts/
│   ├── Pet.sol              # Individual pet contract
│   ├── PetFactory.sol       # Factory for deploying pets
│   ├── Pet.t.sol            # Solidity tests
│   └── PetFactory.t.sol     # Solidity tests
├── test/
│   └── PetFactory.ts        # TypeScript integration tests
├── ignition/modules/
│   └── PetFactory.ts        # Deployment module
├── scripts/
│   └── interact-pet.ts      # Example interaction script
├── PETPET_CONTRACTS.md      # Complete contract documentation
└── HARDHAT_V3_GUIDE.md      # Hardhat 3 guide
```

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Compile Contracts

```bash
npx hardhat build
```

### 3. Run Tests

```bash
# Run all tests (Solidity + TypeScript)
npx hardhat test

# Run only Solidity tests
npx hardhat test solidity

# Run only TypeScript tests
npx hardhat test nodejs
```

**Expected Output:** All 44 tests pass ✅

### 4. Try the Example Script

```bash
npx hardhat run scripts/interact-pet.ts
```

This script demonstrates:
- Deploying the PetFactory
- Creating two pets ("Buddy" and "Max")
- Logging a full day of activities
- Querying statistics and activity history
- Pet interactions

---

## 📚 Usage Examples

### Deploy PetFactory

```bash
# Local deployment (temporary)
npx hardhat ignition deploy ignition/modules/PetFactory.ts

# Deploy to Base Sepolia
npx hardhat ignition deploy ignition/modules/PetFactory.ts --network baseSepolia
```

### Interact with Contracts

```typescript
import { ethers } from "hardhat";

// Get PetFactory
const factory = await ethers.getContractAt("PetFactory", FACTORY_ADDRESS);

// Create a pet
await factory.addPet("Buddy");

// Get pet contract
const petAddress = await factory.getPetByName("Buddy");
const pet = await ethers.getContractAt("Pet", petAddress);

// Log activities
await pet.walk(1800);  // 30 minute walk
await pet.eat(200);    // 200g food
await pet.drink(500);  // 500ml water

// Get stats
const [walks, runs, rests, food, water, interactions] = await pet.getStats();
```

For complete examples and API documentation, see [PETPET_CONTRACTS.md](./PETPET_CONTRACTS.md).

---

## 🎯 Key Features

### Pet Contract Features
- ✅ **6 Activity Types:** Walk, Run, Rest, Eat, Drink, Interact
- ✅ **Automatic Stats:** Real-time aggregation of all activities
- ✅ **Full History:** Retrieve any or all past activities
- ✅ **Ownership Transfer:** Transfer pet to new owner
- ✅ **Access Control:** Only owner can log activities
- ✅ **Events:** All activities emit events for indexing

### PetFactory Features
- ✅ **Unique Names:** Case-insensitive duplicate prevention
- ✅ **Name Validation:** Length and format checks
- ✅ **Multi-Owner Support:** Track pets by owner
- ✅ **Global Registry:** Query all pets in the system
- ✅ **Pet Info:** Get complete pet details in one call

---

## 🧪 Testing

The project includes comprehensive test suites:

**36 Solidity Tests** (Foundry-compatible):
- Fast EVM-native testing
- Fuzz testing for walk/eat activities
- Edge case validation

**44+ TypeScript Tests** (Mocha + ethers.js):
- Integration testing
- Event verification
- Multi-contract interactions

### Run Tests

```bash
# All tests
npx hardhat test

# With gas reporting
npx hardhat test --gas-reporter

# Specific test file
npx hardhat test test/PetFactory.ts
```

---

## 🌐 Network Deployment

### Base Sepolia (Recommended for Testing)

1. Create `.env` file:
```bash
BASE_RPC_URL=https://sepolia.base.org
PRIVATE_KEY=your_private_key_here
```

2. Get testnet ETH from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)

3. Deploy:
```bash
npx hardhat ignition deploy ignition/modules/PetFactory.ts --network baseSepolia
```

4. Save the deployed address for your frontend!

### Ethereum Sepolia

```bash
# Set configuration variables
npx hardhat vars set SEPOLIA_RPC_URL
npx hardhat vars set SEPOLIA_PRIVATE_KEY

# Deploy
npx hardhat ignition deploy ignition/modules/PetFactory.ts --network sepolia
```

---

## 📖 Documentation

- **[PETPET_CONTRACTS.md](./PETPET_CONTRACTS.md)** - Complete contract documentation
  - API reference
  - Usage examples
  - Security features
  - Future enhancements

- **[HARDHAT_V3_GUIDE.md](./HARDHAT_V3_GUIDE.md)** - Hardhat 3 guide
  - Configuration details
  - Network setup
  - Testing strategies
  - Command reference

---

## 🔥 Example Output

When you run `scripts/interact-pet.ts`:

```
🐾 PetPet Contract Interaction Script

📦 Deploying PetFactory...
PetFactory deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3

🐕 Creating pet 'Buddy'...
✅ Pet 'Buddy' created!

📊 Buddy's Daily Statistics:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Walk Time:        4200 seconds (70 minutes)
Total Run Time:          900 seconds (15 minutes)
Total Rest Time:       36000 seconds (10 hours)
Total Food:              450 grams
Total Water:             700 ml
Total Interactions:        1
Total Activities:         10
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🛠️ Common Commands

```bash
# Development
npx hardhat build              # Compile contracts
npx hardhat test               # Run all tests
npx hardhat clean              # Clean artifacts

# Deployment
npx hardhat ignition deploy ignition/modules/PetFactory.ts
npx hardhat ignition deploy ignition/modules/PetFactory.ts --network baseSepolia

# Scripts
npx hardhat run scripts/interact-pet.ts
npx hardhat run scripts/interact-pet.ts --network baseSepolia
```

---

## 🔐 Security

- ✅ All inputs validated (positive values, non-zero addresses)
- ✅ Owner-only access control for activities
- ✅ Case-insensitive duplicate name prevention
- ✅ Safe ownership transfer with validation
- ✅ No external dependencies (pure Solidity)

---

## 🎓 Learn More

- [Hardhat 3 Documentation](https://hardhat.org/hardhat-runner/docs/getting-started)
- [Hardhat Ignition Deployment](https://hardhat.org/ignition/docs/getting-started)
- [Ethers.js v6 Documentation](https://docs.ethers.org/v6/)
- [Solidity Documentation](https://docs.soliditylang.org/)

---

## 📝 License

MIT

---

## 🤝 Contributing

This is part of the PetPet project. Questions or feedback? Open an issue or join our community!

---

**Built with ❤️ using Hardhat 3 | Ready for Base Sepolia Deployment**
