import React, { useState } from 'react';
import { Gavel, Menu, X, Plus } from 'lucide-react';
import { useWeb3 } from '../contexts/Web3Context';
import ConnectWallet from './ConnectWallet';
import CreateAuctionModal from './CreateAuctionModal';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { account } = useWeb3();

  return (
    <header className="bg-white dark:bg-slate-900 shadow-md relative z-10">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Gavel size={28} className="text-indigo-600 dark:text-indigo-400 mr-2" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              TrainingSpot Auction
            </h1>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <nav>
              <ul className="flex space-x-6">
                <li>
                  <a 
                    href="#" 
                    className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 transition-colors"
                  >
                    Auctions
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 transition-colors"
                  >
                    How It Works
                  </a>
                </li>
                {account && (
                  <>
                    <li>
                      <a 
                        href="#" 
                        className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 transition-colors"
                      >
                        My Bids
                      </a>
                    </li>
                    <li>
                      <button 
                        className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
                        onClick={() => setIsCreateModalOpen(true)}
                      >
                        <Plus size={16} className="mr-2" />
                        Create Auction
                      </button>
                    </li>
                  </>
                )}
              </ul>
            </nav>
            <ConnectWallet />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 shadow-lg">
          <nav className="container mx-auto px-4 py-3">
            <ul className="space-y-3">
              <li>
                <a 
                  href="#" 
                  className="block text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 transition-colors"
                >
                  Auctions
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="block text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 transition-colors"
                >
                  How It Works
                </a>
              </li>
              {account && (
                <>
                  <li>
                    <a 
                      href="#" 
                      className="block text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 transition-colors"
                    >
                      My Bids
                    </a>
                  </li>
                  <li>
                    <button 
                      className="flex items-center w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
                      onClick={() => setIsCreateModalOpen(true)}
                    >
                      <Plus size={16} className="mr-2" />
                      Create Auction
                    </button>
                  </li>
                </>
              )}
              <li className="pt-2">
                <ConnectWallet isMobile />
              </li>
            </ul>
          </nav>
        </div>
      )}

      <CreateAuctionModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </header>
  );
};

export default Header;