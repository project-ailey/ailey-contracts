interface IUniswapV3Pool {
	// https://github.com/Uniswap/v3-core/blob/main/contracts/interfaces/pool/IUniswapV3PoolActions.sol
	function initialize(uint160 sqrtPriceX96) external;

	function slot0()
	external
	view
	returns (
		uint160 sqrtPriceX96,
		int24 tick,
		uint16 observationIndex,
		uint16 observationCardinality,
		uint16 observationCardinalityNext,
		uint8 feeProtocol,
		bool unlocked
	);
}
