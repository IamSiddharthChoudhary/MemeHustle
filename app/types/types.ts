interface User {
  _id?: string;
  email: string;
  password: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  coins: number;
  totalEarned: number;
  totalSpent: number;
  followers: string[];
  following: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface Meme {
  _id?: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  tags: string[];
  creator: string;
  price: number;
  likes: string[];
  views: number;
  downloads: number;
  isForSale: boolean;
  isFeatured: boolean;
  isExclusive: boolean;
  currentOwner?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Transaction {
  _id?: string;
  buyer: string;
  seller: string;
  meme: string;
  amount: number;
  type: "purchase" | "tip" | "reward" | "daily_bonus";
  status: "pending" | "completed" | "failed" | "cancelled";
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
