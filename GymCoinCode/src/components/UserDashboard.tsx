import React, { useState } from 'react';
import { UserCircle, CreditCard, Wallet, LogOut, RefreshCw } from 'lucide-react';
import { UserProfile } from '../types/contracts';
import BuySellGC from './BuySellGC';
import TransferGC from './TransferGC';

interface UserDashboardProps {
  account: string;
  userProfile: UserProfile;
  gcBalance: string;
  ethBalance: string;
  onDisconnect: () => void;
  onBuyGC: (amount: string) => Promise<string>;
  onSellGC: (amount: string) => Promise<string>;
  onTransferGC: (recipient: string, amount: string) => Promise<string>;
  onRefreshBalance: () => void;
  buyRate: bigint;
  sellRate: bigint;
}

const UserDashboard: React.FC<UserDashboardProps> = ({
  account,
  userProfile,
  gcBalance,
  ethBalance,
  onDisconnect,
  onBuyGC,
  onSellGC,
  onTransferGC,
  onRefreshBalance,
  buyRate,
  sellRate
}) => {
  const [activeTab, setActiveTab] = useState<'buy-sell' | 'transfer'>('buy-sell');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshBalance = async () => {
    setIsRefreshing(true);
    await onRefreshBalance();
    setTimeout(() => setIsRefreshing(false), 1000); // Show the animation for at least 1 second
  };

  // Format account address for display
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <CreditCard className="h-8 w-8 text-green-500 mr-2" />
            <h1 className="text-xl font-bold text-gray-800">GymCoin</h1>
          </div>
          <button 
            onClick={onDisconnect}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <LogOut className="h-5 w-5 mr-1" />
            <span>Disconnect</span>
          </button>
        </div>
      </header>

      <main className="container mx-auto py-6 px-4">
        {/* User Profile Card */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center">
            <div className="bg-green-100 p-3 rounded-full mb-4 sm:mb-0 sm:mr-6">
              <UserCircle size={40} className="text-green-600" />
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold text-gray-800">{userProfile.username}</h2>
              <p className="text-gray-600">{userProfile.email}</p>
              <p className="text-sm text-gray-500 mt-1">
                Wallet: {formatAddress(account)}
              </p>
            </div>
            <div className="ml-auto mt-4 sm:mt-0 flex items-center">
              <div className="bg-gray-100 rounded-lg p-4 text-center">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">GC Balance</h3>
                  <button 
                    onClick={handleRefreshBalance} 
                    className="text-gray-500 hover:text-gray-700"
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                <p className="text-2xl font-bold text-green-600 mt-1">{parseFloat(gcBalance).toFixed(2)} GC</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="flex border-b">
            <button
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === 'buy-sell'
                  ? 'bg-green-50 text-green-600 border-b-2 border-green-500'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('buy-sell')}
            >
              <div className="flex items-center justify-center">
                <Wallet className="h-5 w-5 mr-2" />
                Buy & Sell GymCoin
              </div>
            </button>
            <button
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === 'transfer'
                  ? 'bg-green-50 text-green-600 border-b-2 border-green-500'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('transfer')}
            >
              <div className="flex items-center justify-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Transfer GymCoin
              </div>
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'buy-sell' && (
              <BuySellGC 
                onBuy={onBuyGC} 
                onSell={onSellGC} 
                gcBalance={gcBalance}
                ethBalance={ethBalance}
                buyRate={buyRate}
                sellRate={sellRate}
              />
            )}
            {activeTab === 'transfer' && (
              <TransferGC 
                onTransfer={onTransferGC} 
                gcBalance={gcBalance} 
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;