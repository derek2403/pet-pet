import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("PetFactory", function () {
  describe("Deployment", function () {
    it("Should deploy PetFactory successfully", async function () {
      const petFactory = await ethers.deployContract("PetFactory");
      expect(await petFactory.getPetCount()).to.equal(0n);
    });
  });

  describe("Pet Creation", function () {
    it("Should create a new pet and emit PetCreated event", async function () {
      const petFactory = await ethers.deployContract("PetFactory");
      const [owner] = await ethers.getSigners();

      const tx = await petFactory.addPet("Buddy");
      const receipt = await tx.wait();
      const event = receipt?.logs.find((log: any) => {
        try {
          return petFactory.interface.parseLog(log)?.name === "PetCreated";
        } catch {
          return false;
        }
      });
      
      expect(event).to.not.be.undefined;
    });

    it("Should increment pet count after creation", async function () {
      const petFactory = await ethers.deployContract("PetFactory");
      
      await petFactory.addPet("Buddy");
      expect(await petFactory.getPetCount()).to.equal(1n);
      
      await petFactory.addPet("Max");
      expect(await petFactory.getPetCount()).to.equal(2n);
    });

    it("Should reject empty pet name", async function () {
      const petFactory = await ethers.deployContract("PetFactory");
      
      await expect(petFactory.addPet(""))
        .to.be.revertedWith("Pet name cannot be empty");
    });

    it("Should reject duplicate pet names (case-insensitive)", async function () {
      const petFactory = await ethers.deployContract("PetFactory");
      
      await petFactory.addPet("Buddy");
      
      await expect(petFactory.addPet("Buddy"))
        .to.be.revertedWith("Pet name already exists");
      
      await expect(petFactory.addPet("buddy"))
        .to.be.revertedWith("Pet name already exists");
      
      await expect(petFactory.addPet("BUDDY"))
        .to.be.revertedWith("Pet name already exists");
    });

    it("Should reject pet names longer than 32 characters", async function () {
      const petFactory = await ethers.deployContract("PetFactory");
      const longName = "a".repeat(33);
      
      await expect(petFactory.addPet(longName))
        .to.be.revertedWith("Pet name too long (max 32 characters)");
    });

    it("Should allow pet names up to 32 characters", async function () {
      const petFactory = await ethers.deployContract("PetFactory");
      const maxLengthName = "a".repeat(32);
      
      await expect(petFactory.addPet(maxLengthName))
        .to.not.be.revertedWith("Pet name too long (max 32 characters)");
    });
  });

  describe("Pet Name Availability", function () {
    it("Should return true for available names", async function () {
      const petFactory = await ethers.deployContract("PetFactory");
      
      expect(await petFactory.isPetNameAvailable("Buddy")).to.be.true;
      expect(await petFactory.isPetNameAvailable("Max")).to.be.true;
    });

    it("Should return false for taken names (case-insensitive)", async function () {
      const petFactory = await ethers.deployContract("PetFactory");
      
      await petFactory.addPet("Buddy");
      
      expect(await petFactory.isPetNameAvailable("Buddy")).to.be.false;
      expect(await petFactory.isPetNameAvailable("buddy")).to.be.false;
      expect(await petFactory.isPetNameAvailable("BUDDY")).to.be.false;
    });
  });

  describe("Pet Queries", function () {
    it("Should get pet by name", async function () {
      const petFactory = await ethers.deployContract("PetFactory");
      
      await petFactory.addPet("Buddy");
      const petAddress = await petFactory.getPetByName("Buddy");
      
      expect(petAddress).to.not.equal(ethers.ZeroAddress);
    });

    it("Should return zero address for non-existent pet", async function () {
      const petFactory = await ethers.deployContract("PetFactory");
      
      const petAddress = await petFactory.getPetByName("NonExistent");
      expect(petAddress).to.equal(ethers.ZeroAddress);
    });

    it("Should get all pets by owner", async function () {
      const petFactory = await ethers.deployContract("PetFactory");
      const [owner] = await ethers.getSigners();
      
      await petFactory.addPet("Buddy");
      await petFactory.addPet("Max");
      
      const ownerPets = await petFactory.getPetsByOwner(owner.address);
      expect(ownerPets.length).to.equal(2);
    });

    it("Should get all pets", async function () {
      const petFactory = await ethers.deployContract("PetFactory");
      
      await petFactory.addPet("Buddy");
      await petFactory.addPet("Max");
      await petFactory.addPet("Charlie");
      
      const allPets = await petFactory.getAllPets();
      expect(allPets.length).to.equal(3);
    });

    it("Should get pet info correctly", async function () {
      const petFactory = await ethers.deployContract("PetFactory");
      const [owner] = await ethers.getSigners();
      
      await petFactory.addPet("Buddy");
      const petAddress = await petFactory.getPetByName("Buddy");
      
      const [petName, petOwner, createdAt, activityCount] = 
        await petFactory.getPetInfo(petAddress);
      
      expect(petName).to.equal("Buddy");
      expect(petOwner).to.equal(owner.address);
      expect(createdAt).to.be.greaterThan(0n);
      expect(activityCount).to.equal(0n);
    });
  });

  describe("Multiple Owners", function () {
    it("Should track pets by different owners separately", async function () {
      const petFactory = await ethers.deployContract("PetFactory");
      const [owner1, owner2] = await ethers.getSigners();
      
      // Owner 1 creates pets
      await petFactory.connect(owner1).addPet("Buddy");
      await petFactory.connect(owner1).addPet("Max");
      
      // Owner 2 creates pets
      await petFactory.connect(owner2).addPet("Charlie");
      
      const owner1Pets = await petFactory.getPetsByOwner(owner1.address);
      const owner2Pets = await petFactory.getPetsByOwner(owner2.address);
      
      expect(owner1Pets.length).to.equal(2);
      expect(owner2Pets.length).to.equal(1);
    });
  });
});

describe("Pet", function () {
  let petFactory: any;
  let petAddress: string;
  let pet: any;
  let owner: any;
  let otherAccount: any;

  beforeEach(async function () {
    petFactory = await ethers.deployContract("PetFactory");
    [owner, otherAccount] = await ethers.getSigners();
    
    await petFactory.connect(owner).addPet("Buddy");
    petAddress = await petFactory.getPetByName("Buddy");
    pet = await ethers.getContractAt("Pet", petAddress);
  });

  describe("Pet Identity", function () {
    it("Should have correct name and owner", async function () {
      expect(await pet.petName()).to.equal("Buddy");
      expect(await pet.owner()).to.equal(owner.address);
    });

    it("Should have creation timestamp", async function () {
      const createdAt = await pet.createdAt();
      expect(createdAt).to.be.greaterThan(0n);
    });

    it("Should start with zero activities", async function () {
      expect(await pet.getActivityCount()).to.equal(0n);
    });
  });

  describe("Walk Activity", function () {
    it("Should log walk activity and emit event", async function () {
      const tx = await pet.connect(owner).walk(1800n); // 30 minutes
      const receipt = await tx.wait();
      
      expect(receipt).to.not.be.null;
      expect(await pet.getActivityCount()).to.equal(1n);
    });

    it("Should update walk stats", async function () {
      await pet.connect(owner).walk(1800n);
      await pet.connect(owner).walk(3600n);
      
      const [walks] = await pet.getStats();
      expect(walks).to.equal(5400n); // 1800 + 3600
    });

    it("Should reject zero duration", async function () {
      await expect(pet.connect(owner).walk(0n))
        .to.be.revertedWith("Duration must be positive");
    });

    it("Should reject non-owner", async function () {
      await expect(pet.connect(otherAccount).walk(1800n))
        .to.be.revertedWith("Only owner can perform this action");
    });
  });

  describe("Run Activity", function () {
    it("Should log run activity and emit event", async function () {
      const tx = await pet.connect(owner).run(600n); // 10 minutes
      const receipt = await tx.wait();
      
      expect(receipt).to.not.be.null;
      expect(await pet.getActivityCount()).to.equal(1n);
    });

    it("Should update run stats", async function () {
      await pet.connect(owner).run(600n);
      await pet.connect(owner).run(900n);
      
      const [, runs] = await pet.getStats();
      expect(runs).to.equal(1500n); // 600 + 900
    });
  });

  describe("Rest Activity", function () {
    it("Should log rest activity and emit event", async function () {
      const tx = await pet.connect(owner).rest(7200n); // 2 hours
      const receipt = await tx.wait();
      
      expect(receipt).to.not.be.null;
      expect(await pet.getActivityCount()).to.equal(1n);
    });

    it("Should update rest stats", async function () {
      await pet.connect(owner).rest(7200n);
      await pet.connect(owner).rest(3600n);
      
      const [, , rests] = await pet.getStats();
      expect(rests).to.equal(10800n); // 7200 + 3600
    });
  });

  describe("Eat Activity", function () {
    it("Should log eat activity and emit event", async function () {
      const tx = await pet.connect(owner).eat(200n); // 200 grams
      const receipt = await tx.wait();
      
      expect(receipt).to.not.be.null;
      expect(await pet.getActivityCount()).to.equal(1n);
    });

    it("Should update food consumption stats", async function () {
      await pet.connect(owner).eat(200n);
      await pet.connect(owner).eat(150n);
      
      const [, , , food] = await pet.getStats();
      expect(food).to.equal(350n); // 200 + 150
    });
  });

  describe("Drink Activity", function () {
    it("Should log drink activity and emit event", async function () {
      const tx = await pet.connect(owner).drink(500n); // 500 ml
      const receipt = await tx.wait();
      
      expect(receipt).to.not.be.null;
      expect(await pet.getActivityCount()).to.equal(1n);
    });

    it("Should update water consumption stats", async function () {
      await pet.connect(owner).drink(500n);
      await pet.connect(owner).drink(300n);
      
      const [, , , , water] = await pet.getStats();
      expect(water).to.equal(800n); // 500 + 300
    });
  });

  describe("Interact Activity", function () {
    let otherPet: any;
    let otherPetAddress: string;

    beforeEach(async function () {
      await petFactory.connect(otherAccount).addPet("Max");
      otherPetAddress = await petFactory.getPetByName("Max");
      otherPet = await ethers.getContractAt("Pet", otherPetAddress);
    });

    it("Should log interaction and emit event", async function () {
      const tx = await pet.connect(owner).interact(otherPetAddress, 1200n);
      const receipt = await tx.wait();
      
      expect(receipt).to.not.be.null;
      expect(await pet.getActivityCount()).to.equal(1n);
    });

    it("Should update interaction count", async function () {
      await pet.connect(owner).interact(otherPetAddress, 1200n);
      await pet.connect(owner).interact(otherPetAddress, 600n);
      
      const [, , , , , interactions] = await pet.getStats();
      expect(interactions).to.equal(2n);
    });

    it("Should reject interaction with self", async function () {
      await expect(pet.connect(owner).interact(petAddress, 1200n))
        .to.be.revertedWith("Cannot interact with self");
    });

    it("Should reject interaction with zero address", async function () {
      await expect(pet.connect(owner).interact(ethers.ZeroAddress, 1200n))
        .to.be.revertedWith("Invalid pet contract address");
    });
  });

  describe("Activity Retrieval", function () {
    it("Should retrieve activity by ID", async function () {
      await pet.connect(owner).walk(1800n);
      
      const activity = await pet.getActivity(0n);
      expect(activity.activityType).to.equal("walk");
      expect(activity.duration).to.equal(1800n);
    });

    it("Should get all activities", async function () {
      await pet.connect(owner).walk(1800n);
      await pet.connect(owner).run(600n);
      await pet.connect(owner).eat(200n);
      
      const activities = await pet.getAllActivities();
      expect(activities.length).to.equal(3);
      expect(activities[0].activityType).to.equal("walk");
      expect(activities[1].activityType).to.equal("run");
      expect(activities[2].activityType).to.equal("eat");
    });

    it("Should reject invalid activity ID", async function () {
      await expect(pet.getActivity(999n))
        .to.be.revertedWith("Activity does not exist");
    });
  });

  describe("Ownership Transfer", function () {
    it("Should transfer ownership", async function () {
      await pet.connect(owner).transferOwnership(otherAccount.address);
      expect(await pet.owner()).to.equal(otherAccount.address);
    });

    it("Should reject transfer to zero address", async function () {
      await expect(pet.connect(owner).transferOwnership(ethers.ZeroAddress))
        .to.be.revertedWith("Invalid new owner address");
    });

    it("Should only allow owner to transfer", async function () {
      await expect(pet.connect(otherAccount).transferOwnership(otherAccount.address))
        .to.be.revertedWith("Only owner can perform this action");
    });

    it("New owner should be able to log activities", async function () {
      await pet.connect(owner).transferOwnership(otherAccount.address);
      
      await expect(pet.connect(otherAccount).walk(1800n))
        .to.emit(pet, "Walk");
      
      await expect(pet.connect(owner).walk(1800n))
        .to.be.revertedWith("Only owner can perform this action");
    });
  });

  describe("Complete Activity Flow", function () {
    it("Should handle a full day of activities", async function () {
      // Morning walk
      await pet.connect(owner).walk(1800n); // 30 min
      
      // Breakfast
      await pet.connect(owner).eat(200n); // 200g
      await pet.connect(owner).drink(300n); // 300ml
      
      // Morning rest
      await pet.connect(owner).rest(7200n); // 2 hours
      
      // Afternoon run
      await pet.connect(owner).run(900n); // 15 min
      
      // Play with other pet
      await petFactory.connect(otherAccount).addPet("Max");
      const otherPetAddress = await petFactory.getPetByName("Max");
      await pet.connect(owner).interact(otherPetAddress, 1800n); // 30 min
      
      // Dinner
      await pet.connect(owner).eat(250n); // 250g
      await pet.connect(owner).drink(400n); // 400ml
      
      // Evening walk
      await pet.connect(owner).walk(2400n); // 40 min
      
      // Night rest
      await pet.connect(owner).rest(28800n); // 8 hours
      
      const [walks, runs, rests, food, water, interactions] = 
        await pet.getStats();
      
      expect(walks).to.equal(4200n); // 1800 + 2400
      expect(runs).to.equal(900n);
      expect(rests).to.equal(36000n); // 7200 + 28800
      expect(food).to.equal(450n); // 200 + 250
      expect(water).to.equal(700n); // 300 + 400
      expect(interactions).to.equal(1n);
      expect(await pet.getActivityCount()).to.equal(10n);
    });
  });
});

