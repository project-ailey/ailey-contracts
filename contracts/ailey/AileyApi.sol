// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "../pool/INonfungiblePositionManager.sol";
import "../pool/IUniswapV3Factory.sol";
import "../pool/IUniswapV3Pool.sol";
import "../token/Ailey.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract AileyApi is Initializable, AccessControlUpgradeable, ReentrancyGuard {
	using SafeERC20 for IERC20;

	bytes32 public constant AGENT_ROLE = keccak256("AGENT_ROLE");

	Ailey public aleToken;
	INonfungiblePositionManager public pancakeV3PositionManager;

	constructor(){
		_disableInitializers();
	}

	function initialize(Ailey _aleToken, INonfungiblePositionManager _pancakeV3PositionManager) external initializer {
		__AccessControl_init();
		_grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

		aleToken = _aleToken;
		pancakeV3PositionManager = _pancakeV3PositionManager;
	}

	function test(address from) external nonReentrant onlyRole(AGENT_ROLE) {
		require(address(aleToken) != address(0), "ALE token address not set");
		IERC20(aleToken).safeTransferFrom(
			from,
			address(this),
			44
		);
	}

	function addLiquidity(
		address tokenA,
		address tokenB,
		uint24 fee,
		int24 tickLower,
		int24 tickUpper,
		uint256 amountADesired,
		uint256 amountBDesired,
		uint256 amountAMin,
		uint256 amountBMin,
		address to,
		uint256 deadline
	) external nonReentrant onlyRole(AGENT_ROLE) returns (uint256 tokenId, uint128 liquidity, uint256 amountA, uint256 amountB) {
		require(tokenA != address(0) && tokenB != address(0), "Invalid token addresses");
		require(amountADesired > 0 && amountBDesired > 0, "Invalid amounts");

		// Sort tokens to ensure token0 < token1
		(address token0, address token1, uint256 amount0Desired, uint256 amount1Desired, uint256 amount0Min, uint256 amount1Min) =
			tokenA < tokenB
				? (tokenA, tokenB, amountADesired, amountBDesired, amountAMin, amountBMin)
				: (tokenB, tokenA, amountBDesired, amountADesired, amountBMin, amountAMin);

		// Approve tokens
		IERC20(token0).approve(address(pancakeV3PositionManager), amount0Desired);
		IERC20(token1).approve(address(pancakeV3PositionManager), amount1Desired);

		// Add liquidity
		INonfungiblePositionManager.MintParams memory params = INonfungiblePositionManager.MintParams({
			token0: token0,
			token1: token1,
			fee: fee,
			tickLower: tickLower,
			tickUpper: tickUpper,
			amount0Desired: amount0Desired,
			amount1Desired: amount1Desired,
			amount0Min: amount0Min,
			amount1Min: amount1Min,
			recipient: to,
			deadline: deadline
		});

		(tokenId, liquidity, amountA, amountB) = pancakeV3PositionManager.mint(params);

		// Refund remaining allowance
		IERC20(token0).approve(address(pancakeV3PositionManager), 0);
		IERC20(token1).approve(address(pancakeV3PositionManager), 0);

		uint256 amount0ToReturn = IERC20(token0).balanceOf(address(this));
		uint256 amount1ToReturn = IERC20(token1).balanceOf(address(this));
		if (amount0ToReturn > 0) {
			IERC20(token0).safeTransfer(msg.sender, amount0ToReturn);
		}
		if (amount1ToReturn > 0) {
			IERC20(token1).safeTransfer(msg.sender, amount1ToReturn);
		}

		return (tokenId, liquidity, amountA, amountB);
	}

	function setAgentFactory(address factoryAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
		_grantRole(DEFAULT_ADMIN_ROLE, factoryAddress);
	}

	function borrow() external onlyRole(AGENT_ROLE) {
		// TODO
	}

	function swap() external onlyRole(AGENT_ROLE) {
		// TODO
	}

	function vote() external onlyRole(AGENT_ROLE) {
		// TODO
	}
}
