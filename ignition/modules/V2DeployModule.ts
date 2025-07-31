import {buildModule} from "@nomicfoundation/hardhat-ignition/modules";
import AileyApiModule from "./AileyApiModule";

export default buildModule("UpgradeToV2Module", (m) => {
  const master = m.getAccount(0);

  // Load existing proxies
  const {proxy: aileyApiProxy} = m.useModule(AileyApiModule);

  // Deploy new implementations
  const aileyApiV2Implementation = m.contract("AileyApiV2");

  // Upgrade AileyApi to V2
  m.call(aileyApiProxy, "upgradeTo", [aileyApiV2Implementation], {
    from: master,
    id: "upgrade_ailey_api_v2",
  });

  return {aileyApiV2Implementation};
});
