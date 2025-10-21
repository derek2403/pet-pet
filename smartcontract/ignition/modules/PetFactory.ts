import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * PetFactory Deployment Module
 * Deploys the PetFactory contract which is used to create individual Pet contracts
 */
export default buildModule("PetFactoryModule", (m) => {
  // Deploy the PetFactory contract
  const petFactory = m.contract("PetFactory");
  
  // Return the contract instance
  return { petFactory };
});

