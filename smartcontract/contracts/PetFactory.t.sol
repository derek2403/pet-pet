// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {PetFactory} from "./PetFactory.sol";
import {Pet} from "./Pet.sol";
import {Test} from "forge-std/Test.sol";

/**
 * @title PetFactoryTest
 * @notice Solidity tests for PetFactory contract using Foundry-compatible syntax
 */
contract PetFactoryTest is Test {
    PetFactory factory;
    address owner1;
    address owner2;

    function setUp() public {
        factory = new PetFactory();
        owner1 = address(0x1);
        owner2 = address(0x2);
    }

    function test_InitialState() public view {
        require(factory.getPetCount() == 0, "Initial pet count should be 0");
    }

    function test_AddPet() public {
        vm.prank(owner1);
        address petAddress = factory.addPet("Buddy");
        
        require(petAddress != address(0), "Pet address should not be zero");
        require(factory.getPetCount() == 1, "Pet count should be 1");
    }

    function test_DuplicatePetName() public {
        vm.prank(owner1);
        factory.addPet("Buddy");
        
        vm.prank(owner2);
        vm.expectRevert("Pet name already exists");
        factory.addPet("Buddy");
    }

    function test_CaseInsensitiveDuplicate() public {
        vm.prank(owner1);
        factory.addPet("Buddy");
        
        vm.prank(owner2);
        vm.expectRevert("Pet name already exists");
        factory.addPet("buddy");
        
        vm.prank(owner2);
        vm.expectRevert("Pet name already exists");
        factory.addPet("BUDDY");
    }

    function test_EmptyPetName() public {
        vm.prank(owner1);
        vm.expectRevert("Pet name cannot be empty");
        factory.addPet("");
    }

    function test_PetNameTooLong() public {
        string memory longName = "ThisIsAVeryLongPetNameThatExceeds32Characters";
        
        vm.prank(owner1);
        vm.expectRevert("Pet name too long (max 32 characters)");
        factory.addPet(longName);
    }

    function test_GetPetByName() public {
        vm.prank(owner1);
        address petAddress = factory.addPet("Buddy");
        
        address retrievedAddress = factory.getPetByName("Buddy");
        require(retrievedAddress == petAddress, "Retrieved address should match");
    }

    function test_GetPetsByOwner() public {
        vm.prank(owner1);
        factory.addPet("Buddy");
        
        vm.prank(owner1);
        factory.addPet("Max");
        
        address[] memory pets = factory.getPetsByOwner(owner1);
        require(pets.length == 2, "Owner should have 2 pets");
    }

    function test_MultipleOwners() public {
        vm.prank(owner1);
        factory.addPet("Buddy");
        
        vm.prank(owner2);
        factory.addPet("Max");
        
        address[] memory pets1 = factory.getPetsByOwner(owner1);
        address[] memory pets2 = factory.getPetsByOwner(owner2);
        
        require(pets1.length == 1, "Owner1 should have 1 pet");
        require(pets2.length == 1, "Owner2 should have 1 pet");
    }

    function test_IsPetNameAvailable() public {
        require(factory.isPetNameAvailable("Buddy"), "Name should be available");
        
        vm.prank(owner1);
        factory.addPet("Buddy");
        
        require(!factory.isPetNameAvailable("Buddy"), "Name should not be available");
        require(!factory.isPetNameAvailable("buddy"), "Name should not be available (case insensitive)");
    }

    function testFuzz_AddMultiplePets(uint8 count) public {
        vm.assume(count > 0 && count <= 20); // Limit to reasonable number
        
        for (uint8 i = 0; i < count; i++) {
            vm.prank(owner1);
            string memory name = string(abi.encodePacked("Pet", vm.toString(i)));
            factory.addPet(name);
        }
        
        require(factory.getPetCount() == count, "Pet count should match");
    }
}

/**
 * @title PetTest
 * @notice Solidity tests for Pet contract
 */
contract PetTest is Test {
    Pet pet;
    address owner;
    address other;

    function setUp() public {
        owner = address(0x1);
        other = address(0x2);
        
        vm.prank(owner);
        pet = new Pet("Buddy", owner);
    }

    function test_InitialState() public view {
        require(keccak256(bytes(pet.petName())) == keccak256(bytes("Buddy")), "Name should be Buddy");
        require(pet.owner() == owner, "Owner should be correct");
        require(pet.getActivityCount() == 0, "Activity count should be 0");
    }

    function test_Walk() public {
        vm.prank(owner);
        pet.walk(1800); // 30 minutes
        
        (uint256 walks,,,,,) = pet.getStats();
        require(walks == 1800, "Walk time should be 1800");
        require(pet.getActivityCount() == 1, "Activity count should be 1");
    }

    function test_WalkOnlyOwner() public {
        vm.prank(other);
        vm.expectRevert("Only owner can perform this action");
        pet.walk(1800);
    }

    function test_WalkZeroDuration() public {
        vm.prank(owner);
        vm.expectRevert("Duration must be positive");
        pet.walk(0);
    }

    function test_Run() public {
        vm.prank(owner);
        pet.run(600); // 10 minutes
        
        (, uint256 runs,,,,) = pet.getStats();
        require(runs == 600, "Run time should be 600");
    }

    function test_Rest() public {
        vm.prank(owner);
        pet.rest(7200); // 2 hours
        
        (,, uint256 rests,,,) = pet.getStats();
        require(rests == 7200, "Rest time should be 7200");
    }

    function test_Eat() public {
        vm.prank(owner);
        pet.eat(200); // 200 grams
        
        (,,, uint256 food,,) = pet.getStats();
        require(food == 200, "Food consumed should be 200");
    }

    function test_Drink() public {
        vm.prank(owner);
        pet.drink(500); // 500 ml
        
        (,,,, uint256 water,) = pet.getStats();
        require(water == 500, "Water consumed should be 500");
    }

    function test_Interact() public {
        // Create another pet to interact with
        vm.prank(other);
        Pet otherPet = new Pet("Max", other);
        
        vm.prank(owner);
        pet.interact(address(otherPet), 1200);
        
        (,,,,, uint256 interactions) = pet.getStats();
        require(interactions == 1, "Interaction count should be 1");
    }

    function test_InteractWithSelf() public {
        vm.prank(owner);
        vm.expectRevert("Cannot interact with self");
        pet.interact(address(pet), 1200);
    }

    function test_InteractWithZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert("Invalid pet contract address");
        pet.interact(address(0), 1200);
    }

    function test_GetActivity() public {
        vm.prank(owner);
        pet.walk(1800);
        
        Pet.ActivityLog memory activity = pet.getActivity(0);
        require(keccak256(bytes(activity.activityType)) == keccak256(bytes("walk")), "Activity type should be walk");
        require(activity.duration == 1800, "Duration should be 1800");
    }

    function test_GetActivityInvalid() public {
        vm.expectRevert("Activity does not exist");
        pet.getActivity(0);
    }

    function test_TransferOwnership() public {
        vm.prank(owner);
        pet.transferOwnership(other);
        
        require(pet.owner() == other, "Owner should be transferred");
    }

    function test_TransferOwnershipZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert("Invalid new owner address");
        pet.transferOwnership(address(0));
    }

    function test_TransferOwnershipOnlyOwner() public {
        vm.prank(other);
        vm.expectRevert("Only owner can perform this action");
        pet.transferOwnership(other);
    }

    function test_NewOwnerCanLogActivity() public {
        vm.prank(owner);
        pet.transferOwnership(other);
        
        vm.prank(other);
        pet.walk(1800);
        
        (uint256 walks,,,,,) = pet.getStats();
        require(walks == 1800, "New owner should be able to log activity");
    }

    function test_OldOwnerCannotLogActivity() public {
        vm.prank(owner);
        pet.transferOwnership(other);
        
        vm.prank(owner);
        vm.expectRevert("Only owner can perform this action");
        pet.walk(1800);
    }

    function testFuzz_Walk(uint16 duration) public {
        vm.assume(duration > 0);
        
        vm.prank(owner);
        pet.walk(duration);
        
        (uint256 walks,,,,,) = pet.getStats();
        require(walks == duration, "Walk time should match");
    }

    function testFuzz_Eat(uint16 amount) public {
        vm.assume(amount > 0);
        
        vm.prank(owner);
        pet.eat(amount);
        
        (,,, uint256 food,,) = pet.getStats();
        require(food == amount, "Food consumed should match");
    }

    function test_MultipleActivities() public {
        vm.startPrank(owner);
        
        pet.walk(1800);
        pet.run(600);
        pet.eat(200);
        pet.drink(500);
        pet.rest(7200);
        
        vm.stopPrank();
        
        require(pet.getActivityCount() == 5, "Should have 5 activities");
        
        (uint256 walks, uint256 runs, uint256 rests, uint256 food, uint256 water,) = pet.getStats();
        require(walks == 1800, "Walk time should be correct");
        require(runs == 600, "Run time should be correct");
        require(rests == 7200, "Rest time should be correct");
        require(food == 200, "Food should be correct");
        require(water == 500, "Water should be correct");
    }

    function test_CumulativeActivities() public {
        vm.startPrank(owner);
        
        pet.walk(1800);
        pet.walk(2400);
        pet.eat(200);
        pet.eat(150);
        
        vm.stopPrank();
        
        (uint256 walks,,, uint256 food,,) = pet.getStats();
        require(walks == 4200, "Total walk time should be 4200");
        require(food == 350, "Total food should be 350");
    }
}

