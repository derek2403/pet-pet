# PetPet Smart Contracts

## 🐾 Overview

The PetPet smart contract system consists of two main contracts:

1. **Pet.sol** - Individual pet contract that tracks all activities and interactions
2. **PetFactory.sol** - Factory contract for creating and managing Pet contracts

Each pet is deployed as a separate contract instance with its own unique name, allowing for decentralized, verifiable pet care tracking.

---

## 📋 Contract Architecture

### Pet Contract

Each pet is represented by a unique contract instance with the following features:

**Identity:**
- Unique pet name (immutable)
- Owner address (transferable)
- Creation timestamp

**Activities Tracked:**
- **Walk** - Duration in seconds
- **Run** - Duration in seconds
- **Rest** - Duration in seconds
- **Eat** - Amount in grams
- **Drink** - Amount in milliliters
- **Interact** - Duration with another pet contract

**Stats Aggregation:**
- Total walk time
- Total run time
- Total rest time
- Total food consumed
- Total water consumed
- Total interaction count

### PetFactory Contract

The factory manages all pet contract deployments:

**Features:**
- Deploy new Pet contracts
- Enforce unique pet names (case-insensitive)
- Track all pets by owner
- Track all pets globally
- Query pet information

---

## 🚀 Deployment

### Deploy the PetFactory

```bash
# Deploy to local network (temporary)
npx hardhat ignition deploy ignition/modules/PetFactory.ts

# Deploy to Base Sepolia testnet
npx hardhat ignition deploy ignition/modules/PetFactory.ts --network baseSepolia

# Deploy with production profile (optimized)
npx hardhat ignition deploy ignition/modules/PetFactory.ts --network baseSepolia --profile production
```

After deployment, you'll get the PetFactory address:
```
Deployed Addresses
PetFactoryModule#PetFactory - 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

---

## 💻 Usage Examples

### 1. Create a New Pet

```typescript
import { ethers } from "hardhat";

// Get the deployed PetFactory
const petFactory = await ethers.getContractAt(
  "PetFactory", 
  "0x5FbDB2315678afecb367f032d93F642f64180aa3"
);

// Check if name is available
const isAvailable = await petFactory.isPetNameAvailable("Buddy");
console.log("Name available:", isAvailable);

// Create a new pet
const tx = await petFactory.addPet("Buddy");
await tx.wait();

// Get the pet contract address
const petAddress = await petFactory.getPetByName("Buddy");
console.log("Pet contract deployed at:", petAddress);

// Get the Pet contract instance
const pet = await ethers.getContractAt("Pet", petAddress);
```

### 2. Log Pet Activities

```typescript
// Log a 30-minute walk (1800 seconds)
await pet.walk(1800);

// Log a 10-minute run (600 seconds)
await pet.run(600);

// Log 2 hours of rest (7200 seconds)
await pet.rest(7200);

// Log eating 200 grams of food
await pet.eat(200);

// Log drinking 500ml of water
await pet.drink(500);
```

### 3. Log Pet Interactions

```typescript
// Create another pet
await petFactory.addPet("Max");
const maxAddress = await petFactory.getPetByName("Max");

// Log 20-minute interaction (1200 seconds)
await pet.interact(maxAddress, 1200);
```

### 4. Query Pet Statistics

```typescript
// Get aggregated stats
const [walks, runs, rests, food, water, interactions] = 
  await pet.getStats();

console.log({
  totalWalkTime: walks.toString(), // seconds
  totalRunTime: runs.toString(),   // seconds
  totalRestTime: rests.toString(), // seconds
  totalFood: food.toString(),      // grams
  totalWater: water.toString(),    // ml
  interactions: interactions.toString()
});

// Get activity count
const activityCount = await pet.getActivityCount();
console.log("Total activities:", activityCount.toString());
```

### 5. Retrieve Activity History

```typescript
// Get a specific activity by ID
const activity = await pet.getActivity(0);
console.log({
  activityType: activity.activityType,
  duration: activity.duration.toString(),
  timestamp: new Date(Number(activity.timestamp) * 1000),
  interactedWith: activity.interactedWith,
  metadata: activity.metadata
});

// Get all activities
const allActivities = await pet.getAllActivities();
for (const activity of allActivities) {
  console.log(activity.activityType, "-", activity.duration.toString());
}
```

### 6. Query All Pets

```typescript
// Get all your pets
const [owner] = await ethers.getSigners();
const myPets = await petFactory.getPetsByOwner(owner.address);
console.log("My pets:", myPets);

// Get all pets in the system
const allPets = await petFactory.getAllPets();
console.log("Total pets:", allPets.length);

// Get pet info
const [petName, petOwner, createdAt, activityCount] = 
  await petFactory.getPetInfo(petAddress);
console.log({
  name: petName,
  owner: petOwner,
  created: new Date(Number(createdAt) * 1000),
  activities: activityCount.toString()
});
```

### 7. Transfer Pet Ownership

```typescript
const [owner, newOwner] = await ethers.getSigners();

// Transfer to new owner
await pet.connect(owner).transferOwnership(newOwner.address);

// New owner can now log activities
await pet.connect(newOwner).walk(1800);
```

---

## 🔥 Complete Example Script

```typescript
import { ethers } from "hardhat";

async function main() {
  // Deploy PetFactory
  const PetFactory = await ethers.getContractFactory("PetFactory");
  const factory = await PetFactory.deploy();
  await factory.waitForDeployment();
  console.log("PetFactory deployed to:", await factory.getAddress());

  // Create a pet
  const tx = await factory.addPet("Buddy");
  await tx.wait();
  console.log("Pet 'Buddy' created!");

  // Get pet contract
  const petAddress = await factory.getPetByName("Buddy");
  const pet = await ethers.getContractAt("Pet", petAddress);

  // Log a full day of activities
  await pet.walk(1800);  // 30 min morning walk
  await pet.eat(200);    // 200g breakfast
  await pet.drink(300);  // 300ml water
  await pet.rest(7200);  // 2 hours rest
  await pet.run(900);    // 15 min run
  await pet.eat(250);    // 250g dinner
  await pet.drink(400);  // 400ml water
  await pet.rest(28800); // 8 hours sleep

  // Get stats
  const [walks, runs, rests, food, water] = await pet.getStats();
  console.log({
    walks: walks.toString(),
    runs: runs.toString(),
    rests: rests.toString(),
    food: food.toString(),
    water: water.toString()
  });
}

main();
```

---

## 🧪 Testing

### Run All Tests

```bash
# Run both Solidity and TypeScript tests
npx hardhat test

# Run only Solidity tests
npx hardhat test solidity

# Run only TypeScript tests
npx hardhat test nodejs
```

### Test Coverage

The contracts include comprehensive test suites:

**PetFactory Tests:**
- ✅ Pet creation and deployment
- ✅ Name uniqueness (case-insensitive)
- ✅ Name validation (length, empty)
- ✅ Multi-owner tracking
- ✅ Pet queries (by name, by owner, all pets)
- ✅ Pet info retrieval

**Pet Tests:**
- ✅ All activity types (walk, run, rest, eat, drink, interact)
- ✅ Stats aggregation
- ✅ Activity history retrieval
- ✅ Ownership transfer
- ✅ Access control (owner-only)
- ✅ Input validation
- ✅ Fuzz testing

---

## 📊 Contract Functions Reference

### PetFactory

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `addPet` | `string petName` | `address` | Deploy new Pet contract |
| `isPetNameAvailable` | `string petName` | `bool` | Check name availability |
| `getPetByName` | `string petName` | `address` | Get pet contract by name |
| `getPetsByOwner` | `address owner` | `address[]` | Get all pets owned by address |
| `getAllPets` | - | `address[]` | Get all pet contracts |
| `getPetCount` | - | `uint256` | Get total pet count |
| `getPetInfo` | `address petContract` | `(string, address, uint256, uint256)` | Get pet details |

### Pet

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `walk` | `uint256 duration` | - | Log walk activity (seconds) |
| `run` | `uint256 duration` | - | Log run activity (seconds) |
| `rest` | `uint256 duration` | - | Log rest activity (seconds) |
| `eat` | `uint256 amount` | - | Log eating (grams) |
| `drink` | `uint256 amount` | - | Log drinking (ml) |
| `interact` | `address otherPet, uint256 duration` | - | Log interaction with another pet |
| `getStats` | - | `(uint256, uint256, uint256, uint256, uint256, uint256)` | Get aggregated stats |
| `getActivityCount` | - | `uint256` | Get total activity count |
| `getActivity` | `uint256 activityId` | `ActivityLog` | Get specific activity |
| `getAllActivities` | - | `ActivityLog[]` | Get all activities |
| `transferOwnership` | `address newOwner` | - | Transfer pet ownership |

---

## 📝 Events

### PetFactory Events

```solidity
event PetCreated(
    string indexed petName,
    address indexed petContract,
    address indexed owner,
    uint256 timestamp
);
```

### Pet Events

```solidity
event Walk(uint256 indexed activityId, uint256 duration, uint256 timestamp);
event Run(uint256 indexed activityId, uint256 duration, uint256 timestamp);
event Rest(uint256 indexed activityId, uint256 duration, uint256 timestamp);
event Eat(uint256 indexed activityId, uint256 amount, uint256 timestamp);
event Drink(uint256 indexed activityId, uint256 amount, uint256 timestamp);
event Interact(uint256 indexed activityId, address indexed otherPet, uint256 duration, uint256 timestamp);
```

---

## 🔐 Security Features

1. **Access Control** - Only pet owner can log activities
2. **Name Uniqueness** - Case-insensitive duplicate prevention
3. **Input Validation** - All inputs validated (positive values, valid addresses)
4. **Immutable Identity** - Pet name cannot be changed after creation
5. **Safe Transfers** - Ownership transfers include zero-address checks

---

## 🎯 Use Cases

### For Pet Owners
- Track daily activity patterns
- Monitor feeding and hydration
- Log social interactions
- Maintain verifiable care history
- Share pet data with vets/caretakers

### For Vets & Boarders
- Access complete care history
- Verify feeding schedules
- Track recovery progress
- Add treatment records

### For Pet Communities
- Discover pets in your area
- Verify adoption care claims
- Build trust through transparency
- Social pet interactions

---

## 🚧 Future Enhancements

The current implementation provides the foundation for:

1. **Zero-Knowledge Proofs** - Privacy-preserving activity verification
2. **GPS Integration** - Location-based activity tracking
3. **IoT Device Binding** - Smart collar/feeder integration
4. **ENS Integration** - `buddy.petpet.eth` naming
5. **Attestations** - Vet/caretaker signed records
6. **NFT Metadata** - Link pets to visual NFTs
7. **Activity Challenges** - Anti-spoofing mechanisms

---

## 📄 License

MIT License

---

## 🤝 Contributing

This is part of the PetPet project. For questions or contributions, please refer to the main project repository.

---

**Built with Hardhat v3 | Optimized for Base Sepolia**

