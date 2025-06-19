// ignition/modules/AileyApiModule.ts
import {buildModule} from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("AileyApiModule", (m) => {
  const master = m.getAccount(0);

  const implementation = m.contract("AileyApi");
  const proxy = m.contract("TransparentUpgradeableProxy", [
    implementation,
    master,
    "0x",
  ]);

  const proxyAdminAddress = m.readEventArgument(
    proxy,
    "AdminChanged",
    "newAdmin"
  );

  const proxyAdmin = m.contractAt("ProxyAdmin", proxyAdminAddress);
  return {implementation, proxyAdmin, proxy};
});
