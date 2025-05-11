import { ethers } from 'ethers';
import { abi as GYM_COIN_ABI } from '../contracts/GymCoin.json';
import { abi as USER_PROFILES_ABI } from '../contracts/UserProfiles.json';

// Contract addresses
export const USER_PROFILES_ADDRESS = '0xB4c079f32c0443ff1Ab5091484BFDc9b495132A7';
export const GYM_COIN_ADDRESS = '0xBFe502F7dC638Daec7fB1519a01F3cFC153Ba9dB';

// Export ABIs
export { GYM_COIN_ABI, USER_PROFILES_ABI };

// Get provider and signer
export const getProvider = () => {
  // Check if window.ethereum is available
  if (window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  throw new Error('No Ethereum provider found. Please install MetaMask.');
};

// Get contract instances
export const getUserProfilesContract = async (withSigner = false) => {
  const provider = getProvider();
  if (withSigner) {
    const signer = await provider.getSigner();
    return new ethers.Contract(USER_PROFILES_ADDRESS, USER_PROFILES_ABI, signer);
  }
  return new ethers.Contract(USER_PROFILES_ADDRESS, USER_PROFILES_ABI, provider);
};

export const getGymCoinContract = async (withSigner = false) => {
  const provider = getProvider();
  if (withSigner) {
    const signer = await provider.getSigner();
    return new ethers.Contract(GYM_COIN_ADDRESS, GYM_COIN_ABI, signer);
  }
  return new ethers.Contract(GYM_COIN_ADDRESS, GYM_COIN_ABI, provider);
};

// Format eth values
export const formatEth = (value: bigint): string => {
  return ethers.formatEther(value);
};

// Format token values (assumes 18 decimals like ETH)
export const formatTokenAmount = (value: bigint): string => {
  return ethers.formatUnits(value, 18);
};

// Parse eth string to bigint
export const parseEth = (value: string): bigint => {
  return ethers.parseEther(value);
};

// Utility to handle metamask errors
export const handleMetamaskError = (error: any): string => {
  console.error('Metamask error:', error);
  
  if (error.code) {
    // User rejected transaction
    if (error.code === 4001) {
      return 'Transaction rejected by user';
    }
    // User denied account access
    if (error.code === -32603) {
      return 'Access to your Ethereum account was denied';
    }
  }
  
  // Get error message from reason if available
  if (error.reason) {
    return error.reason;
  }
  
  return 'An error occurred with your transaction';
};