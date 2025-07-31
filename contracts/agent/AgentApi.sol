// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import "../token/Ailey.sol";
import "../ailey/AileyApi.sol";

contract AgentApi is Initializable {
	uint256 public agentId;
	Ailey public aleToken;
	AileyApi public aileyApiContract;

	function version() public pure returns (string memory) {
		return "1.0.0";
	}

	function initialize(uint256 _agentId, Ailey _aleToken, AileyApi _aileyApiContract) external initializer {
		agentId = _agentId;
		aleToken = _aleToken;
		aileyApiContract = _aileyApiContract;
	}

	function callTest() external {
		aileyApiContract.test(msg.sender);
	}

	function callAddLiquidity(
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
	) external {
		IERC20(tokenA).transferFrom(msg.sender, address(aileyApiContract), amountADesired);
		IERC20(tokenB).transferFrom(msg.sender, address(aileyApiContract), amountBDesired);

		(uint256 tokenId, uint128 liquidity, uint256 amountAUsed, uint256 amountBUsed) =
							aileyApiContract.addLiquidity(
				tokenA,
				tokenB,
				fee,
				tickLower,
				tickUpper,
				amountADesired,
				amountBDesired,
				amountAMin,
				amountBMin,
				to,
				deadline
			);

		uint256 remainingTokenA = IERC20(tokenA).balanceOf(address(this));
		uint256 remainingTokenB = IERC20(tokenB).balanceOf(address(this));

		if (remainingTokenA > 0) {
			IERC20(tokenA).transfer(msg.sender, remainingTokenA);
		}
		if (remainingTokenB > 0) {
			IERC20(tokenB).transfer(msg.sender, remainingTokenB);
		}
	}
}
