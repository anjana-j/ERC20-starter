const hre = require("hardhat");
require('dotenv').config();

const CONTRACT_NAME    = process.env.CONTRACT_NAME;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const WALLET_ADDRESS   = process.env.TESTING_WALLET;

let ERC20, WattContract, newPrevDate;

async function main() {

  newPrevDate = 1626307200; //2021-07-15 00:00:00 GMT
  
  ERC20 = await hre.ethers.getContractFactory(CONTRACT_NAME);
  
  WattContract = ERC20.attach(CONTRACT_ADDRESS);

  await WattContract.lastTransferDateUpdate(newPrevDate, WALLET_ADDRESS);

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
