export interface Auction {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  coach: string;
  datetime: string;
  endTime: number;
  highestBid: number;
  highestBidder: string | null;
  seller: string;
  isActive: boolean;
  isSold: boolean;
}