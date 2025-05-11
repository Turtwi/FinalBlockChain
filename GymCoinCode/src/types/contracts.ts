export interface UserProfile {
  username: string;
  email: string;
  walletAddress: string;
}

export interface Transaction {
  hash: string;
  status: 'pending' | 'success' | 'failed';
  type: 'buy' | 'sell' | 'transfer' | 'register';
  amount?: string;
  recipient?: string;
}