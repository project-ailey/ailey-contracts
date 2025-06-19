// ignition/modules/V1DeployModule.ts
import {buildModule} from "@nomicfoundation/hardhat-ignition/modules";
import AileyModule from "./AileyModule";
import AileyPlatformModule from "./AileyPlatformModule";
import AileyApiModule from "./AileyApiModule";

export default buildModule("V1DeployModule", (m) => {
  const master = m.getAccount(0);
  const alice = m.getAccount(1);
  const bob = m.getAccount(2);
  const charlie = m.getAccount(3);

  const {aleToken} = m.useModule(AileyModule);
  m.call(aleToken, "transfer", [alice, 778899], {from: master, id: "transfer_alice"});
  m.call(aleToken, "transfer", [charlie, 665544], {from: master, id: "transfer_charlie"});

  const {proxy: aileyApiProxy} = m.useModule(AileyApiModule);
  const aileyApiViaProxy = m.contractAt("AileyApi", aileyApiProxy);

  const {proxy: aileyPlatformProxy} = m.useModule(AileyPlatformModule);
  const ailePlatformViaProxy = m.contractAt("AileyPlatform", aileyPlatformProxy);

  const aileyApiInitializeFuture = m.call(aileyApiViaProxy, "initialize", [aleToken]);
  m.call(ailePlatformViaProxy, "initialize", [aleToken, aileyApiViaProxy]);

  const setStudentFactoryGrantFuture = m.call(aileyApiViaProxy, "setAgentFactory", [ailePlatformViaProxy], {after: [aileyApiInitializeFuture]});

  const createAgentFuture = m.call(ailePlatformViaProxy, "createAgent", [], {from: alice, after: [setStudentFactoryGrantFuture]});
  const newAgentFuture = m.readEventArgument(createAgentFuture, "AgentCreated", "addr");
  const newAgent = m.contractAt("AgentApi", newAgentFuture);
  const approveFuture = m.call(aleToken, "approve", [aileyApiViaProxy, 9999], {from: charlie, after: [aileyApiInitializeFuture]})
  m.call(newAgent, "callTest", [], {from: charlie, after: [approveFuture]});
  return {newAgent}
});
