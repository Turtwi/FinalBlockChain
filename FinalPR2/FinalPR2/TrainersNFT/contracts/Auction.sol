// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IERC721 {
    function transfer(address, uint) external;
    function transferFrom(address, address, uint) external;
}

contract Auction is Ownable {
    struct AuctionNFTItem {
        uint256 auctionID;
        address tokenAddress;
        uint256 tokenId;
        uint256 endTime;
        uint256 highestBid;
        address highestBidder;
        bool isSold;
        bool isActive;
    }

    uint256 public auctionNumber = 1;

    mapping(address => AuctionNFTItem) public auctionItems;
    mapping(address => uint256) public auctionIDs;

    event StartAuction(address indexed seller, uint auctionId);
    event BidInAuction(address indexed bidder, uint amount);
    event StopAuction(address indexed winner, uint amount);

    constructor() Ownable(msg.sender) {}

    function startAuction(
        uint256 startPrice,
        IERC721 sellingNFT,
        uint256 sellingNFTId
    ) external {
        require(startPrice > 0, "Start price must be greater than 0");
        require(!auctionItems[msg.sender].isActive, "Auction is already active");

        auctionItems[msg.sender] = AuctionNFTItem({
            auctionID: auctionNumber,
            tokenAddress: address(sellingNFT),
            tokenId: sellingNFTId,
            endTime: block.timestamp + 24 hours,
            highestBid: startPrice,
            highestBidder: address(0),
            isSold: false,
            isActive: true
        });

        auctionIDs[msg.sender] = auctionNumber;
        auctionNumber++;

        sellingNFT.transferFrom(msg.sender, address(this), sellingNFTId);

        emit StartAuction(msg.sender, auctionNumber - 1);
    }

    function bidInAuction(address seller) external payable {
        AuctionNFTItem storage auction = auctionItems[seller];
        require(auction.isActive, "Auction is not active");
        require(block.timestamp < auction.endTime, "Auction has ended");
        require(msg.value > auction.highestBid, "Bid must be higher than current highest bid");

        if (auction.highestBidder != address(0)) {
            payable(auction.highestBidder).transfer(auction.highestBid);
        }

        auction.highestBid = msg.value;
        auction.highestBidder = msg.sender;

        auction.endTime = block.timestamp + 24 hours;

        emit BidInAuction(msg.sender, msg.value);
    }

    function stopAuction(address seller) external {
        AuctionNFTItem storage auction = auctionItems[seller];
        require(auction.isActive, "Auction is not active");
        require(!auction.isSold, "Auction already settled");

        IERC721 nft = IERC721(auction.tokenAddress);

        if (auction.highestBidder != address(0)) {
            nft.transfer(auction.highestBidder, auction.tokenId);

            (bool sent, ) = payable(seller).call{value: auction.highestBid}("");
            require(sent, "Failed to pay seller");
        } else {
            nft.transfer(seller, auction.tokenId);
        }

        auction.isActive = false;
        auction.isSold = true;

        emit StopAuction(auction.highestBidder, auction.highestBid);
    }

    function getAuctionDetails(address seller) external view returns (AuctionNFTItem memory) {
        require(auctionItems[seller].auctionID != 0, "No auction found for this seller");
        return auctionItems[seller];
    }

    function getHighestBid(address seller) external view returns (address, uint256) {
        AuctionNFTItem storage auction = auctionItems[seller];
        require(auction.auctionID != 0, "Auction does not exist");
        return (auction.highestBidder, auction.highestBid);
    }

    function timeRemaining(address seller) external view returns (uint256) {
        AuctionNFTItem storage auction = auctionItems[seller];
        require(auction.isActive, "Auction is not active");

        if (block.timestamp >= auction.endTime) {
            return 0;
        }
        return auction.endTime - block.timestamp;
    }
}