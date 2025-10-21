import { network } from "hardhat";

const { ethers } = await network.connect();

/**
 * Example script to interact with deployed PetFactory and Pet contracts
 * 
 * Usage:
 * npx hardhat run scripts/interact-pet.ts
 * npx hardhat run scripts/interact-pet.ts --network baseSepolia
 */
async function main() {
  console.log("🐾 PetPet Contract Interaction Script\n");

  // Get signer
  const [signer] = await ethers.getSigners();
  console.log("Using account:", signer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(signer.address)), "ETH\n");

  // Deploy PetFactory (or use existing address)
  console.log("📦 Deploying PetFactory...");
  const PetFactory = await ethers.getContractFactory("PetFactory");
  const factory = await PetFactory.deploy();
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("PetFactory deployed to:", factoryAddress, "\n");

  // Create first pet
  console.log("🐕 Creating pet 'Buddy'...");
  let tx = await factory.addPet("Buddy");
  await tx.wait();
  console.log("✅ Pet 'Buddy' created!");

  // Get pet contract
  const buddyAddress = await factory.getPetByName("Buddy");
  console.log("Buddy's contract address:", buddyAddress);
  const buddy = await ethers.getContractAt("Pet", buddyAddress);

  // Get pet info
  const [petName, petOwner, createdAt, activityCount] = await factory.getPetInfo(buddyAddress);
  console.log("Pet Info:", {
    name: petName,
    owner: petOwner,
    created: new Date(Number(createdAt) * 1000).toLocaleString(),
    activities: activityCount.toString()
  });
  console.log("");

  // Log morning routine
  console.log("🌅 Logging morning routine...");
  
  console.log("  - Morning walk (30 minutes)");
  tx = await buddy.walk(1800);
  await tx.wait();
  
  console.log("  - Breakfast (200g)");
  tx = await buddy.eat(200);
  await tx.wait();
  
  console.log("  - Water (300ml)");
  tx = await buddy.drink(300);
  await tx.wait();
  
  console.log("  - Morning rest (2 hours)");
  tx = await buddy.rest(7200);
  await tx.wait();
  console.log("✅ Morning routine logged!\n");

  // Create a second pet for interaction
  console.log("🐕 Creating pet 'Max'...");
  tx = await factory.addPet("Max");
  await tx.wait();
  const maxAddress = await factory.getPetByName("Max");
  console.log("✅ Pet 'Max' created at:", maxAddress, "\n");

  // Log afternoon activities
  console.log("☀️ Logging afternoon activities...");
  
  console.log("  - Afternoon run (15 minutes)");
  tx = await buddy.run(900);
  await tx.wait();
  
  console.log("  - Playing with Max (30 minutes)");
  tx = await buddy.interact(maxAddress, 1800);
  await tx.wait();
  console.log("✅ Afternoon activities logged!\n");

  // Log evening routine
  console.log("🌙 Logging evening routine...");
  
  console.log("  - Evening walk (40 minutes)");
  tx = await buddy.walk(2400);
  await tx.wait();
  
  console.log("  - Dinner (250g)");
  tx = await buddy.eat(250);
  await tx.wait();
  
  console.log("  - Water (400ml)");
  tx = await buddy.drink(400);
  await tx.wait();
  
  console.log("  - Night sleep (8 hours)");
  tx = await buddy.rest(28800);
  await tx.wait();
  console.log("✅ Evening routine logged!\n");

  // Get final statistics
  console.log("📊 Buddy's Daily Statistics:");
  const [walks, runs, rests, food, water, interactions] = await buddy.getStats();
  
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`Total Walk Time:    ${walks.toString().padStart(8)} seconds (${Math.floor(Number(walks) / 60)} minutes)`);
  console.log(`Total Run Time:     ${runs.toString().padStart(8)} seconds (${Math.floor(Number(runs) / 60)} minutes)`);
  console.log(`Total Rest Time:    ${rests.toString().padStart(8)} seconds (${Math.floor(Number(rests) / 3600)} hours)`);
  console.log(`Total Food:         ${food.toString().padStart(8)} grams`);
  console.log(`Total Water:        ${water.toString().padStart(8)} ml`);
  console.log(`Total Interactions: ${interactions.toString().padStart(8)}`);
  console.log(`Total Activities:   ${(await buddy.getActivityCount()).toString().padStart(8)}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Show all activities
  console.log("📝 Activity History:");
  const allActivities = await buddy.getAllActivities();
  for (let i = 0; i < allActivities.length; i++) {
    const activity = allActivities[i];
    const timestamp = new Date(Number(activity.timestamp) * 1000);
    
    let detail = "";
    if (activity.activityType === "interact") {
      detail = `with ${activity.interactedWith} for ${activity.duration} seconds`;
    } else if (["walk", "run", "rest"].includes(activity.activityType)) {
      detail = `for ${activity.duration} seconds (${Math.floor(Number(activity.duration) / 60)} min)`;
    } else {
      detail = `${activity.duration} ${activity.activityType === "eat" ? "grams" : "ml"}`;
    }
    
    console.log(`  ${i + 1}. [${timestamp.toLocaleTimeString()}] ${activity.activityType.toUpperCase()}: ${detail}`);
  }
  console.log("");

  // Show all pets in the system
  console.log("🌐 All Pets in System:");
  const allPets = await factory.getAllPets();
  console.log(`Total pets: ${allPets.length}`);
  
  for (const petAddress of allPets) {
    const [name, owner, created, count] = await factory.getPetInfo(petAddress);
    console.log(`  - ${name} (${petAddress})`);
    console.log(`    Owner: ${owner}`);
    console.log(`    Activities: ${count}`);
  }
  console.log("");

  console.log("✅ Script completed successfully!");
  console.log("🎉 PetFactory Address:", factoryAddress);
  console.log("🐕 Buddy Address:", buddyAddress);
  console.log("🐕 Max Address:", maxAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

