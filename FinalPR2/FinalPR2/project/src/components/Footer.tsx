import React from 'react';
import { Gavel, Github, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 shadow-md mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <Gavel size={20} className="text-indigo-600 dark:text-indigo-400 mr-2" />
            <span className="text-gray-600 dark:text-gray-300">
              TrainingSpot Auction © {new Date().getFullYear()}
            </span>
          </div>
          
          <div className="flex flex-col md:flex-row items-center">
            <div className="flex space-x-4 mb-4 md:mb-0 md:mr-6">
              <a 
                href="#" 
                className="text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
              >
                <Github size={18} />
              </a>
              <a 
                href="#" 
                className="text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
              >
                <Twitter size={18} />
              </a>
            </div>
            
            <nav className="flex flex-wrap justify-center space-x-4">
              <a 
                href="#" 
                className="text-sm text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
              >
                Terms
              </a>
              <a 
                href="#" 
                className="text-sm text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
              >
                Privacy
              </a>
              <a 
                href="#" 
                className="text-sm text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
              >
                Help
              </a>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;