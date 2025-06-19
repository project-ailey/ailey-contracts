import {buildModule} from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("AileyModule", (m) => {
  const aleToken = m.contract("Ailey");
  return {aleToken};
});
