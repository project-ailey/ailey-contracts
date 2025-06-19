// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import "../agent/AgentApi.sol";
import "../ailey/AileyApi.sol";
import "../token/Ailey.sol";

contract AileyPlatform is Initializable, AccessControlUpgradeable{
	uint256 public agentId;
	Ailey public aleToken;
	AileyApi public aileyApiContract;

	event AgentCreated(uint256 indexed id, address indexed addr);

	constructor(){
		_disableInitializers();
	}

	function initialize(Ailey _aleToken, AileyApi _aileyApiContract) external initializer {
		__AccessControl_init();
		_grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

		aleToken = _aleToken;
		aileyApiContract = _aileyApiContract;
	}

	function createAgent() external returns (address) {
		agentId++;
		AgentApi agent = new AgentApi();
		agent.initialize(agentId, aleToken, aileyApiContract);
		aileyApiContract.grantRole(aileyApiContract.AGENT_ROLE(), address(agent));
		emit AgentCreated(agentId, address(agent));
		return address(agent);
	}
}
