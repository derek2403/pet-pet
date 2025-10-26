import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("PetTemplateModule", (m) => {
  const ownerAddress = m.getParameter("ownerAddress", m.getAccount(0));
  
  const petTemplate = m.contract("PET_NAME", [ownerAddress]);
  
  return { petTemplate };
});

