import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { useWeb3 } from './Web3Context';
import { Auction } from '../types';
import AuctionABI from '../contracts/AuctionABI';

const CONTRACT_ADDRESS = '0x5823017D5C311897E851CBeBd6aBBAB435cC67f2';

interface AuctionsContextType {
  auctions: Auction[];
  loading: boolean;
  placeBid: (seller: string, amount: string) => Promise<void>;
  stopAuction: (seller: string) => Promise<void>;
}

const AuctionsContext = createContext<AuctionsContextType | undefined>(undefined);

export const useAuctions = () => {
  const context = useContext(AuctionsContext);
  if (context === undefined) {
    throw new Error('useAuctions must be used within an AuctionsProvider');
  }
  return context;
};

interface AuctionsProviderProps {
  children: ReactNode;
}

export const AuctionsProvider: React.FC<AuctionsProviderProps> = ({ children }) => {
  const { account, provider } = useWeb3();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (provider) {
      fetchAuctions();
    } else {
      setAuctions([]);
      setLoading(false);
    }
  }, [provider, account]);

  const fetchAuctions = async () => {
    if (!provider) return;
    
    try {
      setLoading(true);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, AuctionABI, provider);
      
      // Get all events for auction creation
      const filter = contract.filters.StartAuction();
      const events = await contract.queryFilter(filter);
      const fetchedAuctions = [];
      
      // Process each auction event
      for (const event of events) {
        try {
          const seller = event.args?.[0];
          if (!seller) continue;

          // Get auction details
          const auctionDetails = await contract.auctionItems(seller);
          
          if (auctionDetails && (auctionDetails.isActive || auctionDetails.isSold)) {
            const [highestBidder, highestBid] = await contract.getHighestBid(seller);
            const timeRemaining = await contract.timeRemaining(seller);
            
            fetchedAuctions.push({
              id: auctionDetails.auctionID.toString(),
              title: `NFT Auction #${auctionDetails.auctionID}`,
              description: `NFT Contract: ${auctionDetails.tokenAddress}\nToken ID: ${auctionDetails.tokenId}`,
              imageUrl: 'https://images.pexels.com/photos/4056531/pexels-photo-4056531.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
              coach: 'NFT Owner',
              datetime: new Date(Number(timeRemaining) * 1000).toLocaleString(),
              endTime: Number(auctionDetails.endTime),
              highestBid: Number(ethers.formatEther(highestBid)),
              highestBidder: highestBidder !== ethers.ZeroAddress ? highestBidder : null,
              seller: seller,
              isActive: auctionDetails.isActive,
              isSold: auctionDetails.isSold
            });
          }
        } catch (error) {
          console.error(`Error fetching auction details:`, error);
        }
      }
      
      setAuctions(fetchedAuctions);
    } catch (error) {
      console.error('Error fetching auctions:', error);
      toast.error('Failed to fetch auctions');
    } finally {
      setLoading(false);
    }
  };

  const placeBid = async (seller: string, amount: string) => {
    if (!provider || !account) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    try {
      toast.loading('Placing bid...');
      
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, AuctionABI, signer);
      
      const bidAmount = ethers.parseEther(amount);
      const tx = await contract.bidInAuction(seller, { value: bidAmount });
      
      toast.dismiss();
      toast.loading('Confirming transaction...');
      
      await tx.wait();
      
      toast.dismiss();
      toast.success('Bid placed successfully!');
      
      // Refresh auctions to show updated state
      fetchAuctions();
      
    } catch (error) {
      console.error('Error placing bid:', error);
      toast.dismiss();
      toast.error('Failed to place bid');
    }
  };

  const stopAuction = async (seller: string) => {
    if (!provider || !account) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, AuctionABI, signer);
      
      // Check if the auction exists and is active
      const auctionDetails = await contract.auctionItems(seller);
      if (!auctionDetails.isActive) {
        toast.error('Auction is not active');
        return;
      }

      // Check if the caller is the auction owner
      if (account.toLowerCase() !== seller.toLowerCase()) {
        toast.error('Only the auction owner can stop the auction');
        return;
      }

      // First estimate gas to catch potential errors
      try {
        await contract.stopAuction.estimateGas(seller);
      } catch (error: any) {
        let errorMessage = 'Transaction would fail';
        if (error.data) {
          errorMessage = `Contract error: ${error.data.message || error.message}`;
        } else if (error.message) {
          errorMessage = error.message;
        }
        throw new Error(errorMessage);
      }

      toast.loading('Stopping auction...');
      
      const tx = await contract.stopAuction(seller, {
        gasLimit: ethers.toBigInt(300000) // Add explicit gas limit
      });
      
      toast.dismiss();
      toast.loading('Confirming transaction...');
      
      await tx.wait();
      
      toast.dismiss();
      toast.success('Auction ended successfully!');
      
      // Refresh auctions to show updated state
      fetchAuctions();
      
    } catch (error: any) {
      console.error('Error stopping auction:', error);
      toast.dismiss();
      
      let errorMessage = 'Failed to stop auction';
      
      if (error.code === 'ACTION_REJECTED') {
        errorMessage = 'Transaction rejected by user';
      } else if (error.message) {
        errorMessage = error.message.includes('execution reverted') 
          ? 'Contract error: Cannot stop auction at this time'
          : error.message;
      }
      
      toast.error(errorMessage);
    }
  };

  return (
    <AuctionsContext.Provider
      value={{
        auctions,
        loading,
        placeBid,
        stopAuction
      }}
    >
      {children}
    </AuctionsContext.Provider>
  );
};