// ignition/modules/AileyPlatformModule.ts
import {buildModule} from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("AileyPlatformModule", (m) => {
  const master = m.getAccount(0);

  const implementation = m.contract("AileyPlatform");
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
