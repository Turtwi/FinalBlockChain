import React, { useState } from 'react';
import { X } from 'lucide-react';
import { ethers } from 'ethers';
import { useWeb3 } from '../contexts/Web3Context';
import toast from 'react-hot-toast';
import AuctionABI from '../contracts/AuctionABI';

const CONTRACT_ADDRESS = '0x5823017D5C311897E851CBeBd6aBBAB435cC67f2';

// Basic ERC721 interface for approval
const ERC721_ABI = [
  'function approve(address to, uint256 tokenId) public',
  'function getApproved(uint256 tokenId) public view returns (address)',
  'function ownerOf(uint256 tokenId) public view returns (address)'
];

interface CreateAuctionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateAuctionModal: React.FC<CreateAuctionModalProps> = ({ isOpen, onClose }) => {
  const { provider, account } = useWeb3();
  const [startPrice, setStartPrice] = useState('0.1');
  const [nftAddress, setNftAddress] = useState('');
  const [nftId, setNftId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const checkExistingAuction = async (contract: ethers.Contract, seller: string): Promise<boolean> => {
    try {
      const auctionDetails = await contract.auctionItems(seller);
      if (auctionDetails.isActive) {
        toast.error('You already have an active auction');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking existing auction:', error);
      return false;
    }
  };

  const validateNFTOwnership = async (nftContract: ethers.Contract, tokenId: string): Promise<boolean> => {
    try {
      const owner = await nftContract.ownerOf(tokenId);
      if (owner.toLowerCase() !== account?.toLowerCase()) {
        throw new Error('You do not own this NFT');
      }
      return true;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
      return false;
    }
  };

  const checkAndApproveNFT = async (nftContract: ethers.Contract, tokenId: string): Promise<boolean> => {
    try {
      const approved = await nftContract.getApproved(tokenId);
      if (approved.toLowerCase() === CONTRACT_ADDRESS.toLowerCase()) {
        return true;
      }

      toast.loading('Approving NFT transfer...');
      const approveTx = await nftContract.approve(CONTRACT_ADDRESS, tokenId);
      await approveTx.wait();
      toast.dismiss();
      toast.success('NFT approved successfully');
      return true;
    } catch (error) {
      console.error('Approval error:', error);
      toast.dismiss();
      toast.error('Failed to approve NFT transfer');
      return false;
    }
  };

  const validateNFTContract = async (address: string): Promise<ethers.Contract | null> => {
    try {
      if (!ethers.isAddress(address)) {
        throw new Error('Invalid NFT contract address');
      }

      const code = await provider?.getCode(address);
      if (!code || code === '0x') {
        throw new Error('Address is not a contract');
      }

      const signer = await provider?.getSigner();
      return new ethers.Contract(address, ERC721_ABI, signer);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!provider || !account) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setIsSubmitting(true);
      toast.loading('Validating NFT contract...');

      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, AuctionABI, signer);

      // Check if user already has an active auction
      const hasActiveAuction = await checkExistingAuction(contract, account);
      if (hasActiveAuction) {
        setIsSubmitting(false);
        toast.dismiss();
        return;
      }

      // Validate NFT contract and get contract instance
      const nftContract = await validateNFTContract(nftAddress);
      if (!nftContract) {
        setIsSubmitting(false);
        toast.dismiss();
        return;
      }

      // Validate NFT ownership
      const isOwner = await validateNFTOwnership(nftContract, nftId);
      if (!isOwner) {
        setIsSubmitting(false);
        toast.dismiss();
        return;
      }

      // Check and approve NFT transfer
      const isApproved = await checkAndApproveNFT(nftContract, nftId);
      if (!isApproved) {
        setIsSubmitting(false);
        toast.dismiss();
        return;
      }

      toast.loading('Creating auction...');
      
      const priceInWei = ethers.parseEther(startPrice);

      // First estimate gas to catch potential errors
      try {
        await contract.startAuction.estimateGas(
          priceInWei,
          nftAddress,
          nftId
        );
      } catch (error: any) {
        let errorMessage = 'Transaction would fail';
        if (error.data) {
          errorMessage = `Contract error: ${error.data.message || error.message}`;
        } else if (error.message) {
          errorMessage = error.message;
        }
        throw new Error(errorMessage);
      }

      const tx = await contract.startAuction(
        priceInWei,
        nftAddress,
        nftId,
        {
          gasLimit: ethers.toBigInt(300000)
        }
      );
      
      toast.dismiss();
      toast.loading('Waiting for transaction confirmation...');
      
      await tx.wait();
      
      toast.dismiss();
      toast.success('Auction created successfully!');
      onClose();
      
    } catch (error: any) {
      console.error('Error creating auction:', error);
      toast.dismiss();
      
      let errorMessage = 'Failed to create auction';
      
      if (error.code === 'ACTION_REJECTED') {
        errorMessage = 'Transaction rejected by user';
      } else if (error.message) {
        errorMessage = error.message.includes('execution reverted') 
          ? 'Contract error: Make sure you own the NFT and have approved the auction contract'
          : error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Create New Auction</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Price (ETH)
              </label>
              <input
                type="number"
                value={startPrice}
                onChange={(e) => setStartPrice(e.target.value)}
                step="0.01"
                min="0.01"
                required
                className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                NFT Contract Address
              </label>
              <input
                type="text"
                value={nftAddress}
                onChange={(e) => setNftAddress(e.target.value)}
                placeholder="0x..."
                required
                className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                NFT Token ID
              </label>
              <input
                type="number"
                value={nftId}
                onChange={(e) => setNftId(e.target.value)}
                min="0"
                required
                className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          <div className="mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2 px-4 rounded-md text-white transition-colors ${
                isSubmitting
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isSubmitting ? 'Creating...' : 'Create Auction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAuctionModal;