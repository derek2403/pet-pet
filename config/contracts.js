// Counter Contract Configuration
export const COUNTER_CONTRACT = {
  address: "0x896C5D0A1f234be5961Ae3b37a470B435EE86075",
  chainId: 84532, // Base Sepolia
  abi: [
    {
      "inputs": [],
      "name": "inc",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "by",
          "type": "uint256"
        }
      ],
      "name": "incBy",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "x",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "by",
          "type": "uint256"
        }
      ],
      "name": "Increment",
      "type": "event"
    }
  ]
};

