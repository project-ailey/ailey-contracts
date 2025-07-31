// ignition/modules/V1DeployModule.ts
import {buildModule} from "@nomicfoundation/hardhat-ignition/modules";
import AileyModule from "./AileyModule";
import AileyPlatformModule from "./AileyPlatformModule";
import AileyApiModule from "./AileyApiModule";
import "dotenv/config";

export default buildModule("V1DeployModule", (m) => {
  const master = m.getAccount(0);
  const alice = m.getAccount(1);
  const bob = m.getAccount(2);
  const charlie = m.getAccount(3);

  const {aleToken} = m.useModule(AileyModule);
  m.call(aleToken, "transfer", [alice, 778899], {from: master, id: "transfer_alice"});
  m.call(aleToken, "transfer", [charlie, 665544], {from: master, id: "transfer_charlie"});

  const uniswapV3Factory = m.contractAt("IUniswapV3Factory", process.env.UNISWAP_V3_FACTORY_ADDRESS!);
  const createPoolFuture = m.call(uniswapV3Factory, "createPool", [aleToken, process.env.WBNB_ADDRESS!, 100], {from: master});
  const poolFuture = m.readEventArgument(createPoolFuture, "PoolCreated", "pool")
  const uniswapPool = m.contractAt("IUniswapV3Pool", poolFuture);

  const {proxy: aileyApiProxy} = m.useModule(AileyApiModule);
  const aileyApiViaProxy = m.contractAt("AileyApi", aileyApiProxy);

  const {proxy: aileyPlatformProxy} = m.useModule(AileyPlatformModule);
  const ailePlatformViaProxy = m.contractAt("AileyPlatform", aileyPlatformProxy);

  const aileyApiInitializeFuture = m.call(aileyApiViaProxy, "initialize", [aleToken, process.env.PANCKAE_V3_NONFUNGIBLE_POSITION_MANAGER_ADDRESS!]);
  // aleToken, aileyApi, pancakeV2_router, WBNB
  m.call(ailePlatformViaProxy, "initialize", [aleToken, aileyApiViaProxy, process.env.PANCAKE_V2_ROUTER_ADDRESS!, process.env.WBNB_ADDRESS!]);

  const setStudentFactoryGrantFuture = m.call(aileyApiViaProxy, "setAgentFactory", [ailePlatformViaProxy], {after: [aileyApiInitializeFuture]});

  const createAgentFuture = m.call(ailePlatformViaProxy, "createAgent", [], {from: alice, after: [setStudentFactoryGrantFuture]});
  const newAgentFuture = m.readEventArgument(createAgentFuture, "AgentCreated", "addr");
  const newAgent = m.contractAt("AgentApi", newAgentFuture);
  const approveFuture = m.call(aleToken, "approve", [aileyApiViaProxy, 9999], {from: charlie, after: [aileyApiInitializeFuture]})
  m.call(newAgent, "callTest", [], {from: charlie, after: [approveFuture]});
  return {newAgent, uniswapPool}
});



/*
1. pool.initialize(sqrtPriceX96)
- price:0.001
- 2505414483750479155158843392

- price:1000
- 2505414483750479251915866636288

2. ALE, WBNB approve to AgentApi
*/
