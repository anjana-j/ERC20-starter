const hre = require("hardhat");
require('dotenv').config();

const CONTRACT_NAME = process.env.CONTRACT_NAME;
let ERC20, WattContract;

async function main() {
  
  ERC20 = await hre.ethers.getContractFactory(CONTRACT_NAME);
  WattContract = await ERC20.deploy();

  await WattContract.deployed();

  console.log("WattContract deployed to:", WattContract.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
