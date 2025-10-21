// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title Pet
 * @notice Individual pet contract that tracks all activities and interactions
 * @dev Each pet is deployed as a separate contract instance with its unique name
 */
contract Pet {
    // Pet identity
    string public petName;
    address public owner;
    uint256 public createdAt;

    // Activity tracking
    struct ActivityLog {
        string activityType; // "walk", "run", "rest", "eat", "drink", "interact"
        uint256 duration;    // in seconds for walk/run/rest, in grams for eat/drink
        uint256 timestamp;
        address interactedWith; // for interact events, stores other pet contract address
        string metadata;     // optional: for future ZKP proof references
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

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    /**
     * @notice Initialize the pet contract
     * @param _petName The unique name of the pet
     * @param _owner The address of the pet owner
     */
    constructor(string memory _petName, address _owner) {
        require(bytes(_petName).length > 0, "Pet name cannot be empty");
        require(_owner != address(0), "Invalid owner address");
        
        petName = _petName;
        owner = _owner;
        createdAt = block.timestamp;
    }

    /**
     * @notice Log a walk activity
     * @param duration Duration of the walk in seconds
     */
    function walk(uint256 duration) external onlyOwner {
        require(duration > 0, "Duration must be positive");
        
        uint256 activityId = activities.length;
        activities.push(ActivityLog({
            activityType: "walk",
            duration: duration,
            timestamp: block.timestamp,
            interactedWith: address(0),
            metadata: ""
        }));
        
        totalWalkTime += duration;
        emit Walk(activityId, duration, block.timestamp);
    }

    /**
     * @notice Log a run activity
     * @param duration Duration of the run in seconds
     */
    function run(uint256 duration) external onlyOwner {
        require(duration > 0, "Duration must be positive");
        
        uint256 activityId = activities.length;
        activities.push(ActivityLog({
            activityType: "run",
            duration: duration,
            timestamp: block.timestamp,
            interactedWith: address(0),
            metadata: ""
        }));
        
        totalRunTime += duration;
        emit Run(activityId, duration, block.timestamp);
    }

    /**
     * @notice Log a rest activity
     * @param duration Duration of the rest in seconds
     */
    function rest(uint256 duration) external onlyOwner {
        require(duration > 0, "Duration must be positive");
        
        uint256 activityId = activities.length;
        activities.push(ActivityLog({
            activityType: "rest",
            duration: duration,
            timestamp: block.timestamp,
            interactedWith: address(0),
            metadata: ""
        }));
        
        totalRestTime += duration;
        emit Rest(activityId, duration, block.timestamp);
    }

    /**
     * @notice Log eating activity
     * @param amount Amount of food consumed in grams
     */
    function eat(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be positive");
        
        uint256 activityId = activities.length;
        activities.push(ActivityLog({
            activityType: "eat",
            duration: amount,
            timestamp: block.timestamp,
            interactedWith: address(0),
            metadata: ""
        }));
        
        totalFoodConsumed += amount;
        emit Eat(activityId, amount, block.timestamp);
    }

    /**
     * @notice Log drinking activity
     * @param amount Amount of water consumed in milliliters
     */
    function drink(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be positive");
        
        uint256 activityId = activities.length;
        activities.push(ActivityLog({
            activityType: "drink",
            duration: amount,
            timestamp: block.timestamp,
            interactedWith: address(0),
            metadata: ""
        }));
        
        totalWaterConsumed += amount;
        emit Drink(activityId, amount, block.timestamp);
    }

    /**
     * @notice Log interaction with another pet
     * @param otherPetContract Address of the other pet's contract
     * @param duration Duration of interaction in seconds
     */
    function interact(address otherPetContract, uint256 duration) external onlyOwner {
        require(otherPetContract != address(0), "Invalid pet contract address");
        require(otherPetContract != address(this), "Cannot interact with self");
        require(duration > 0, "Duration must be positive");
        
        uint256 activityId = activities.length;
        activities.push(ActivityLog({
            activityType: "interact",
            duration: duration,
            timestamp: block.timestamp,
            interactedWith: otherPetContract,
            metadata: ""
        }));
        
        interactionCount++;
        emit Interact(activityId, otherPetContract, duration, block.timestamp);
    }

    /**
     * @notice Get total number of activities
     * @return Total count of all logged activities
     */
    function getActivityCount() external view returns (uint256) {
        return activities.length;
    }

    /**
     * @notice Get activity details by ID
     * @param activityId The ID of the activity to retrieve
     * @return ActivityLog struct with all activity details
     */
    function getActivity(uint256 activityId) external view returns (ActivityLog memory) {
        require(activityId < activities.length, "Activity does not exist");
        return activities[activityId];
    }

    /**
     * @notice Get all activities for this pet
     * @return Array of all ActivityLog structs
     */
    function getAllActivities() external view returns (ActivityLog[] memory) {
        return activities;
    }

    /**
     * @notice Get summary stats for the pet
     * @return walks Total walk time in seconds
     * @return runs Total run time in seconds
     * @return rests Total rest time in seconds
     * @return food Total food consumed in grams
     * @return water Total water consumed in ml
     * @return interactions Total number of interactions
     */
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

    /**
     * @notice Transfer ownership of the pet
     * @param newOwner Address of the new owner
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid new owner address");
        owner = newOwner;
    }
}

