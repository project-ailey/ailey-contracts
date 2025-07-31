interface IUniswapV3Factory {
	/// @notice Emitted when a pool is created
	/// @param token0 The first token of the pool by address sort order
	/// @param token1 The second token of the pool by address sort order
	/// @param fee The fee collected upon every swap in the pool, denominated in hundredths of a bip
	/// @param tickSpacing The minimum number of ticks between initialized ticks
	/// @param pool The address of the created pool
	event PoolCreated(
		address indexed token0,
		address indexed token1,
		uint24 indexed fee,
		int24 tickSpacing,
		address pool
	);

	function getPool(
		address tokenA,
		address tokenB,
		uint24 fee
	) external view returns (address);

	function createPool(
		address tokenA,
		address tokenB,
		uint24 fee
	) external returns (address);
}
