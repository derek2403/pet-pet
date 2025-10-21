// PetPet Registry Contract Configuration
export const REGISTRY_ADDRESS = {
  address: "0xaC73F8dB1AdaB4bbf3Ec511e2E078ab78c51a789",
  chainId: 84532, // Base Sepolia
  abi: [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "string",
          "name": "petName",
          "type": "string"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "petContract",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "PetRegistered",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "allPets",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAllPets",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "pets",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "petName",
          "type": "string"
        }
      ],
      "name": "getPetByName",
      "outputs": [
        {
          "internalType": "address",
          "name": "petContract",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getPetCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "count",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "getPetsByOwner",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "pets",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "petName",
          "type": "string"
        }
      ],
      "name": "isPetNameAvailable",
      "outputs": [
        {
          "internalType": "bool",
          "name": "available",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "name": "petsByName",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "petsByOwner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "petName",
          "type": "string"
        },
        {
          "internalType": "address",
          "name": "petContract",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "registerPet",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
}

// Pet contract ABI (minimal - just what we need)
export const PET_ABI = [
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