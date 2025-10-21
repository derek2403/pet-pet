import { run } from "hardhat";

const PET_ADDRESS = process.argv[2] || "0x59Bba8D4efB6eb2813222E4387A87F881dBe7B32";
const PET_NAME = process.argv[3] || "MyPet";
const OWNER_ADDRESS = process.argv[4] || "";

async function main() {
  if (!OWNER_ADDRESS) {
    console.error("Usage: npx hardhat run scripts/verify-single-pet.ts --network baseSepolia <petAddress> <petName> <ownerAddress>");
    process.exit(1);
  }

  console.log("Verifying Pet contract...");
  console.log("Address:", PET_ADDRESS);
  console.log("Name:", PET_NAME);
  console.log("Owner:", OWNER_ADDRESS);

  try {
    await run("verify:verify", {
      address: PET_ADDRESS,
      constructorArguments: [PET_NAME, OWNER_ADDRESS],
      contract: "contracts/Pet.sol:Pet",
    });
    
    console.log("✅ Verified!");
    console.log(`https://base-sepolia.blockscout.com/address/${PET_ADDRESS}#code`);
  } catch (error: any) {
    if (error.message.includes("Already Verified") || error.message.includes("already been verified")) {
      console.log("✅ Already verified!");
      console.log(`https://base-sepolia.blockscout.com/address/${PET_ADDRESS}#code`);
    } else {
      console.error("❌ Error:", error.message);
      throw error;
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

