// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "../agent/AgentApi.sol";
import "../ailey/AileyApi.sol";
import "../pool/IUniswapV2Router02.sol";
import "../token/Ailey.sol";

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";


contract AileyPlatform is Initializable, AccessControlUpgradeable, OwnableUpgradeable  {
	using SafeERC20 for IERC20;

	uint256 public agentId;
	Ailey public aleToken;
	AileyApi public aileyApiContract;
	IUniswapV2Router02 public uniswapRouter;
	address public WBNB;

	event AgentCreated(uint256 indexed id, address indexed addr);

	constructor() {
		_disableInitializers();
	}

	function initialize(Ailey _aleToken, AileyApi _aileyApiContract, address _routerAddress, address _WBNBAddress) external initializer {
		require(_routerAddress != address(0), "Router address cannot be zero.");
		require(_WBNBAddress != address(0), "WBNB address cannot be zero.");

		__AccessControl_init();
		__Ownable_init(_msgSender());
		_grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

		aleToken = _aleToken;
		aileyApiContract = _aileyApiContract;
		uniswapRouter = IUniswapV2Router02(_routerAddress);
		WBNB = _WBNBAddress;
	}

	function createAgent() external returns (address) {
		agentId++;
		AgentApi agent = new AgentApi();
		agent.initialize(agentId, aleToken, aileyApiContract);
		aileyApiContract.grantRole(aileyApiContract.AGENT_ROLE(), address(agent));
		emit AgentCreated(agentId, address(agent));
		return address(agent);
	}

	function swapBNBForCustomToken(
		uint256 amountOutMin,
		uint256 deadline
	) external payable {
		require(msg.value > 0, "You must send BNB to perform the swap.");

		address[] memory path = new address[](2);
		path[0] = address(WBNB);
		path[1] = address(aleToken);

		uniswapRouter.swapExactETHForTokensSupportingFeeOnTransferTokens{value: msg.value}(
			amountOutMin,
			path,
			msg.sender,
			deadline
		);
	}

	receive() external payable {}

	function withdrawERC20(address tokenAddress, uint256 amount) external onlyOwner {
		require(tokenAddress != WBNB, "WBNB cannot be withdrawn using this function.");
		require(tokenAddress != address(aleToken), "Custom ERC20 tokens cannot be withdrawn using this function.");
		IERC20(tokenAddress).safeTransfer(owner(), amount);
	}

	function withdrawBNB() external onlyOwner {
		payable(owner()).transfer(address(this).balance);
	}
}
