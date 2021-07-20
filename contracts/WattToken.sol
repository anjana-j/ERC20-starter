//SPDX-License-Identifier: MIT
pragma solidity 0.8.4;
pragma abicoder v2;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

contract WattToken is ERC20, Ownable {

    using Strings  for uint256;
    using SafeMath for uint256;
    using SafeMath for uint16;
    
    /* Token Related */
    string tokenName   = "WattToken";
    string tokenSymbol = "WATT";
    
    uint initialSupply      = 100000000 * (10 ** decimals()); // 100 million
    uint public globalLimit = 10000000  * (10 ** decimals()); // 10 million
    uint public dailyLimit  = 100000    * (10 ** decimals()); // 100K

    struct dailyWalletBalance {
        uint    totalBalance;
        address owner;
        uint    timestamp;
    }

    mapping(address => dailyWalletBalance) walletBalanceCheck;

    event WalletBalance(
        address owner, 
        uint balance, 
        uint timestamp
    );

    modifier validAddr(address to) {
        require(to != address(0x0));
        require(to != address(this));
        _;
    } 

    constructor() 
    ERC20(
        tokenName,
        tokenSymbol
    ) {
        _mint(msg.sender, initialSupply);
    }

    /* decimal override */
    function decimals() public view virtual override returns (uint8) {
        return 5;
    }

    // minting tokens
    function mint(
        uint256 amount
    ) 
    public
    validAddr(msg.sender)  
    returns (bool) {

        address recipient = msg.sender;

        // set/ reset daily wallet balance
        if (block.timestamp > walletBalanceCheck[recipient].timestamp + 24 hours) {
            walletBalanceCheck[recipient].totalBalance = 0;
        }

        // check for global balance
        uint256 globalBalance;
        globalBalance = balanceOf(recipient) + amount * (10 ** decimals()); // existing balance + amount sending
        require(globalBalance <= globalLimit, 'Your Global Limit exceeded');

        // check daily limit
        uint256 dailyBalance;
        dailyBalance = (walletBalanceCheck[recipient].totalBalance * (10 ** decimals())) + (amount * (10 ** decimals()));
        require(dailyBalance <= dailyLimit, 'Your Daily Limit exceeded');

        // add transfer info to struct
        walletBalanceCheck[recipient].totalBalance += amount;
        walletBalanceCheck[recipient].owner = recipient;
        walletBalanceCheck[recipient].timestamp = block.timestamp;

        // ~ global balance is managing by ERC20 BalanceOf function

        _mint(recipient, amount * (10 ** decimals()));
        emit WalletBalance(recipient, amount, block.timestamp);

        return true;
    }


    // overriding transfer function to keep the wallet balance in global limit
    function transfer(
        address _to, 
        uint256 _amount
    ) 
    public 
    override
    returns (bool) {

        uint256 globalBalance;
        globalBalance = balanceOf(_to) + _amount * (10 ** decimals()); // existing balance + amount sending
        require(globalBalance <= globalLimit, 'Cannot have tokens more than the Global Limit');
        
        super.transfer(_to, _amount * (10 ** decimals()));
        emit WalletBalance(_to, _amount, block.timestamp);
        return true;
    }

    // other admin only functions

    function getDailyWalletBalance(
        address userWallet
    ) 
    public 
    view  
    returns(uint256, uint256) {
        
        uint256 userWalletBalance = walletBalanceCheck[userWallet].totalBalance * (10 ** decimals());
        uint256 userLastTransferDate = walletBalanceCheck[userWallet].timestamp;
        
        return (userWalletBalance, userLastTransferDate);
    }

    function lastTransferDateUpdate(
        uint256 manualDate,
        address recepient
    )
    public 
    onlyOwner  {
        walletBalanceCheck[recepient].timestamp = manualDate;
    }

    function burn(
        uint256 amount
    ) 
    public 
    onlyOwner {
        _burn(msg.sender, amount * (10 ** decimals()));
    }
    
}

