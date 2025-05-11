import React, { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';

interface BidFormProps {
  currentBid: number;
  onBid: (amount: string) => void;
  onCancel: () => void;
}

const BidForm: React.FC<BidFormProps> = ({ currentBid, onBid, onCancel }) => {
  const { account } = useWeb3();
  const [bidAmount, setBidAmount] = useState((currentBid + 0.01).toFixed(2));
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(bidAmount);
    
    if (isNaN(amount)) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (amount <= currentBid) {
      setError(`Bid must be higher than current bid (${currentBid} ETH)`);
      return;
    }
    
    onBid(bidAmount);
  };

  return (
    <div className="bg-gray-50 dark:bg-slate-700 rounded-md p-3">
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Your Bid (ETH)
          </label>
          <input
            type="number"
            id="bidAmount"
            value={bidAmount}
            onChange={(e) => {
              setBidAmount(e.target.value);
              setError(null);
            }}
            step="0.01"
            min={currentBid + 0.01}
            className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
          {error && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-gray-800 dark:text-gray-200 text-sm rounded-md transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-md transition-colors"
          >
            Place Bid
          </button>
        </div>
      </form>
    </div>
  );
};

export default BidForm;