import { useState, useEffect, useCallback } from 'react';
import { ethers, parseUnits, parseEther } from 'ethers';
import { 
  getProvider, 
  getUserProfilesContract, 
  getGymCoinContract, 
  handleMetamaskError,
  formatTokenAmount
} from '../utils/contractUtils';
import { UserProfile } from '../types/contracts';

export function useWeb3() {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [gcBalance, setGcBalance] = useState<string>('0');
  const [ethBalance, setEthBalance] = useState<string>('0');
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [buyRate, setBuyRate] = useState<bigint>(BigInt(0));
  const [sellRate, setSellRate] = useState<bigint>(BigInt(0));

  // Initialize connection and set up event listeners
  useEffect(() => {
    // Check if MetaMask is installed
    if (!window.ethereum) {
      setError('MetaMask is not installed. Please install it to use this app.');
      return;
    }

    // Setup account change listener
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected
        setAccount(null);
        setUserProfile(null);
      } else if (accounts[0] !== account) {
        // Account changed
        setAccount(accounts[0]);
        setUserProfile(null);
        loadUserProfile(accounts[0]);
        loadGCBalance(accounts[0]);
      }
    };

    // Setup chain change listener
    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    // Check if already connected
    checkConnection();

    // Get rates
    loadRates();

    // Cleanup
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  // Refresh GC and ETH balance when account or userProfile changes
  useEffect(() => {
    if (account) {
      loadGCBalance(account);
      loadEthBalance(account);
    }
  }, [account, userProfile]);

  // Check if user is already connected
  const checkConnection = async () => {
    try {
      const provider = getProvider();
      const accounts = await provider.listAccounts();
      
      if (accounts.length > 0) {
        setAccount(accounts[0].address);
        loadUserProfile(accounts[0].address);
      }
    } catch (err) {
      console.error('Failed to check connection:', err);
    }
  };

  // Connect wallet
  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      const provider = getProvider();
      const accounts = await provider.send('eth_requestAccounts', []);
      
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        await loadUserProfile(accounts[0]);
      } else {
        throw new Error('No accounts found');
      }
    } catch (err: any) {
      const errorMessage = handleMetamaskError(err);
      setError(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };

  // Login with address
  const loginWithAddress = async (address: string) => {
    if (!ethers.isAddress(address)) {
      throw new Error('Invalid Ethereum address');
    }

    try {
      const profile = await loadUserProfile(address);
      if (profile) {
        setAccount(address);
        await loadGCBalance(address);
        return profile;
      }
      return null; // Return null if no profile exists instead of throwing
    } catch (err) {
      console.error('Error during login:', err);
      return null; // Return null for any other errors
    }
  };

  // Disconnect wallet (for UI purposes, not actually disconnecting from MetaMask)
  const disconnectWallet = () => {
    setAccount(null);
    setUserProfile(null);
    setGcBalance('0');
    setEthBalance('0');
  };

  // Load user profile
  const loadUserProfile = async (address: string) => {
    setIsProfileLoading(true);
    try {
      const contract = await getUserProfilesContract();
      
      try {
        const profile = await contract.getUserProfile(address);
        const userProfile = {
          username: profile[0],
          email: profile[1],
          walletAddress: profile[2]
        };
        setUserProfile(userProfile);
        return userProfile;
      } catch (err) {
        // Profile doesn't exist - set to null and return null instead of throwing
        setUserProfile(null);
        return null;
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setUserProfile(null);
      return null;
    } finally {
      setIsProfileLoading(false);
    }
  };

  // Register profile
  const registerProfile = async (username: string, email: string) => {
    if (!account) throw new Error('Wallet not connected');
    
    try {
      const contract = await getUserProfilesContract(true);
      const tx = await contract.registerProfile(username, email);
      await tx.wait();
      
      // Reload profile after registration
      await loadUserProfile(account);
      return tx.hash;
    } catch (err: any) {
      throw new Error(handleMetamaskError(err));
    }
  };

  // Load GC balance
  const loadGCBalance = async (address: string) => {
    try {
      const contract = await getGymCoinContract();
      const balance = await contract.balanceOf(address);
      setGcBalance(formatTokenAmount(balance));
    } catch (err) {
      console.error('Error loading GC balance:', err);
    }
  };

  // Load ETH balance
  const loadEthBalance = async (address: string) => {
    try {
      const provider = getProvider();
      const balance = await provider.getBalance(address);
      setEthBalance(balance.toString());
    } catch (err) {
      console.error('Error loading ETH balance:', err);
    }
  };

  // Load exchange rates
  const loadRates = async () => {
    try {
      const contract = await getGymCoinContract();
      const [buyRateResult, sellRateResult] = await Promise.all([
        contract.buyRate(),
        contract.sellRate()
      ]);
      
      setBuyRate(buyRateResult);
      setSellRate(sellRateResult);
    } catch (err) {
      console.error('Error loading rates:', err);
    }
  };

  // Buy GC
  const buyGC = async (ethAmount: string) => {
    if (!account) throw new Error('Wallet not connected');
    
    try {
      
      const ethAmountWei = parseEther(ethAmount.toString());

      const contract = await getGymCoinContract(true);
      const tx = await contract.buyCoin(ethAmountWei, {
        value: ethAmountWei}
      );
      await tx.wait();
      
      // Reload balance
      await loadGCBalance(account);
      return tx.hash;
    } catch (err: any) {
      throw new Error(handleMetamaskError(err));
    }
  };

  // Sell GC
  const sellGC = async (gcAmount: string) => {
    if (!account) throw new Error('Wallet not connected');
    
    try {
      // Convert GC amount to wei
      
      const contract = await getGymCoinContract(true);
      const tx = await contract.sellCoin(parseUnits(gcAmount, 18));
      await tx.wait();
      
      // Reload balance
      await loadGCBalance(account);
      return tx.hash;
    } catch (err: any) {
      throw new Error(handleMetamaskError(err));
    }
  };

  // Transfer GC
  const transferGC = async (recipient: string, gcAmount: string) => {
    if (!account) throw new Error('Wallet not connected');
    
    try {
      // Validate recipient address
      if (!ethers.isAddress(recipient)) {
        throw new Error('Invalid recipient address');
      }
      
      
      const contract = await getGymCoinContract(true);
      const tx = await contract.transfer(recipient, gcAmount);
      await tx.wait();
      
      // Reload balance
      await loadGCBalance(account);
      return tx.hash;
    } catch (err: any) {
      throw new Error(handleMetamaskError(err));
    }
  };

  return {
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
    refreshBalance: async () => {
      if (account) {
        await Promise.all([
          loadGCBalance(account),
          loadEthBalance(account)
        ]);
      }
    },
    loginWithAddress,
    formatTokenAmount
  };
}