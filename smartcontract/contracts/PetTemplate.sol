// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title IPet
 * @notice Interface that all pet contracts implement for interactions
 * @dev This allows different pet contracts to interact with each other
 */
interface IPet {
    function receiveInteraction(address fromPetContract, uint256 duration) external payable;
}

/**
 * @title PET1
 * @notice This is a template that will be modified for each unique pet
 * @dev The contract name will be replaced with the actual pet name during deployment
 */
contract PET_NAME is IPet {
    // Pet identity
    string public petName;
    address public owner;
    uint256 public createdAt;

    // Activity tracking
    struct ActivityLog {
        string activityType;
        uint256 duration;
        uint256 timestamp;
        address interactedWith;
        string metadata;
    }

    ActivityLog[] public activities;
    
    // Quick stats
    uint256 public totalWalkTime;
    uint256 public totalRunTime;
    uint256 public totalRestTime;
    uint256 public totalFoodConsumed;
    uint256 public totalWaterConsumed;
    uint256 public interactionCount;

    // Events
    event Walk(uint256 indexed activityId, uint256 duration, uint256 timestamp);
    event Run(uint256 indexed activityId, uint256 duration, uint256 timestamp);
    event Rest(uint256 indexed activityId, uint256 duration, uint256 timestamp);
    event Eat(uint256 indexed activityId, uint256 amount, uint256 timestamp);
    event Drink(uint256 indexed activityId, uint256 amount, uint256 timestamp);
    event Interact(uint256 indexed activityId, address indexed otherPet, uint256 duration, uint256 timestamp);

    constructor(address _owner) {
        require(_owner != address(0), "Invalid owner address");
        
        petName = "PET_NAME"; 
        owner = _owner;
        createdAt = block.timestamp;
    }

    function walk(uint256 duration) external {
        require(duration > 0, "Duration must be positive");
        uint256 activityId = activities.length;
        activities.push(ActivityLog("walk", duration, block.timestamp, address(0), ""));
        totalWalkTime += duration;
        emit Walk(activityId, duration, block.timestamp);
    }

    function run(uint256 duration) external {
        require(duration > 0, "Duration must be positive");
        uint256 activityId = activities.length;
        activities.push(ActivityLog("run", duration, block.timestamp, address(0), ""));
        totalRunTime += duration;
        emit Run(activityId, duration, block.timestamp);
    }

    function rest(uint256 duration) external {
        require(duration > 0, "Duration must be positive");
        uint256 activityId = activities.length;
        activities.push(ActivityLog("rest", duration, block.timestamp, address(0), ""));
        totalRestTime += duration;
        emit Rest(activityId, duration, block.timestamp);
    }

    function eat(uint256 amount) external {
        require(amount > 0, "Amount must be positive");
        uint256 activityId = activities.length;
        activities.push(ActivityLog("eat", amount, block.timestamp, address(0), ""));
        totalFoodConsumed += amount;
        emit Eat(activityId, amount, block.timestamp);
    }

    function drink(uint256 amount) external {
        require(amount > 0, "Amount must be positive");
        uint256 activityId = activities.length;
        activities.push(ActivityLog("drink", amount, block.timestamp, address(0), ""));
        totalWaterConsumed += amount;
        emit Drink(activityId, amount, block.timestamp);
    }

    // Called by another pet contract to record an interaction
    // This is an internal contract-to-contract call
    function receiveInteraction(address fromPetContract, uint256 duration) external payable {
        require(fromPetContract != address(0), "Invalid pet contract address");
        require(fromPetContract != address(this), "Cannot interact with self");
        require(duration > 0, "Duration must be positive");
        require(msg.value > 0, "Must send ETH with interaction");
        
        // Record that another pet interacted with this pet
        uint256 activityId = activities.length;
        activities.push(ActivityLog("interact", duration, block.timestamp, fromPetContract, "received"));
        interactionCount++;
        emit Interact(activityId, fromPetContract, duration, block.timestamp);
        
        // Send half of the received ETH back to create a second internal transaction
        uint256 returnAmount = msg.value / 2;
        if (returnAmount > 0) {
            payable(fromPetContract).transfer(returnAmount);
        }
    }

    // Anyone can initiate interaction with another pet
    // This calls the other pet's contract to record the interaction
    function interact(address otherPetContract, uint256 duration) external payable {
        require(otherPetContract != address(0), "Invalid pet contract address");
        require(otherPetContract != address(this), "Cannot interact with self");
        require(duration > 0, "Duration must be positive");
        require(msg.value > 0, "Must send ETH with interaction");
        
        // Record in our own activity log
        uint256 activityId = activities.length;
        activities.push(ActivityLog("interact", duration, block.timestamp, otherPetContract, "initiated"));
        interactionCount++;
        emit Interact(activityId, otherPetContract, duration, block.timestamp);
        
        // Call the other pet's contract to record the interaction (internal transaction #1: A -> B)
        // The other contract will send half back (internal transaction #2: B -> A)
        // Use IPet interface so any pet contract (regardless of name) can interact
        IPet otherPet = IPet(otherPetContract);
        otherPet.receiveInteraction{value: msg.value}(address(this), duration);
    }

    function getActivityCount() external view returns (uint256) {
        return activities.length;
    }

    function getActivity(uint256 activityId) external view returns (ActivityLog memory) {
        require(activityId < activities.length, "Activity does not exist");
        return activities[activityId];
    }

    function getAllActivities() external view returns (ActivityLog[] memory) {
        return activities;
    }

    function getStats() external view returns (
        uint256 walks,
        uint256 runs,
        uint256 rests,
        uint256 food,
        uint256 water,
        uint256 interactions
    ) {
        return (
            totalWalkTime,
            totalRunTime,
            totalRestTime,
            totalFoodConsumed,
            totalWaterConsumed,
            interactionCount
        );
    }

    function transferOwnership(address newOwner) external {
        require(newOwner != address(0), "Invalid new owner address");
        owner = newOwner;
    }

    // Allow contract to receive ETH for interactions
    receive() external payable {}
    
    // Allow anyone to withdraw accumulated ETH from interactions
    function withdraw() external {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        payable(msg.sender).transfer(balance);
    }
}

