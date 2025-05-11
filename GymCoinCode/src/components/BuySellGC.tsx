import React, { useState } from 'react';
import { ethers } from 'ethers';

interface BuySellGCProps {
  onBuy: (amount: string) => Promise<string>;
  onSell: (amount: string) => Promise<string>;
  gcBalance: string;
  ethBalance: string;
  buyRate: bigint;   // Add this line
  sellRate: bigint;
}

const BuySellGC: React.FC<BuySellGCProps> = ({ 
  onBuy, 
  onSell, 
  gcBalance, 
  ethBalance,
}) => {
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) > 10000) {
      setError('Cannot exceed total supply of 10,000 GC');
      return;
    }
    
    if (mode === 'sell' && parseFloat(amount) > parseFloat(gcBalance)) {
      setError('Insufficient GymCoin balance');
      return;
    }
    
    setError(null);
    setIsLoading(true);
    
    try {
      if (mode === 'buy') {
        await onBuy(amount);
      } else {
        await onSell(amount);
      }
      setAmount('');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setMode('buy')}
          className={`flex-1 py-2 px-4 rounded-lg text-center font-medium transition ${
            mode === 'buy'
              ? 'bg-green-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Buy GymCoin
        </button>
        <button
          onClick={() => setMode('sell')}
          className={`flex-1 py-2 px-4 rounded-lg text-center font-medium transition ${
            mode === 'sell'
              ? 'bg-green-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Sell GymCoin
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="gc-amount" className="block text-sm font-medium text-gray-700 mb-1">
            {mode === 'buy' ? 'Amount to Spend (ETH)' : 'Amount to Sell (GC)'}
          </label>
          <input
            type="number"
            id="gc-amount"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isLoading}
            min="0"
            max="10000"
            step="0.01"
          />
          <div className="text-sm text-gray-500 mt-1">
            {mode === 'buy' 
              ? `Available: ${ethers.formatEther(ethBalance || '0')} ETH`
              : `Available: ${gcBalance} GC`}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 flex items-center justify-center disabled:opacity-70"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {mode === 'buy' ? 'Buying...' : 'Selling...'}
            </>
          ) : (
            mode === 'buy' ? 'Spend ETH' : 'Sell GymCoin'
          )}
        </button>
      </form>
    </div>
  );
};

export default BuySellGC;