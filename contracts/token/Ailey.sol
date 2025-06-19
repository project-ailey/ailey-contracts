// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract Ailey is ERC20, ERC20Permit {
    constructor() ERC20("Ailey", "ALE") ERC20Permit("Ailey") {
        _mint(msg.sender, 1000000000 * 10 ** decimals());
    }
}
