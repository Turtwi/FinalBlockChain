import React from 'react';
import { Wallet } from 'lucide-react';
import { useWeb3 } from '../contexts/Web3Context';

interface ConnectWalletProps {
  isMobile?: boolean;
}

const ConnectWallet: React.FC<ConnectWalletProps> = ({ isMobile = false }) => {
  const { account, connectWallet, disconnectWallet } = useWeb3();

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className={isMobile ? 'w-full' : ''}>
      {account ? (
        <div className={`flex items-center ${isMobile ? 'flex-col space-y-2' : 'space-x-2'}`}>
          <span className="flex items-center px-3 py-1 text-sm bg-indigo-100 dark:bg-slate-700 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            <span className="text-gray-700 dark:text-gray-300">{formatAddress(account)}</span>
          </span>
          <button
            onClick={disconnectWallet}
            className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          className={`flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors ${
            isMobile ? 'w-full' : ''
          }`}
        >
          <Wallet size={16} />
          <span>Connect Wallet</span>
        </button>
      )}
    </div>
  );
};

export default ConnectWallet;