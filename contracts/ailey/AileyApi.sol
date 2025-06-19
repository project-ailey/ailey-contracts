// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "../token/Ailey.sol";

contract AileyApi is Initializable, AccessControlUpgradeable, ReentrancyGuard {
	using SafeERC20 for IERC20;

	bytes32 public constant AGENT_ROLE = keccak256("AGENT_ROLE");

	Ailey public aleToken;

	constructor(){
		_disableInitializers();
	}

	function initialize(Ailey _aleToken) external initializer {
		__AccessControl_init();
		_grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

		aleToken = _aleToken;
	}

	function test(address from) external nonReentrant onlyRole(AGENT_ROLE) {
		require(address(aleToken) != address(0), "ALE token address not set");
		IERC20(aleToken).safeTransferFrom(
			from,
			address(this),
			44
		);
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
