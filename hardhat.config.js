require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require('hardhat-contract-sizer');
require("hardhat-gas-reporter");
require('dotenv').config();

const PRIVATE_KEY       = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

const GAS_PRICE         = 10000000000; // 10 GWEI
const gasLimit          = 21000000;  

task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
    },
    rinkeby: {
      url:"https://eth-rinkeby.alchemyapi.io/v2/",
      accounts: [PRIVATE_KEY],
      gasPrice: GAS_PRICE,
      blockGasLimit: gasLimit
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  solidity: {
    compilers: [{
        version: "0.8.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ]
  },
  contractSizer: {
    alphaSort: false,
    runOnCompile: false,
    disambiguatePaths: false,
  },
  paths: {
    sources  : "./contracts",
    tests    : "./test",
    cache    : "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 50000
  }
}