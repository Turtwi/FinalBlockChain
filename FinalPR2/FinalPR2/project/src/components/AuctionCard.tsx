import React, { useState } from 'react';
import { Clock, User, DollarSign } from 'lucide-react';
import { useWeb3 } from '../contexts/Web3Context';
import { useAuctions } from '../contexts/AuctionsContext';
import TimeRemaining from './TimeRemaining';
import BidForm from './BidForm';
import { Auction } from '../types';

interface AuctionCardProps {
  auction: Auction;
  viewMode: 'grid' | 'list';
}

const AuctionCard: React.FC<AuctionCardProps> = ({ auction, viewMode }) => {
  const [showBidForm, setShowBidForm] = useState(false);
  const { account } = useWeb3();
  const { placeBid, stopAuction } = useAuctions();

  const handleBid = (amount: string) => {
    placeBid(auction.seller, amount);
    setShowBidForm(false);
  };

  const handleEndAuction = async () => {
    await stopAuction(auction.seller);
  };

  const isOwner = account?.toLowerCase() === auction.seller.toLowerCase();

  if (viewMode === 'list') {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="p-4 flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/4 mb-4 md:mb-0">
            <div className="aspect-square rounded-md overflow-hidden bg-gray-100 dark:bg-slate-700">
              <img 
                src={auction.imageUrl} 
                alt={auction.title} 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex flex-col h-full justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  {auction.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {auction.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                    Coach: {auction.coach}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    {auction.datetime}
                  </span>
                </div>
              </div>
              
              <div className="mt-auto">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                    <Clock size={16} className="mr-1" />
                    <TimeRemaining endTime={auction.endTime} />
                  </div>
                  <div className="flex items-center">
                    <DollarSign size={16} className="text-emerald-600 dark:text-emerald-400" />
                    <span className="font-medium text-gray-800 dark:text-white">
                      {auction.highestBid} ETH
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <User size={14} className="mr-1" />
                    <span>
                      {auction.highestBidder 
                        ? `Highest: ${auction.highestBidder.substring(0, 6)}...${auction.highestBidder.substring(auction.highestBidder.length - 4)}`
                        : 'No bids yet'
                      }
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    {isOwner && auction.isActive && (
                      <button
                        onClick={handleEndAuction}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition-colors"
                      >
                        End Auction
                      </button>
                    )}
                    
                    {account && auction.isActive && !isOwner && (
                      <button
                        onClick={() => setShowBidForm(!showBidForm)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-md transition-colors"
                      >
                        Place Bid
                      </button>
                    )}
                  </div>
                </div>
                
                {showBidForm && (
                  <div className="mt-3">
                    <BidForm 
                      currentBid={auction.highestBid} 
                      onBid={handleBid} 
                      onCancel={() => setShowBidForm(false)} 
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-[4/3] bg-gray-100 dark:bg-slate-700">
        <img 
          src={auction.imageUrl} 
          alt={auction.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
            ${auction.isActive 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}
          >
            {auction.isActive ? 'Active' : 'Ended'}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
          {auction.title}
        </h3>
        
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
            Coach: {auction.coach}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
            {auction.datetime}
          </span>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {auction.description}
        </p>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center text-gray-700 dark:text-gray-300">
            <Clock size={16} className="mr-1" />
            <TimeRemaining endTime={auction.endTime} />
          </div>
          <div className="flex items-center">
            <DollarSign size={16} className="text-emerald-600 dark:text-emerald-400" />
            <span className="font-medium text-gray-800 dark:text-white">
              {auction.highestBid} ETH
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <User size={14} className="mr-1" />
            <span>
              {auction.highestBidder 
                ? `Highest: ${auction.highestBidder.substring(0, 6)}...${auction.highestBidder.substring(auction.highestBidder.length - 4)}`
                : 'No bids yet'
              }
            </span>
          </div>
          
          <div className="flex gap-2">
            {isOwner && auction.isActive && (
              <button
                onClick={handleEndAuction}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition-colors"
              >
                End Auction
              </button>
            )}
            
            {account && auction.isActive && !isOwner && (
              <button
                onClick={() => setShowBidForm(!showBidForm)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-md transition-colors"
              >
                Place Bid
              </button>
            )}
          </div>
        </div>
        
        {showBidForm && (
          <div className="mt-3">
            <BidForm 
              currentBid={auction.highestBid} 
              onBid={handleBid} 
              onCancel={() => setShowBidForm(false)} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AuctionCard;