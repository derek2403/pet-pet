// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title PET_NAME_PLACEHOLDER
 * @notice This is a template that will be modified for each unique pet
 * @dev The contract name will be replaced with the actual pet name during deployment
 */
contract PET_NAME_PLACEHOLDER {
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

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    constructor(string memory _petName, address _owner) {
        require(bytes(_petName).length > 0, "Pet name cannot be empty");
        require(_owner != address(0), "Invalid owner address");
        
        petName = _petName;
        owner = _owner;
        createdAt = block.timestamp;
    }

    function walk(uint256 duration) external onlyOwner {
        require(duration > 0, "Duration must be positive");
        uint256 activityId = activities.length;
        activities.push(ActivityLog("walk", duration, block.timestamp, address(0), ""));
        totalWalkTime += duration;
        emit Walk(activityId, duration, block.timestamp);
    }

    function run(uint256 duration) external onlyOwner {
        require(duration > 0, "Duration must be positive");
        uint256 activityId = activities.length;
        activities.push(ActivityLog("run", duration, block.timestamp, address(0), ""));
        totalRunTime += duration;
        emit Run(activityId, duration, block.timestamp);
    }

    function rest(uint256 duration) external onlyOwner {
        require(duration > 0, "Duration must be positive");
        uint256 activityId = activities.length;
        activities.push(ActivityLog("rest", duration, block.timestamp, address(0), ""));
        totalRestTime += duration;
        emit Rest(activityId, duration, block.timestamp);
    }

    function eat(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be positive");
        uint256 activityId = activities.length;
        activities.push(ActivityLog("eat", amount, block.timestamp, address(0), ""));
        totalFoodConsumed += amount;
        emit Eat(activityId, amount, block.timestamp);
    }

    function drink(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be positive");
        uint256 activityId = activities.length;
        activities.push(ActivityLog("drink", amount, block.timestamp, address(0), ""));
        totalWaterConsumed += amount;
        emit Drink(activityId, amount, block.timestamp);
    }

    function interact(address otherPetContract, uint256 duration) external onlyOwner {
        require(otherPetContract != address(0), "Invalid pet contract address");
        require(otherPetContract != address(this), "Cannot interact with self");
        require(duration > 0, "Duration must be positive");
        
        uint256 activityId = activities.length;
        activities.push(ActivityLog("interact", duration, block.timestamp, otherPetContract, ""));
        interactionCount++;
        emit Interact(activityId, otherPetContract, duration, block.timestamp);
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

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid new owner address");
        owner = newOwner;
    }
}

