// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./Pet.sol";

/**
 * @title PetFactory
 * @notice Factory contract for creating and managing Pet contracts
 * @dev Deploys individual Pet contracts and tracks all created pets
 */
contract PetFactory {
    // Mapping from pet name (lowercase) to pet contract address
    mapping(string => address) public petsByName;
    
    // Array of all deployed pet contracts
    address[] public allPets;
    
    // Mapping from owner address to their pet contracts
    mapping(address => address[]) public petsByOwner;
    
    // Events
    event PetCreated(
        string indexed petName,
        address indexed petContract,
        address indexed owner,
        uint256 timestamp
    );

    /**
     * @notice Create a new pet with the given name
     * @param petName The unique name for the pet (case-insensitive)
     * @return petContract The address of the newly deployed Pet contract
     */
    function addPet(string memory petName) external returns (address petContract) {
        require(bytes(petName).length > 0, "Pet name cannot be empty");
        require(bytes(petName).length <= 32, "Pet name too long (max 32 characters)");
        
        // Convert to lowercase for uniqueness check
        string memory nameLower = _toLower(petName);
        require(petsByName[nameLower] == address(0), "Pet name already exists");
        
        // Deploy new Pet contract
        Pet newPet = new Pet(petName, msg.sender);
        petContract = address(newPet);
        
        // Store references
        petsByName[nameLower] = petContract;
        allPets.push(petContract);
        petsByOwner[msg.sender].push(petContract);
        
        emit PetCreated(petName, petContract, msg.sender, block.timestamp);
        
        return petContract;
    }

    /**
     * @notice Check if a pet name is available
     * @param petName The name to check
     * @return available True if the name is available, false otherwise
     */
    function isPetNameAvailable(string memory petName) external view returns (bool available) {
        string memory nameLower = _toLower(petName);
        return petsByName[nameLower] == address(0);
    }

    /**
     * @notice Get pet contract address by name
     * @param petName The name of the pet
     * @return petContract The address of the pet's contract (0x0 if not found)
     */
    function getPetByName(string memory petName) external view returns (address petContract) {
        string memory nameLower = _toLower(petName);
        return petsByName[nameLower];
    }

    /**
     * @notice Get all pets owned by a specific address
     * @param owner The owner's address
     * @return pets Array of pet contract addresses
     */
    function getPetsByOwner(address owner) external view returns (address[] memory pets) {
        return petsByOwner[owner];
    }

    /**
     * @notice Get all deployed pet contracts
     * @return pets Array of all pet contract addresses
     */
    function getAllPets() external view returns (address[] memory pets) {
        return allPets;
    }

    /**
     * @notice Get total number of pets created
     * @return count Total number of pets
     */
    function getPetCount() external view returns (uint256 count) {
        return allPets.length;
    }

    /**
     * @notice Get detailed info about a pet by contract address
     * @param petContract The pet contract address
     * @return petName The name of the pet
     * @return owner The owner's address
     * @return createdAt Timestamp when pet was created
     * @return activityCount Total number of activities logged
     */
    function getPetInfo(address petContract) external view returns (
        string memory petName,
        address owner,
        uint256 createdAt,
        uint256 activityCount
    ) {
        Pet pet = Pet(petContract);
        return (
            pet.petName(),
            pet.owner(),
            pet.createdAt(),
            pet.getActivityCount()
        );
    }

    /**
     * @notice Internal function to convert string to lowercase
     * @param str Input string
     * @return Lowercase version of the string
     */
    function _toLower(string memory str) internal pure returns (string memory) {
        bytes memory bStr = bytes(str);
        bytes memory bLower = new bytes(bStr.length);
        
        for (uint256 i = 0; i < bStr.length; i++) {
            // If uppercase character, convert to lowercase
            if ((uint8(bStr[i]) >= 65) && (uint8(bStr[i]) <= 90)) {
                bLower[i] = bytes1(uint8(bStr[i]) + 32);
            } else {
                bLower[i] = bStr[i];
            }
        }
        
        return string(bLower);
    }
}

