import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';

import Header from './components/Header';
import AuctionGallery from './components/AuctionGallery';
import Footer from './components/Footer';
import { Web3Provider } from './contexts/Web3Context';
import { AuctionsProvider } from './contexts/AuctionsContext';

function App() {
  return (
    <Web3Provider>
      <AuctionsProvider>
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
          <Toaster position="top-right" />
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            <AuctionGallery />
          </main>
          <Footer />
        </div>
      </AuctionsProvider>
    </Web3Provider>
  );
}

export default App;