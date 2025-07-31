
import { expect } from "chai";
import { ethers } from "hardhat";
import { Ailey } from "../typechain-types";

describe("Ailey Token", function () {
  let ailey: Ailey;

  beforeEach(async function () {
    const Ailey = await ethers.getContractFactory("Ailey");
    ailey = await Ailey.deploy();
  });

  it("should have the correct name", async function () {
    expect(await ailey.name()).to.equal("Ailey");
  });

  it("should have the correct symbol", async function () {
    expect(await ailey.symbol()).to.equal("ALE");
  });

  it("should have the correct total supply", async function () {
    const expectedSupply = ethers.parseUnits("1000000000", 18);
    expect(await ailey.totalSupply()).to.equal(expectedSupply);
  });
});
