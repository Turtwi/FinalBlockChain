    // SPDX-License-Identifier: MIT
    // Compatible with OpenZeppelin Contracts ^5.0.0
    pragma solidity ^0.8.20;

    import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
    import "@openzeppelin/contracts/access/Ownable.sol";

    contract GymCoin is ERC20, Ownable {
        uint256 public buyRate;
        uint256 public sellRate;
        address public constant ownerAddress = 0x083DBbCA805195CAbb062050ee1C883c9d7516f9; 
        

        constructor() ERC20("GymCoin", "GC") Ownable(ownerAddress) {
            _mint(ownerAddress, 10000 * 10 ** decimals());
            buyRate = 10000; // 1 ETH = 10000 GC
            sellRate = 9999; // 1 GC = 0.0001 ETH
        }


        event BuyCoin(address indexed buyer, uint256 gcAmount);
        event SellCoin(address indexed seller, uint256 gcAmount);
        event TransferCoin(address indexed from, address indexed to, uint256 gcAmount);
        event SetRates(uint256 newBuyRate, uint256 newSellRate);

        function buyCoin(uint256 gcAmount) external payable {
            uint256 ethAmount = gcAmount / sellRate ;
            require(msg.value > 0, "ETH must be more than 0");
            require(gcAmount > 0, "You need to buy more than 0 GymCoin");
            require(msg.value >= ethAmount, "ETH amount cannot be less than the GymCoin amount");
            require(balanceOf(address(ownerAddress)) >= gcAmount, "Not enough GymCoin in the contract");

            _transfer(address(ownerAddress), msg.sender, gcAmount * 10000);
            
            emit BuyCoin(msg.sender, gcAmount * 10000);
        }

        function sellCoin(uint256 gcAmount) external{
            uint256 ethAmount = gcAmount / buyRate ;
            require(ethAmount > 0, "ETH must be more than 0");
            require(gcAmount > 0, "You need to have more than 0 GymCoin to sell");
            require(balanceOf(address(msg.sender)) >= gcAmount, "You need to have more GymCoin to sell");
            require(address(ownerAddress).balance >= ethAmount, "Not enough ETH in contract");

            _transfer(address(msg.sender), address(ownerAddress), gcAmount);
            payable(msg.sender).transfer(ethAmount);

            emit SellCoin(msg.sender, gcAmount);
        }

        function transfer(address destAddress, uint256 gcAmount) public override returns (bool) {
            bool success = super.transfer(destAddress, gcAmount);
            emit TransferCoin(msg.sender, destAddress, gcAmount);
            return success;
        }

        function setRates(uint256 newBuyRate, uint256 newSellRate) external onlyOwner {
            sellRate = newSellRate;
            buyRate = newBuyRate;
            
            emit SetRates(newBuyRate, newSellRate);
        }
        
        receive() external payable {}
    }