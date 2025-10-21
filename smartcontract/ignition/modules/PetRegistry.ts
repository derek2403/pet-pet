import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("PetRegistryModule", (m) => {
  const registry = m.contract("PetRegistry");
  return { registry };
});

