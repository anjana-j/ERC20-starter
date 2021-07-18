const { expect } = require("chai");

describe("WattToken Contract", function() {

  let ERC20, WattContract, provider;
  let contractOwner, customer1, customer2, customer3;
  let setDecimals, setDailyLimit, setGlobalLimit;
  let name, symbol, dailyLimit, globalLimit, initialSupply, decimals, owner;
  let newMintAmount, extraMintAmount;

  setDecimals    = 5;
  setGlobalLimit = 15;
  setDailyLimit  = 10;
  

  // new mint amount
  newMintAmount   = 5;
  extraMintAmount = 1;

  before(async function () {

    provider = ethers.provider;
    [contractOwner, customer1, customer2, customer3] = await ethers.getSigners();

    ERC20 = await ethers.getContractFactory("WattToken");
    WattContract = await ERC20.deploy();

    name             = await WattContract.name();
    symbol           = await WattContract.symbol();
    decimals         = await WattContract.decimals();
    owner            = await WattContract.owner();
    initialSupply    = await WattContract.totalSupply();
    dailyLimit       = await WattContract.dailyLimit();
    globalLimit      = await WattContract.globalLimit();

    console.log("\n",
      "Token Name       : ",name, "\n",
      "Symbol           : ",symbol, "\n",
      "Decimals         : ",decimals, "\n",
      "InitialSupply    : ",initialSupply.toNumber(), "\n",
      "GlobalLimit      : ",globalLimit.toNumber(), "\n",
      "DailyLimit       : ",dailyLimit.toNumber(), "\n"
    );


  });


  describe("Deployment", function () {

    it("Should check Contract Owner", async function () {
      expect(owner).to.equal(contractOwner.address);
    });

    it("Should check Decimal Points", async function () {
      expect(decimals).to.equal(setDecimals);
    });

    it("Should check Daily Limit", async function () {
      expect(dailyLimit.toNumber()).to.equal(setDailyLimit * (10 ** setDecimals));
    });

    it("Should check Global Limit", async function () {
      expect(globalLimit.toNumber()).to.equal(setGlobalLimit * (10 ** setDecimals));
    });

  });


  describe("Test for 'daily minting' values", function () {

    let customer1Balance, customer2Balance, customer3Balance;

    it("Should maximum mint daily limit only for Account #1", async function () {

      await WattContract.mint(customer1.address, setDailyLimit);
      customer1Balance = await WattContract.getDailyWalletBalance(customer1.address);
      expect(customer1Balance[0]).to.equal(setDailyLimit * (10 ** setDecimals));
    });


    it("Should give 'daily limit exceeded' Error for Account #1", async function () {

      await expect(
        WattContract.mint(customer1.address, extraMintAmount)
      ).to.be.revertedWith("Your Daily Limit exceeded");
      
    });

    it("Should mint maximum daily limit for Account #2", async function () {

      await WattContract.mint(customer2.address, setDailyLimit);
      customer2Balance = await WattContract.getDailyWalletBalance(customer2.address);
      expect(customer2Balance[0]).to.equal(setDailyLimit * (10 ** setDecimals));
    });


    it("Should give 'daily limit exceeded' Error for Account #2", async function () {

      await expect(
        WattContract.mint(customer2.address, extraMintAmount)
      ).to.be.revertedWith("Your Daily Limit exceeded");
      
    });


    it("Should give Account #3 balance as 0", async function () {

      customer3Balance = await WattContract.getDailyWalletBalance(customer3.address);
      expect(customer3Balance[0]).to.equal(0);
      
    });

  });

  // ---- global balance testing

  describe("Test for 'Global Minting' values", function () {

    let newPrevDate;
    let dailyWalletBalanceBeforeC1Arr, dailyWalletBalanceBeforeC2Arr, dailyWalletBalanceBeforeC3Arr;
    let getLastTransferBalC1, getLastTransferBalC2, getLastTransferBalC3;
    let getLastTransferDateC1, getLastTransferDateC2, getLastTransferDateC3;

    let getNewLastTransferDateC1Arr, getNewLastTransferDateC2Arr, getNewLastTransferDateC3Arr;

    // setting for old date, so block.timestamp will be new
    newPrevDate = 1626307200; //2021-07-15 00:00:00 GMT

    before(async function () {
      
      // get Account #1 and Account #2 balances and last update dates
      dailyWalletBalanceBeforeC1Arr = await WattContract.getDailyWalletBalance(customer1.address);
      dailyWalletBalanceBeforeC2Arr = await WattContract.getDailyWalletBalance(customer2.address);
      dailyWalletBalanceBeforeC3Arr = await WattContract.getDailyWalletBalance(customer3.address);

      // last balances
      getLastTransferBalC1 = dailyWalletBalanceBeforeC1Arr[0];
      getLastTransferBalC2 = dailyWalletBalanceBeforeC2Arr[0];
      getLastTransferBalC3 = dailyWalletBalanceBeforeC3Arr[0];

      // last transfer dates
      getLastTransferDateC1 = dailyWalletBalanceBeforeC1Arr[1];
      getLastTransferDateC2 = dailyWalletBalanceBeforeC2Arr[1];
      getLastTransferDateC3 = dailyWalletBalanceBeforeC3Arr[1];

      // update last transfer date for Account #1
      await WattContract.lastTransferDateUpdate(newPrevDate, customer1.address);
      getNewLastTransferDateC1Arr = await WattContract.getDailyWalletBalance(customer1.address);

      // console.log("\n",
      //   "Account 1 : \n",
      //   "prevLastTransferDate : ",getLastTransferDateC1.toNumber(), "\n",
      //   "newLastTransferDate  : ",getNewLastTransferDateC1Arr[1].toNumber(), "\n"
      // );

    });


    it("Should replace 'lastTransferDate' for newly set date of Account #1", async function () {
      expect(getNewLastTransferDateC1Arr[1].toNumber()).to.equal(newPrevDate);
    });


    it("Should match Account #1 global balance for prev daily limit only", async function () {
      expect(await WattContract.balanceOf(customer1.address)).to.equal(getLastTransferBalC1);
    });


    it("Should mint a new amount of 5 for account #1", async function () {
      await WattContract.mint(customer1.address, newMintAmount);

      getNewLastTransferDateC1Arr = await WattContract.getDailyWalletBalance(customer1.address);
      expect(getNewLastTransferDateC1Arr[0].toNumber()).to.equal(newMintAmount * (10 ** setDecimals));
    });


    it("Should match global Balance of account #1 for 15", async function () {
      expect(await WattContract.balanceOf(customer1.address)).to.equal( setGlobalLimit * (10 ** setDecimals));
    });


    it("Should give 'global limit exceeded' Error for Account #1", async function () {

      await expect(
        WattContract.mint(customer1.address, extraMintAmount)
      ).to.be.revertedWith("Your Global Limit exceeded");
      
    });

    // ---------------


    it("Should match Account #2 global balance for prev daily limit only", async function () {
      expect(await WattContract.balanceOf(customer2.address)).to.equal(getLastTransferBalC2);
    });


    it("Should give 'daily limit exceeded' Error for Account #2 - time is not updated", async function () {
      await expect(
        WattContract.mint(customer2.address, extraMintAmount)
      ).to.be.revertedWith("Your Daily Limit exceeded");
    });


    it("Should mint a new amount of 5 for account # - time Updated", async function () {

      await WattContract.lastTransferDateUpdate(newPrevDate, customer2.address);
      await WattContract.mint(customer2.address, newMintAmount);

      getNewLastTransferDateC2Arr = await WattContract.getDailyWalletBalance(customer2.address);
      expect(getNewLastTransferDateC2Arr[0].toNumber()).to.equal(newMintAmount * (10 ** setDecimals));
    });


    it("Should match global Balance of account #2 for 15", async function () {
      expect(await WattContract.balanceOf(customer2.address)).to.equal( setGlobalLimit * (10 ** setDecimals));
    });


    it("Should give 'global limit exceeded' Error for Account #2", async function () {

      await expect(
        WattContract.mint(customer2.address, extraMintAmount)
      ).to.be.revertedWith("Your Global Limit exceeded");
      
    });


    it("Should give Account #3 balance as 0", async function () {

      expect(getLastTransferBalC3).to.equal(0);
      
    });

  });

});