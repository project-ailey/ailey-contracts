/*
npx hardhat run scripts/calculateLiquidity.js --network bscTestnet
*/
const { ethers } = require("hardhat");
const { Token, Price } = require("@uniswap/sdk-core");
const { Pool, Position, nearestUsableTick } = require("@uniswap/v3-sdk");
const JSBI = require("jsbi");
require('dotenv').config();

async function main() {
	console.log("Starting PancakeSwap V3 liquidity calculation script...");

	// Debug: Check if ethers.BigNumber is defined
	console.log("ethers.BigNumber defined:", typeof ethers.BigNumber !== "undefined");

	// 1. Setup provider
	const provider = ethers.provider;

	// 2. Define tokens
	const ALE = new Token(
		97, // BSC Testnet Chain ID
		process.env.ALE_TOKEN_ADDRESS, // ALE address
		18,
		"ALE",
		"ALE Token"
	);

	const WBNB = new Token(
		97, // BSC Testnet Chain ID
		process.env.WBNB_ADDRESS, // WBNB address
		18,
		"WBNB",
		"Wrapped BNB"
	);

	// ALE address < WBNB address, so the pool is ALE/WBNB (ALE = token0, WBNB = token1)
	const token0 = ALE.address.toLowerCase() < WBNB.address.toLowerCase() ? ALE : WBNB;
	const token1 = ALE.address.toLowerCase() < WBNB.address.toLowerCase() ? WBNB : ALE;

	// 3. Get current pool status (from slot0)
	// Uniswap V3 Factory address (BSC Testnet)
	const factoryAddress = process.env.UNISWAP_V3_FACTORY_ADDRESS;

	// IUniswapV3Factory ABI
	const factoryAbi = [
		"function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address)"
	];

	// IUniswapV3Pool ABI (for calling slot0)
	const poolAbi = [
		"function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)"
	];

	// 3. Get current pool status (from slot0)
	const fee = 100;
	const factoryContract = new ethers.Contract(factoryAddress, factoryAbi, provider);
	const poolAddress = await factoryContract.getPool(token0.address, token1.address, fee);

	if (!poolAddress || poolAddress === ethers.AddressZero)
		throw new Error("Could not find pool address.");
	console.log(`Pool address: ${poolAddress}`);

	const poolContract = new ethers.Contract(poolAddress, poolAbi, provider);
	const { sqrtPriceX96: currentSqrtPriceX96, tick: currentTick } = await poolContract.slot0();
	console.log(`sqrtPriceX96: ${currentSqrtPriceX96.toString()}, tick: ${currentTick}`);

	// 4. Create Pool object
	const pool = new Pool(
		token0,
		token1,
		fee,
		JSBI.BigInt(currentSqrtPriceX96.toString()), // JSBI object
		0, // initial liquidity
		Number(currentTick),
		[] // ticks (oracle data)
	);

	console.log(`Current pool price (WBNB per ALE): ${pool.token1Price.toSignificant(10)}`);
	console.log(`Current pool price (ALE per WBNB): ${pool.token0Price.toSignificant(10)}`);
	console.log(`Current tick: ${pool.tickCurrent}`);

	// 5. Define tick range for liquidity provision (0.01% tier, tick spacing 10)
	// Based on 1 WBNB = 1000 ALE, ±10% range (900~1100 ALE)
	const tickLower = nearestUsableTick(-70020, 10); // 1100 ALE
	const tickUpper = nearestUsableTick(-68060, 10); // 900 ALE

	// 6. Create Position object
	const desiredAmount0 = ethers.parseUnits("100", token0.decimals); // 1000 ALE
	const desiredAmount1 = ethers.parseUnits("0.01", token1.decimals); // 0.1 WBNB

	const position = Position.fromAmounts({
		pool: pool,
		tickLower: tickLower,
		tickUpper: tickUpper,
		amount0: desiredAmount0.toString(),
		amount1: desiredAmount1.toString(),
		useFullPrecision: true // use full precision
	});

	console.log(`\nCalculated Liquidity: ${position.liquidity.toString()}`);
	console.log(`Required ALE (amount0): ${position.amount0.toExact()} (${position.amount0.toSignificant(18)} Ethers)`);
	console.log(`Required WBNB (amount1): ${position.amount1.toExact()} (${position.amount1.toSignificant(18)} Ethers)`);

	// Convert calculated amount0, amount1 to BigNumber
	const calculatedAmount0 = JSBI.BigInt(position.amount0.quotient.toString());
	const calculatedAmount1 = JSBI.BigInt(position.amount1.quotient.toString());

	// 7. Output MintParams
	console.log("\n-------------------------------------------");
	console.log("Arguments for NonfungiblePositionManager.mint function:");
	console.log(`token0: ${token0.address}`);
	console.log(`token1: ${token1.address}`);
	console.log(`fee: ${pool.fee}`);
	console.log(`tickLower: ${tickLower}`);
	console.log(`tickUpper: ${tickUpper}`);
	console.log(`amount0Desired: ${calculatedAmount0.toString()}`);
	console.log(`amount1Desired: ${calculatedAmount1.toString()}`);

	// Slippage 0.5%
	const slippageTolerance = 0.005;
	const amount0Min = JSBI.divide(
		JSBI.multiply(calculatedAmount0, JSBI.BigInt(1000)),
		JSBI.add(JSBI.BigInt(1000), JSBI.BigInt(Math.floor(slippageTolerance * 1000)))
	).toString();

	const amount1Min = JSBI.divide(
		JSBI.multiply(calculatedAmount1, JSBI.BigInt(1000)),
		JSBI.add(JSBI.BigInt(1000), JSBI.BigInt(Math.floor(slippageTolerance * 1000)))
	).toString();

	console.log(`amount0Min: ${amount0Min}`);
	console.log(`amount1Min: ${amount1Min}`);
	console.log(`recipient: [Your wallet address]`);
	console.log(`deadline: ${Math.floor(Date.now() / 1000) + 60 * 10}`);
	console.log("-------------------------------------------\n");
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
