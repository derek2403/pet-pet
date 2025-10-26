import type { HardhatUserConfig } from "hardhat/config";

import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { configVariable } from "hardhat/config";
import "dotenv/config";

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxMochaEthersPlugin],
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
  },
  networks: {
    petPetTestnet: {
      type: "http",
      chainType: "l1",
      url: process.env.PETPET_TESTNET_RPC_URL || "https://c2e90a7139bb5f5fe1c6deab725ee1a45631b952-8545.dstack-prod5.phala.network/",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 2403,
    },
  },
  // @ts-ignore - etherscan config for verification
  etherscan: {
    apiKey: {
      petPetTestnet: "abc123abc123abc123abc123abc123abc1", // Blockscout doesn't need real key, just non-empty
    },
    customChains: [
      {
        network: "petPetTestnet",
        chainId: 2403,
        urls: {
          apiURL: "https://petpet.cloud.blockscout.com/api",
          browserURL: "https://petpet.cloud.blockscout.com",
        },
      },
    ],
  },
  // @ts-ignore - sourcify config
  sourcify: {
    enabled: false,
  },
};

export default config;
