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
//		IERC20(aleToken).approve(address(aileyApiContract), 44);
		aileyApiContract.test(msg.sender);
	}
}
