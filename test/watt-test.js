const { expect } = require("chai");

describe("WattToken Contract", function() {

  let ERC20, WattContract, provider;
  let contractOwner, customer1, customer2, customer3;
  let setDecimals, setDailyLimit, setGlobalLimit;
  let name, symbol, dailyLimit, globalLimit, initialSupply, decimals, owner;
  let newMintAmount, extraMintAmount;

  setDecimals     = 5;

  // setting limits for testing purposes
  setGlobalLimit  = 15;
  setDailyLimit   = 10;
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

  // ---- daily limit testing

  describe("Test for 'daily minting' values", function () {

    let customer1Balance, customer2Balance, customer3Balance;

    it("Should maximum mint 'dailyLimit' only for Account #1", async function () {

      await WattContract.connect(customer1).mint(setDailyLimit);
      customer1Balance = await WattContract.getDailyWalletBalance(customer1.address);
      expect(customer1Balance[0]).to.equal(setDailyLimit * (10 ** setDecimals));
    });


    it("Should return 'daily limit exceeded' error for Account #1", async function () {

      await expect(
        WattContract.connect(customer1).mint(extraMintAmount)
      ).to.be.revertedWith("Your Daily Limit exceeded");
      
    });

    it("Should mint maximum 'dailyLimit' for Account #2", async function () {

      await WattContract.connect(customer2).mint(setDailyLimit);
      customer2Balance = await WattContract.getDailyWalletBalance(customer2.address);
      expect(customer2Balance[0]).to.equal(setDailyLimit * (10 ** setDecimals));
    });


    it("Should return 'daily limit exceeded' Error for Account #2", async function () {

      await expect(
        WattContract.connect(customer2).mint(extraMintAmount)
      ).to.be.revertedWith("Your Daily Limit exceeded");
      
    });


    it("Should return Account #3 balance as 0", async function () {

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

    });


    it("Should replace 'lastTransferDate' for newly set date of Account #1", async function () {
      expect(getNewLastTransferDateC1Arr[1].toNumber()).to.equal(newPrevDate);
    });


    it("Should match Account #1 globalalance for prev dailyLimit only", async function () {
      expect(await WattContract.balanceOf(customer1.address)).to.equal(getLastTransferBalC1);
    });


    it("Should mint a new amount for account #1", async function () {
      await WattContract.connect(customer1).mint(newMintAmount);

      getNewLastTransferDateC1Arr = await WattContract.getDailyWalletBalance(customer1.address);
      expect(getNewLastTransferDateC1Arr[0].toNumber()).to.equal(newMintAmount * (10 ** setDecimals));
    });


    it("Should match global Balance of account #1 for 'globalLimit'", async function () {
      expect(await WattContract.balanceOf(customer1.address)).to.equal( setGlobalLimit * (10 ** setDecimals));
    });


    it("Should return 'global limit exceeded' Error for Account #1", async function () {

      await expect(
        WattContract.connect(customer1).mint(extraMintAmount)
      ).to.be.revertedWith("Your Global Limit exceeded");
      
    });

    // ---------------


    it("Should match Account #2 global balance for prev 'dailyLimit' only", async function () {
      expect(await WattContract.balanceOf(customer2.address)).to.equal(getLastTransferBalC2);
    });


    it("Should return 'daily limit exceeded' Error for Account #2 [Time NOT UPDATED]", async function () {
      await expect(
        WattContract.connect(customer2).mint(extraMintAmount)
      ).to.be.revertedWith("Your Daily Limit exceeded");
    });


    it("Should mint a new amount for account # [Time UPDATED]", async function () {

      await WattContract.lastTransferDateUpdate(newPrevDate, customer2.address);
      await WattContract.connect(customer2).mint(newMintAmount);

      getNewLastTransferDateC2Arr = await WattContract.getDailyWalletBalance(customer2.address);
      expect(getNewLastTransferDateC2Arr[0].toNumber()).to.equal(newMintAmount * (10 ** setDecimals));
    });


    it("Should match global Balance of account #2 for 'globalLimit'", async function () {
      expect(await WattContract.balanceOf(customer2.address)).to.equal(setGlobalLimit * (10 ** setDecimals));
    });


    it("Should return 'global limit exceeded' Error for Account #2", async function () {

      await expect(
        WattContract.connect(customer2).mint(extraMintAmount)
      ).to.be.revertedWith("Your Global Limit exceeded");
      
    });


    it("Should return Account #3 balance as 0", async function () {

      expect(getLastTransferBalC3).to.equal(0);
      
    });

  });

  // transfer function testing

  describe("Test for 'transfer' option not exceeding the global limit", function () {

    let customer1LastBalance, customer2LastBalance, customer3LastBalance;


    it("Should get all Account balances", async function () {

      customer1LastBalance = await WattContract.balanceOf(customer1.address);
      customer2LastBalance = await WattContract.balanceOf(customer2.address);
      customer3LastBalance = await WattContract.balanceOf(customer3.address);

      console.log("\n",

        "Account #1 Balance", customer1LastBalance.toNumber(), "\n",
        "Account #2 Balance", customer2LastBalance.toNumber(), "\n",
        "Account #3 Balance", customer3LastBalance.toNumber(), "\n",

      );

    });

    it("Should not able to transfer extra amount 'more than' the 'globalLimit' from Account #1 to Account #2", async function () {
      
      await expect(
        WattContract.connect(customer1).transfer(customer2.address, extraMintAmount)
      ).to.be.revertedWith("Cannot have tokens more than the Global Limit");

    });

    it("Should not able to transfer extra amount 'more than' the 'globalLimit' from Account #2 to Account #1", async function () {
      
      await expect(
        WattContract.connect(customer2).transfer(customer1.address, extraMintAmount)
      ).to.be.revertedWith("Cannot have tokens more than the Global Limit");

    });

    it("Should not able to transfer an amount more than 'globalLimit' from Contract Owner to Account #3", async function () {
      
      await expect(
        WattContract.connect(contractOwner).transfer(
          customer3.address, 
          (setGlobalLimit + extraMintAmount))
      ).to.be.revertedWith("Cannot have tokens more than the Global Limit");
      
    });


    it("Should able to transfer 'less than or equal' amount to 'globalLimit' from Account #1 to Account #3", async function () {
      
      expect(await WattContract.connect(customer1).transfer(
        customer3.address, 
        setGlobalLimit)
      );
    });


  });

});


