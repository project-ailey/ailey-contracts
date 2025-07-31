const hre = require("hardhat");

require("dotenv").config();

const agentApiAddress = process.env.AGENT_API_ADDRESS;
const aleTokenAddress = process.env.ALE_TOKEN_ADDRESS;

async function main() {
  const [deployer, user1, user2, user3] = await hre.ethers.getSigners();

  const AgentApi = await hre.ethers.getContractFactory("AgentApi");
  const agentApi = await AgentApi.attach(agentApiAddress);

  const Ailey = await hre.ethers.getContractFactory("Ailey");
  const aleToken = await Ailey.attach(aleTokenAddress);

  const allowance = await aleToken.allowance(user3.address, agentApiAddress);
  console.log("Current approved token amount:", allowance.toString());

  const balance = await aleToken.balanceOf(user3.address);
  console.log("User3 token balance:", balance.toString());

  if (Number(allowance.toString()) < 44) {
    console.log("Insufficient token approval. Re-approving...");
    const approveTx = await aleToken.connect(user3).approve(agentApiAddress, 987654321);
    await approveTx.wait();
    console.log("Token approval completed");
  }

  const callTestTx = await agentApi.connect(user3).callTest();
  await callTestTx.wait();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
