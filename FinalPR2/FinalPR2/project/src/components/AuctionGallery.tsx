import React, { useState } from 'react';
import AuctionCard from './AuctionCard';
import { useAuctions } from '../contexts/AuctionsContext';
import { FilterIcon, Grid, List } from 'lucide-react';

const AuctionGallery: React.FC = () => {
  const { auctions, loading } = useAuctions();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterOpen, setFilterOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading auctions...</p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 md:mb-0">
          Available Training Spots
        </h2>
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <button 
            onClick={() => setFilterOpen(!filterOpen)}
            className="px-3 py-2 flex items-center text-sm bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md shadow-sm transition-colors"
          >
            <FilterIcon size={16} className="mr-2" />
            Filters
          </button>
          <div className="flex rounded-md shadow-sm overflow-hidden">
            <button 
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 ${viewMode === 'grid' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300'}`}
            >
              <Grid size={16} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 ${viewMode === 'list' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300'}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {filterOpen && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 mb-6 transition-all">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sort By
              </label>
              <select 
                id="sort"
                className="w-full p-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md"
              >
                <option value="ending-soon">Ending Soon</option>
                <option value="recently-added">Recently Added</option>
                <option value="price-high">Highest Price</option>
                <option value="price-low">Lowest Price</option>
              </select>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select 
                id="status"
                className="w-full p-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="ending-soon">Ending Soon</option>
                <option value="ended">Ended</option>
              </select>
            </div>
            <div className="flex items-end">
              <button className="w-full p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors">
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {auctions.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg shadow-md">
          <p className="text-gray-600 dark:text-gray-400">No auctions available at the moment.</p>
        </div>
      ) : (
        <div className={viewMode === 'grid'
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          : "space-y-4"
        }>
          {auctions.map((auction) => (
            <AuctionCard
              key={auction.id}
              auction={auction}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AuctionGallery;