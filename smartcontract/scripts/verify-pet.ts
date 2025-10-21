import { run } from "hardhat";

/**
 * Script to verify a Pet contract on Base Sepolia Blockscout
 * 
 * Usage:
 * npx hardhat run scripts/verify-pet.ts --network baseSepolia
 * 
 * Or programmatically:
 * verifyPetContract(petAddress, petName, ownerAddress)
 */

export async function verifyPetContract(
  petAddress: string,
  petName: string,
  ownerAddress: string
) {
  console.log("🔍 Verifying Pet contract...");
  console.log("Address:", petAddress);
  console.log("Pet Name:", petName);
  console.log("Owner:", ownerAddress);
  
  try {
    await run("verify:verify", {
      address: petAddress,
      constructorArguments: [petName, ownerAddress],
      contract: "contracts/Pet.sol:Pet",
    });
    
    console.log("✅ Pet contract verified successfully!");
    console.log(`View at: https://base-sepolia.blockscout.com/address/${petAddress}`);
    return true;
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ Contract already verified!");
      return true;
    } else {
      console.error("❌ Verification failed:", error.message);
      return false;
    }
  }
}

// If run directly, verify example pet
async function main() {
  // Replace these with actual values
  const PET_ADDRESS = process.env.PET_ADDRESS || "";
  const PET_NAME = process.env.PET_NAME || "Buddy";
  const OWNER_ADDRESS = process.env.OWNER_ADDRESS || "";
  
  if (!PET_ADDRESS || !OWNER_ADDRESS) {
    console.error("❌ Please provide PET_ADDRESS and OWNER_ADDRESS");
    console.log("Usage: PET_ADDRESS=0x... OWNER_ADDRESS=0x... PET_NAME=Buddy npx hardhat run scripts/verify-pet.ts --network baseSepolia");
    process.exit(1);
  }
  
  await verifyPetContract(PET_ADDRESS, PET_NAME, OWNER_ADDRESS);
}

// Only run main if executed directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

