import { run } from "hardhat";

/**
 * Script to verify the PetFactory contract on PetPet Testnet Blockscout
 * 
 * Usage:
 * npx hardhat run scripts/verify-factory.ts --network petPetTestnet
 */
async function main() {
  const FACTORY_ADDRESS = "0x6F8bEe4683fF86576B0c1f81f884468f561b8615";
  
  console.log("🔍 Verifying PetFactory contract...");
  console.log("Address:", FACTORY_ADDRESS);
  console.log("Network: PetPet Testnet");
  
  try {
    await run("verify:verify", {
      address: FACTORY_ADDRESS,
      constructorArguments: [], // PetFactory has no constructor arguments
      contract: "contracts/PetFactory.sol:PetFactory",
    });
    
    console.log("✅ PetFactory verified successfully!");
    console.log(`View at: https://petpet.cloud.blockscout.com/address/${FACTORY_ADDRESS}`);
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ Contract already verified!");
    } else {
      console.error("❌ Verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

