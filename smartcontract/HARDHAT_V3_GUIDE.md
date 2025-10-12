# Hardhat v3 Complete Guide

## 🚀 Overview

This project uses **Hardhat v3**, a modern Ethereum development environment. This guide covers everything you need to know about how Hardhat v3 works in this project.

---

## 📁 Project Structure

```
smartcontract/
├── contracts/           # Solidity smart contracts
│   ├── Counter.sol     # Main contract
│   └── Counter.t.sol   # Solidity tests (new in v3!)
├── test/               # TypeScript/JavaScript tests
│   └── Counter.ts      # Integration tests using Mocha
├── ignition/           # Hardhat Ignition deployment modules
│   └── modules/
│       └── Counter.ts  # Deployment configuration
├── scripts/            # Custom automation scripts
│   └── send-op-tx.ts   # Example script
├── hardhat.config.ts   # Main configuration file
├── package.json        # Dependencies
└── tsconfig.json       # TypeScript configuration
```

---

## 🔧 Configuration (hardhat.config.ts)

### Plugins
```typescript
plugins: [hardhatToolboxMochaEthersPlugin]
```
This includes multiple plugins bundled together for testing with Mocha and ethers.js.

### Solidity Compiler Profiles
```typescript
solidity: {
  profiles: {
    default: {
      version: "0.8.28",
    },
    production: {
      version: "0.8.28",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  },
}
```
- **default**: Standard compilation for development
- **production**: Optimized compilation for deployment

To use production profile: `npx hardhat build --profile production`

### Networks
Your project has 5 configured networks:

#### 1. hardhatMainnet (Default Local)
```typescript
hardhatMainnet: {
  type: "edr-simulated",
  chainType: "l1",
}
```
- Simulated Ethereum L1 mainnet
- In-memory, fast, resets on restart
- Default network when you don't specify `--network`

#### 2. hardhatOp (Local Optimism)
```typescript
hardhatOp: {
  type: "edr-simulated",
  chainType: "op",
}
```
- Simulated Optimism L2 network
- Useful for testing L2-specific features

#### 3. sepolia (Ethereum Testnet)
```typescript
sepolia: {
  type: "http",
  chainType: "l1",
  url: configVariable("SEPOLIA_RPC_URL"),
  accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
}
```
- Real Ethereum testnet
- Requires RPC URL and private key
- See "Deploying to Real Networks" section below

#### 4. baseSepolia (Base Testnet)
```typescript
baseSepolia: {
  type: "http",
  chainType: "op",
  url: process.env.BASE_RPC_URL || "https://sepolia.base.org",
  accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
  chainId: 84532,
}
```
- Base L2 testnet (Optimism-based)
- Uses `.env` file for configuration
- Chain ID: 84532
- Free RPC endpoint available
- Get Base Sepolia ETH from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)

---

## 📝 Smart Contracts

### Main Contract: Counter.sol
Located in `contracts/Counter.sol`

**Features:**
- `uint public x` - Counter variable
- `inc()` - Increment by 1
- `incBy(uint by)` - Increment by N (must be > 0)
- `event Increment(uint by)` - Emitted on each increment

**Example:**
```solidity
contract Counter {
  uint public x;
  
  event Increment(uint by);
  
  function inc() public {
    x++;
    emit Increment(1);
  }
  
  function incBy(uint by) public {
    require(by > 0, "incBy: increment should be positive");
    x += by;
    emit Increment(by);
  }
}
```

---

## 🧪 Testing

Hardhat v3 supports **two types of tests**:

### 1. Solidity Tests (NEW in v3!)
**File:** `contracts/Counter.t.sol`

**Features:**
- Fast, EVM-native tests
- Uses Foundry-compatible syntax
- Access to cheatcodes (via `vm`)
- Supports fuzz testing

**Run Solidity tests only:**
```bash
npx hardhat test solidity
```

**Example Test:**
```solidity
contract CounterTest is Test {
  Counter counter;
  
  function setUp() public {
    counter = new Counter();
  }
  
  function test_InitialValue() public view {
    require(counter.x() == 0, "Initial value should be 0");
  }
  
  // Fuzz test - runs 256 times with random inputs
  function testFuzz_Inc(uint8 x) public {
    for (uint8 i = 0; i < x; i++) {
      counter.inc();
    }
    require(counter.x() == x, "Value should match");
  }
}
```

### 2. TypeScript Tests
**File:** `test/Counter.ts`

**Features:**
- Complex test logic
- Realistic blockchain simulation
- Multiple transactions
- Event testing

**Run TypeScript tests only:**
```bash
npx hardhat test nodejs
```

**Run all tests:**
```bash
npx hardhat test
```

---

## 🚀 Deployment with Hardhat Ignition

**Hardhat Ignition** is the official deployment system in v3. It's declarative, handles errors, and can resume interrupted deployments.

### Ignition Module: ignition/modules/Counter.ts

```typescript
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("CounterModule", (m) => {
  // Deploy the Counter contract
  const counter = m.contract("Counter");
  
  // Return the contract instance
  return { counter };
});
```

**Note:** You can optionally call functions after deployment:
```typescript
// To call a function after deployment
m.call(counter, "incBy", [5n]);
```

### Deployment Commands

#### Local Deployment (Temporary)
```bash
npx hardhat ignition deploy ignition/modules/Counter.ts
```
- Deploys to in-memory network
- Results are lost after process ends
- Perfect for testing deployment scripts

#### Deploy to Specific Network
```bash
# Deploy to local Optimism simulation
npx hardhat ignition deploy ignition/modules/Counter.ts --network hardhatOp

# Deploy to Sepolia testnet (requires setup - see below)
npx hardhat ignition deploy ignition/modules/Counter.ts --network sepolia
```

### Deployment Results
After deployment, you'll see:
```
[ CounterModule ] successfully deployed 🚀

Deployed Addresses
CounterModule#Counter - 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

Deployment info is saved in `ignition/deployments/` directory.

---

## 🌐 Deploying to Real Networks

### Setting Up Base Sepolia (Recommended)

1. **Create a `.env` file** in the `smartcontract/` directory:
```bash
# Base Sepolia RPC URL - Public endpoint (free)
BASE_RPC_URL=https://sepolia.base.org

# Your wallet private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here
```

2. **Get Base Sepolia ETH**:
   - Visit [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
   - Or bridge from Ethereum Sepolia

3. **Deploy**:
```bash
npx hardhat ignition deploy ignition/modules/Counter.ts --network baseSepolia
```

4. **View on BaseScan**:
   - Visit: https://sepolia.basescan.org/address/YOUR_CONTRACT_ADDRESS

### Setting Up Ethereum Sepolia Testnet

1. **Use Hardhat configuration variables**:
```bash
npx hardhat vars set SEPOLIA_RPC_URL
# Enter your Alchemy/Infura RPC URL when prompted

npx hardhat vars set SEPOLIA_PRIVATE_KEY
# Enter your wallet private key when prompted (stored encrypted)
```

2. **Get Sepolia ETH**:
   - Visit [Sepolia Faucet](https://sepoliafaucet.com/)
   - Or [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)

3. **Get RPC URL**:
   - Create free account on [Alchemy](https://www.alchemy.com/) or [Infura](https://infura.io/)
   - Create a new app for Sepolia
   - Copy the RPC URL

4. **Deploy**:
```bash
npx hardhat ignition deploy ignition/modules/Counter.ts --network sepolia
```

5. **Verify on Etherscan** (optional):
```bash
npx hardhat ignition verify sepolia
```

---

## 🛠️ Common Commands

### Compilation
```bash
# Compile contracts
npx hardhat build

# Compile with production profile (optimized)
npx hardhat build --profile production

# Force recompile
npx hardhat build --force
```

### Testing
```bash
# Run all tests (Solidity + TypeScript)
npx hardhat test

# Run only Solidity tests
npx hardhat test solidity

# Run only TypeScript tests
npx hardhat test nodejs

# Run specific test file
npx hardhat test test/Counter.ts

# Run tests with gas reporting
npx hardhat test --gas-reporter
```

### Deployment
```bash
# Deploy to local network (temporary)
npx hardhat ignition deploy ignition/modules/Counter.ts

# Deploy to specific network
npx hardhat ignition deploy ignition/modules/Counter.ts --network <network-name>

# Deploy with specific profile
npx hardhat ignition deploy ignition/modules/Counter.ts --profile production

# Verify deployment on Etherscan
npx hardhat ignition verify <network-name>
```

### Running Scripts
```bash
# Run a custom script
npx hardhat run scripts/send-op-tx.ts

# Run script on specific network
npx hardhat run scripts/send-op-tx.ts --network hardhatOp
```

### Network Management
```bash
# Start a persistent local node
npx hardhat node

# In another terminal, deploy to the persistent node
npx hardhat ignition deploy ignition/modules/Counter.ts --network localhost
```

### Other Utilities
```bash
# Show all available tasks
npx hardhat help

# Clean compiled artifacts
npx hardhat clean

# Get network information
npx hardhat network

# Check Hardhat version
npx hardhat --version
```

---

## 📦 Dependencies

Your project uses these main packages:

- **hardhat** (^3.0.7) - Core framework
- **@nomicfoundation/hardhat-ignition** (^3.0.3) - Deployment system
- **@nomicfoundation/hardhat-toolbox-mocha-ethers** (^3.0.0) - Testing toolkit
- **ethers** (^6.15.0) - Ethereum library
- **forge-std** - Foundry standard library for Solidity tests
- **mocha** (^11.7.4) - Test runner
- **chai** (^5.3.3) - Assertion library

---

## 🆚 Key Differences from Hardhat v2

### What's New in v3

1. **Native Solidity Tests**
   - Write tests in Solidity with `.t.sol` extension
   - Foundry-compatible syntax
   - Fuzz testing support

2. **Hardhat Ignition**
   - Declarative deployment system
   - Replaces custom deployment scripts
   - Better error handling and recovery

3. **Build Command**
   - `npx hardhat build` instead of `compile`
   - Support for compiler profiles

4. **EDR (Ethereum Development Runtime)**
   - Faster execution
   - Better simulation
   - New `edr-simulated` network type

5. **Modern Config Structure**
   - TypeScript-first configuration
   - Compiler profiles
   - `configVariable()` for secrets management

### Migration from v2

If you're coming from v2:
- Replace `npx hardhat compile` with `npx hardhat build`
- Use Ignition modules instead of `scripts/deploy.js`
- Update `hardhat.config.ts` to use new structure
- Consider adding Solidity tests alongside TypeScript tests

---

## 🎯 Common Workflows

### Development Workflow
```bash
# 1. Write your contract in contracts/
# 2. Compile
npx hardhat build

# 3. Write tests
# - Solidity tests in contracts/*.t.sol
# - TypeScript tests in test/*.ts

# 4. Run tests
npx hardhat test

# 5. Create deployment module in ignition/modules/

# 6. Test deployment locally
npx hardhat ignition deploy ignition/modules/Counter.ts
```

### Production Deployment Workflow
```bash
# 1. Compile with optimization
npx hardhat build --profile production

# 2. Run full test suite
npx hardhat test

# 3. Set up network credentials
npx hardhat vars set SEPOLIA_RPC_URL
npx hardhat vars set SEPOLIA_PRIVATE_KEY

# 4. Deploy to testnet
npx hardhat ignition deploy ignition/modules/Counter.ts --network sepolia

# 5. Verify on Etherscan
npx hardhat ignition verify sepolia

# 6. Test on testnet using scripts
npx hardhat run scripts/interact.ts --network sepolia
```

---

## 🔐 Security Best Practices

1. **Never commit private keys** - Use `npx hardhat vars` or `.env` files
2. **Add `.env` to `.gitignore`** - Already included in this project
3. **Use separate keys** - Different keys for testing vs production
4. **Verify contracts** - Always verify on Etherscan after deployment
5. **Test thoroughly** - Run both Solidity and TypeScript tests
6. **Use production profile** - Enable optimizer for mainnet deployments

---

## 📚 Additional Resources

- [Hardhat v3 Documentation](https://hardhat.org/hardhat-runner/docs/getting-started)
- [Hardhat Ignition Docs](https://hardhat.org/ignition/docs/getting-started)
- [Solidity Testing Guide](https://hardhat.org/hardhat-runner/docs/guides/test-contracts)
- [Ethers.js v6 Docs](https://docs.ethers.org/v6/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)

---

## 🐛 Troubleshooting

### "Cannot find module" errors
```bash
npm install
```

### Compilation errors
```bash
npx hardhat clean
npx hardhat build --force
```

### Network connection issues
- Check RPC URL is correct
- Verify you have testnet ETH
- Check private key is set correctly

### Tests failing
- Make sure contracts are compiled: `npx hardhat build`
- Check if using correct network
- Review test output for specific errors

---

## 💡 Tips

1. **Use Hardhat Network** - The default local network is perfect for rapid development
2. **Write Both Test Types** - Solidity for unit tests, TypeScript for integration tests
3. **Use Ignition** - Much better than custom deployment scripts
4. **Enable Optimizer for Production** - Use `--profile production`
5. **Keep Deployments** - The `ignition/deployments/` folder contains deployment history
6. **Use TypeScript** - Better type safety and IDE support

---

## 🎓 Next Steps

1. **Customize the Counter contract** - Add more features
2. **Write more tests** - Cover edge cases
3. **Create interaction scripts** - Scripts to call contract functions
4. **Deploy to testnet** - Practice real deployment
5. **Learn about upgradeable contracts** - Using OpenZeppelin
6. **Explore plugins** - Gas reporter, contract sizer, etc.

---

**Happy Building! 🚀**

For questions or issues, check the [Hardhat GitHub Discussions](https://github.com/NomicFoundation/hardhat/discussions)

---

## 📋 Complete Command Cheatsheet

### 🚀 Project Setup
```bash
# Create new Hardhat project
npx hardhat init

# Install dependencies
npm install

# Install additional packages
npm install --save-dev dotenv
npm install --save-dev @nomicfoundation/hardhat-ignition
```

### 🔨 Compilation
```bash
# Compile contracts (default profile)
npx hardhat build

# Compile with production optimization
npx hardhat build --profile production

# Force recompile
npx hardhat build --force

# Clean artifacts
npx hardhat clean
```

### 🧪 Testing
```bash
# Run all tests (Solidity + TypeScript)
npx hardhat test

# Run only Solidity tests
npx hardhat test solidity

# Run only TypeScript/Node.js tests
npx hardhat test nodejs

# Run specific test file
npx hardhat test test/Counter.ts

# Run tests with gas reporting
npx hardhat test --gas-reporter

# Run tests with coverage
npx hardhat coverage
```

### 🚀 Deployment
```bash
# Deploy to local temporary network
npx hardhat ignition deploy ignition/modules/Counter.ts

# Deploy to Base Sepolia testnet
npx hardhat ignition deploy ignition/modules/Counter.ts --network baseSepolia

# Deploy to Ethereum Sepolia testnet
npx hardhat ignition deploy ignition/modules/Counter.ts --network sepolia

# Deploy to local Optimism simulation
npx hardhat ignition deploy ignition/modules/Counter.ts --network hardhatOp

# Deploy with production profile (optimized)
npx hardhat ignition deploy ignition/modules/Counter.ts --network baseSepolia --profile production

# Check deployment status
npx hardhat ignition status chain-84532
```

### ✅ Verification
```bash
# Verify contract on Etherscan/BaseScan
npx hardhat ignition verify <network-name>

# Verify on Base Sepolia
npx hardhat ignition verify baseSepolia

# Verify on Ethereum Sepolia
npx hardhat ignition verify sepolia
```

### 🌐 Network Management
```bash
# Start persistent local Hardhat node
npx hardhat node

# Run script on specific network
npx hardhat run scripts/my-script.ts --network baseSepolia

# Get network information
npx hardhat network
```

### 🔐 Configuration & Secrets
```bash
# Set configuration variable (encrypted storage)
npx hardhat vars set VARIABLE_NAME

# Get configuration variable
npx hardhat vars get VARIABLE_NAME

# List all configuration variables
npx hardhat vars list

```

### 📜 Scripts
```bash
# Run custom script (local network)
npx hardhat run scripts/my-script.ts

# Run script on Base Sepolia
npx hardhat run scripts/my-script.ts --network baseSepolia

# Run script on specific network
npx hardhat run scripts/my-script.ts --network <network-name>
```

### 🔍 Utilities
```bash
# Show all available tasks
npx hardhat help

# Show help for specific task
npx hardhat help <task-name>

# Check Hardhat version
npx hardhat --version

# Show console (REPL)
npx hardhat console

# Show console on specific network
npx hardhat console --network baseSepolia
```

### 📦 Package Management
```bash
# Install project dependencies
npm install

# Update Hardhat and plugins
npm update hardhat @nomicfoundation/hardhat-ignition

# Audit dependencies for vulnerabilities
npm audit

# Check for outdated packages
npm outdated
```

### 🎯 Quick Workflows

#### Complete Development Cycle
```bash
# 1. Create/edit contract in contracts/
# 2. Compile
npx hardhat build

# 3. Write tests
# - Solidity tests: contracts/*.t.sol
# - TypeScript tests: test/*.ts

# 4. Run tests
npx hardhat test

# 5. Create deployment module: ignition/modules/*.ts

# 6. Deploy locally to test
npx hardhat ignition deploy ignition/modules/Counter.ts

# 7. Deploy to testnet
npx hardhat ignition deploy ignition/modules/Counter.ts --network baseSepolia
```

#### Deploy to Base Sepolia (Full Flow)
```bash
# 1. Set up .env file
echo "BASE_RPC_URL=https://sepolia.base.org" > .env
echo "PRIVATE_KEY=your_private_key_here" >> .env

# 2. Compile with optimization
npx hardhat build --profile production

# 3. Run tests
npx hardhat test

# 4. Deploy
npx hardhat ignition deploy ignition/modules/Counter.ts --network baseSepolia

# 5. Verify on BaseScan (if you have API key)
npx hardhat ignition verify baseSepolia
```

#### Debugging Failed Deployments
```bash
# 1. Check deployment journal
cat ignition/deployments/chain-84532/journal.jsonl

# 2. Check deployed addresses
cat ignition/deployments/chain-84532/deployed_addresses.json

# 3. Clean and rebuild
npx hardhat clean
npx hardhat build

# 4. Try deploying again (will resume from last successful step)
npx hardhat ignition deploy ignition/modules/Counter.ts --network baseSepolia
```

### 🔑 Network Quick Reference

| Network | Command Flag | Chain ID | Type |
|---------|-------------|----------|------|
| Local (temporary) | (default) | 31337 | Simulated |
| Local Optimism | `--network hardhatOp` | - | Simulated |
| Ethereum Sepolia | `--network sepolia` | 11155111 | Testnet |
| Base Sepolia | `--network baseSepolia` | 84532 | L2 Testnet |

### 📝 File Locations Quick Reference

```
contracts/           → Smart contracts (.sol)
contracts/*.t.sol    → Solidity tests
test/               → TypeScript tests (.ts)
ignition/modules/   → Deployment modules
ignition/deployments/ → Deployment history & addresses
scripts/            → Custom automation scripts
hardhat.config.ts   → Configuration file
.env                → Environment variables (DON'T COMMIT!)
```

### 💡 Pro Tips

```bash
# Run multiple commands in sequence
npx hardhat clean && npx hardhat build && npx hardhat test

# Check gas usage in tests
npx hardhat test --gas-reporter

# Run tests in watch mode (requires nodemon)
npx nodemon --exec "npx hardhat test" --watch contracts --watch test

# Get contract size
npx hardhat size-contracts

# Flatten contract for verification (if needed)
npx hardhat flatten contracts/Counter.sol > flattened.sol
```

---

**🎯 Most Common Commands (Daily Use)**

```bash
npx hardhat build                    # Compile
npx hardhat test                     # Test
npx hardhat ignition deploy ignition/modules/Counter.ts --network baseSepolia  # Deploy
npx hardhat clean                    # Clean
npx hardhat help                     # Help
```

