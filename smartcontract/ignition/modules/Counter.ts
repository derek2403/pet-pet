import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("CounterModule", (m) => {
  const initialCount = m.getParameter("initialCount", 0);
  const counter = m.contract("CounterTesting", [initialCount]);

  return { counter };
});
