import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

interface Web3ContextType {
  account: string | null;
  provider: ethers.BrowserProvider | null;
  chainId: number | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isConnecting: boolean;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Check if wallet is already connected on initialization
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum && window.ethereum.isMetaMask) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const ethersProvider = new ethers.BrowserProvider(window.ethereum);
            const network = await ethersProvider.getNetwork();
            
            setAccount(accounts[0]);
            setProvider(ethersProvider);
            setChainId(Number(network.chainId));
          }
        } catch (error) {
          console.error('Error checking existing connection:', error);
        }
      }
    };
    
    checkConnection();
  }, []);

  // Setup event listeners for wallet changes
  useEffect(() => {
    if (window.ethereum) {
      // Handle account changes
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
          toast.success('Account changed!');
        }
      };

      // Handle chain changes
      const handleChainChanged = (chainIdHex: string) => {
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error('MetaMask is not installed!');
      return;
    }

    setIsConnecting(true);

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const ethersProvider = new ethers.BrowserProvider(window.ethereum);
      const network = await ethersProvider.getNetwork();
      
      setAccount(accounts[0]);
      setProvider(ethersProvider);
      setChainId(Number(network.chainId));
      
      toast.success('Wallet connected successfully!');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setChainId(null);
    toast.success('Wallet disconnected');
  };

  return (
    <Web3Context.Provider
      value={{
        account,
        provider,
        chainId,
        connectWallet,
        disconnectWallet,
        isConnecting
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};