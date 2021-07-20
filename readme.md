# ERC20 Starter

A simple ERC20 contract with minting/ transfer restrictions.

## Specifications
1. Mint requested amount of tokens to the caller's address 
2. Having a daily limit of 100k base units and a Global Limit of 10 million base units per address
3. Token is using 5 decimals


## Prerequisites
1. [nodejs](https://nodejs.org/en/)
2. [Hardhat](https://hardhat.org/getting-started/#installation)
3. _Optionally, [hardhat shorthand](https://hardhat.org/guides/shorthand.html)_

## Install

```Shell
npm install
```

## Usage
Add .env to root and insert below details

Parameter | Description
--- | ---
PRIVATE_KEY | Your wallet's private key
ALCHEMY_ID | Alchemy API ID
CONTRACT_NAME | Your Token Name
CONTRACT_ADDRESS | Your Contract Address (from deploy-script.js)
WALLET_ADDRESS | Address for testing purposes (for update-date.js)
ETHERSCAN_API_KEY | Optional 

## Testing

```Shell
hh test
```

## Deploy
```Shell
hh run scripts/deploy-script.js --network localhost // for local testing
hh run scripts/deploy-script.js --network rinkeby
```

## Verify Contract
```Shell
hh verify CONTRACT_ADDRESS --network rinkeby
```

## Methods

Name | Access | Description
--- | --- | ---
mint() | any | Mint Tokens
transfer() | any | Override function for check Global Balance
getDailyWalletBalance() | any | Get users wallet balance
lastTransferDateUpdate() | onlyOwner | Can update Transfer date in struct (for testing)
burn() | onlyOwner | Burn Tokens


### Update Last Transfer Date

You can update the lastTransferDate from below script.

Change `newPrevDate` in **scripts/update-date.js** file for an earlier epoch time.

```Shell
hh run scripts/update-date.js  --network localhost
```



## Test Results

For testing purposes, can change initialSupply, globalLimit and dailyLimit in the smart contract 

```Solidity
uint initialSupply      = 100 * (10 ** decimals());
uint public globalLimit = 15  * (10 ** decimals());
uint public dailyLimit  = 10  * (10 ** decimals());
```

And, run a hardhat local node

```Shell
npx hardhat node
```

```
  WattToken Contract

 Token Name       :  WattToken
 Symbol           :  WATT
 Decimals         :  5
 InitialSupply    :  10000000
 GlobalLimit      :  1500000
 DailyLimit       :  1000000

    Deployment
      ✓ Should check Contract Owner
      ✓ Should check Decimal Points
      ✓ Should check Daily Limit
      ✓ Should check Global Limit
    Test for 'daily minting' values
      ✓ Should maximum mint 'dailyLimit' only for Account #1
      ✓ Should return 'daily limit exceeded' error for Account #1
      ✓ Should mint maximum 'dailyLimit' for Account #2
      ✓ Should return 'daily limit exceeded' Error for Account #2
      ✓ Should return Account #3 balance as 0
    Test for 'Global Minting' values
      ✓ Should replace 'lastTransferDate' for newly set date of Account #1
      ✓ Should match Account #1 globalalance for prev dailyLimit only
      ✓ Should mint a new amount for account #1
      ✓ Should match global Balance of account #1 for 'globalLimit'
      ✓ Should return 'global limit exceeded' Error for Account #1
      ✓ Should match Account #2 global balance for prev 'dailyLimit' only
      ✓ Should return 'daily limit exceeded' Error for Account #2 [Time NOT UPDATED]
      ✓ Should mint a new amount for account # [Time UPDATED]
      ✓ Should match global Balance of account #2 for 'globalLimit'
      ✓ Should return 'global limit exceeded' Error for Account #2
      ✓ Should return Account #3 balance as 0
    Test for 'transfer' option not exceeding the global limit

 Account #1 Balance 1500000
 Account #2 Balance 1500000
 Account #3 Balance 0

      ✓ Should get all Account balances
      ✓ Should not able to transfer extra amount 'more than' the 'globalLimit' from Account #1 to Account #2
      ✓ Should not able to transfer extra amount 'more than' the 'globalLimit' from Account #2 to Account #1
      ✓ Should not able to transfer an amount more than 'globalLimit' from Contract Owner to Account #3
      ✓ Should able to transfer 'less than or equal' amount to 'globalLimit' from Account #1 to Account #3
```

## Mint UI

A simple Mint Token UI is located at `frontend' folder.

Change the `provider` and `WattContractAddr` in the index.html file accordingly.

JsonRpcProvider

```javascript
const provider = new ethers.providers.JsonRpcProvider(URL);
```
Alchemy Provider
```javascript
const provider = new ethers.providers.AlchemyProvider("rinkeby", apiKey)
```