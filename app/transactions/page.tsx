"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import LoadingSpinner from "../../components/LoadingSpinner";
import Pagination from "../../components/Pagination";
import { useAuth } from "../../contexts/AuthContext";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import {
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  Gift,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";

interface Transaction {
  _id: string;
  buyer: string;
  seller: string;
  meme: string;
  amount: number;
  type: "purchase" | "tip" | "reward" | "daily_bonus";
  status: "pending" | "completed" | "failed" | "cancelled";
  description?: string;
  createdAt: string;
  memeInfo?: {
    _id: string;
    title: string;
    imageUrl: string;
  };
  buyerInfo?: {
    _id: string;
    username: string;
    displayName: string;
    avatar?: string;
  };
  sellerInfo?: {
    _id: string;
    username: string;
    displayName: string;
    avatar?: string;
  };
}

export default function TransactionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    fetchTransactions();
  }, [user, pagination.page]);

  const fetchTransactions = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        userId: user._id,
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      const response = await fetch(`/api/transactions?${params}`);
      const data = await response.json();

      if (response.ok) {
        setTransactions(data.transactions);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTransactionIcon = (transaction: Transaction) => {
    switch (transaction.type) {
      case "purchase":
        return <ShoppingCart className="h-4 w-4" />;
      case "tip":
        return <Gift className="h-4 w-4" />;
      case "daily_bonus":
        return <Gift className="h-4 w-4" />;
      default:
        return <Coins className="h-4 w-4" />;
    }
  };

  const getTransactionColor = (transaction: Transaction) => {
    if (transaction.buyer === user?._id) {
      return "text-red-600 dark:text-red-400";
    } else {
      return "text-green-600 dark:text-green-400";
    }
  };

  const getTransactionDirection = (transaction: Transaction) => {
    if (transaction.buyer === user?._id) {
      return {
        icon: <ArrowUpRight className="h-4 w-4" />,
        label: "Sent",
        amount: `-${transaction.amount}`,
      };
    } else {
      return {
        icon: <ArrowDownLeft className="h-4 w-4" />,
        label: "Received",
        amount: `+${transaction.amount}`,
      };
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">
            Transaction History
          </h1>
          <p className="text-muted-foreground text-lg">
            Track your coin transactions and purchases
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glass-card">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary">
                {user.coins}
              </div>
              <div className="text-muted-foreground">Current Balance</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600">
                {user.totalEarned}
              </div>
              <div className="text-muted-foreground">Total Earned</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-red-600">
                {user.totalSpent}
              </div>
              <div className="text-muted-foreground">Total Spent</div>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {transactions.length > 0 ? (
              <>
                <div className="space-y-4">
                  {transactions.map((transaction) => {
                    const direction = getTransactionDirection(transaction);
                    const otherUser =
                      transaction.buyer === user._id
                        ? transaction.sellerInfo
                        : transaction.buyerInfo;

                    return (
                      <Card key={transaction._id} className="glass-card">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div
                                className={`p-2 rounded-full bg-muted ${getTransactionColor(
                                  transaction
                                )}`}
                              >
                                {getTransactionIcon(transaction)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold">
                                    {transaction.description}
                                  </span>
                                  <Badge
                                    variant={
                                      transaction.status === "completed"
                                        ? "default"
                                        : "secondary"
                                    }
                                    className="text-xs"
                                  >
                                    {transaction.status}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span>
                                    {new Date(
                                      transaction.createdAt
                                    ).toLocaleDateString()}
                                  </span>
                                  {otherUser && otherUser._id !== "system" && (
                                    <Link
                                      href={`/profile/${otherUser._id}`}
                                      className="flex items-center gap-1 hover:text-primary transition-colors"
                                    >
                                      <Avatar className="h-4 w-4">
                                        <AvatarImage
                                          src={
                                            otherUser.avatar ||
                                            "/placeholder.svg"
                                          }
                                          alt={otherUser.displayName}
                                        />
                                        <AvatarFallback className="text-xs">
                                          {otherUser.displayName[0].toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                      @{otherUser.username}
                                    </Link>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div
                                className={`text-lg font-bold ${getTransactionColor(
                                  transaction
                                )}`}
                              >
                                {direction.amount}
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                {direction.icon}
                                {direction.label}
                              </div>
                            </div>
                          </div>
                          {transaction.memeInfo && (
                            <div className="mt-4 pt-4 border-t">
                              <Link
                                href={`/meme/${transaction.memeInfo._id}`}
                                className="flex items-center gap-3 hover:bg-muted/50 rounded-lg p-2 transition-colors"
                              >
                                <img
                                  src={
                                    transaction.memeInfo.imageUrl ||
                                    "/placeholder.svg"
                                  }
                                  alt={transaction.memeInfo.title}
                                  className="w-12 h-12 object-cover rounded-lg"
                                />
                                <span className="font-medium">
                                  {transaction.memeInfo.title}
                                </span>
                              </Link>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={(page) =>
                    setPagination((prev) => ({ ...prev, page }))
                  }
                />
              </>
            ) : (
              <div className="text-center py-20">
                <Coins className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  No transactions yet
                </h3>
                <p className="text-muted-foreground">
                  Start buying memes or earning coins to see your transaction
                  history
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
