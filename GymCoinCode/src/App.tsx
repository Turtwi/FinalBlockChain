import React, { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import ConnectWallet from './components/ConnectWallet';
import ProfileRegistration from './components/ProfileRegistration';
import UserDashboard from './components/UserDashboard';
import { useWeb3 } from './hooks/useWeb3';
import { Transaction } from './types/contracts';
import { ethers } from 'ethers';

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);
  
  const {
    account,
    isConnecting,
    error,
    userProfile,
    gcBalance,
    ethBalance,
    isProfileLoading,
    buyRate,
    sellRate,
    connectWallet,
    disconnectWallet,
    registerProfile,
    buyGC,
    sellGC,
    transferGC,
    refreshBalance,
    loginWithAddress
  } = useWeb3();

  // Handler for profile registration
  const handleRegisterProfile = async (username: string, email: string) => {
    setIsRegistering(true);
    try {
      const hash = await registerProfile(username, email);
      
      // Add to transactions
      const tx: Transaction = {
        hash,
        status: 'success',
        type: 'register'
      };
      setTransactions([tx, ...transactions]);
      
      toast.success('Profile registered successfully!');
      return hash;
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('Failed to register profile');
      }
      throw err;
    } finally {
      setIsRegistering(false);
    }
  };

  // Handler for buying GC
  const handleBuyGC = async (amount: string) => {
    try {
      const hash = await buyGC(amount);
      
      // Add to transactions
      const tx: Transaction = {
        hash,
        status: 'success',
        type: 'buy',
        amount
      };
      setTransactions([tx, ...transactions]);
      
      toast.success(`Successfully bought ${amount} GC`);
      return hash;
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('Failed to buy GymCoin');
      }
      throw err;
    }
  };

  // Handler for selling GC
  const handleSellGC = async (amount: string) => {
    try {
      const hash = await sellGC(amount);
      
      // Add to transactions
      const tx: Transaction = {
        hash,
        status: 'success',
        type: 'sell',
        amount
      };
      setTransactions([tx, ...transactions]);
      
      toast.success(`Successfully sold ${amount} GC`);
      return hash;
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('Failed to sell GymCoin');
      }
      throw err;
    }
  };

  // Handler for transferring GC
  const handleTransferGC = async (recipient: string, amount: string) => {
    try {
      const hash = await transferGC(recipient, amount);
      
      // Add to transactions
      const tx: Transaction = {
        hash,
        status: 'success',
        type: 'transfer',
        amount,
        recipient
      };
      setTransactions([tx, ...transactions]);
      
      toast.success(`Successfully transferred ${amount} GC to ${recipient.substring(0, 6)}...`);
      return hash;
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('Failed to transfer GymCoin');
      }
      throw err;
    }
  };

  // Handler for login with address
  const handleLoginWithAddress = async (address: string) => {
    try {
      if (!ethers.isAddress(address)) {
        throw new Error('Invalid Ethereum address');
      }
      await loginWithAddress(address);
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('Failed to login with address');
      }
      throw err;
    }
  };

  // Render connect wallet screen if not connected
  if (!account) {
    return (
      <>
        <ConnectWallet 
          onConnect={connectWallet}
          onLoginWithAddress={handleLoginWithAddress}
          isConnecting={isConnecting} 
          error={error} 
        />
        <Toaster position="top-right" />
      </>
    );
  }

  // Render profile registration if no profile exists
  if (!userProfile && !isProfileLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <ProfileRegistration 
          onRegister={handleRegisterProfile} 
          isLoading={isRegistering} 
        />
        <Toaster position="top-right" />
      </div>
    );
  }

  // Render user dashboard if profile exists
  if (userProfile) {
    return (
      <>
        <UserDashboard 
          account={account}
          userProfile={userProfile}
          gcBalance={gcBalance}
          ethBalance={ethBalance}
          onDisconnect={disconnectWallet}
          onBuyGC={handleBuyGC}
          onSellGC={handleSellGC}
          onTransferGC={handleTransferGC}
          onRefreshBalance={refreshBalance}
          buyRate={buyRate}
          sellRate={sellRate}
        />
        <Toaster position="top-right" />
      </>
    );
  }

  // Loading state
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <svg className="animate-spin h-10 w-10 text-green-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-gray-600">Loading user profile...</p>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;