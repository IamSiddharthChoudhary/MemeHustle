"use client";
import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Trophy, Coins, TrendingUp, Crown, Medal, Award } from "lucide-react";
import Link from "next/link";

interface LeaderboardUser {
  _id: string;
  username: string;
  displayName: string;
  avatar?: string;
  coins: number;
  totalEarned: number;
  totalSpent: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboardType, setLeaderboardType] = useState<"earned" | "balance">(
    "earned"
  );

  useEffect(() => {
    fetchLeaderboard();
  }, [leaderboardType]);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/coins/leaderboard?type=${leaderboardType}&limit=50`
      );
      const data = await response.json();

      if (response.ok) {
        setLeaderboard(data.leaderboard);
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return (
          <span className="text-lg font-bold text-muted-foreground">
            #{rank}
          </span>
        );
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1)
      return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
    if (rank === 2)
      return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
    if (rank === 3)
      return "bg-gradient-to-r from-amber-400 to-amber-600 text-white";
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Leaderboard</h1>
          <p className="text-muted-foreground text-lg">
            Top performers in the meme economy
          </p>
        </div>

        <div className="flex justify-center gap-4 mb-8">
          <Button
            variant={leaderboardType === "earned" ? "default" : "outline"}
            onClick={() => setLeaderboardType("earned")}
            className="flex items-center gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Total Earned
          </Button>
          <Button
            variant={leaderboardType === "balance" ? "default" : "outline"}
            onClick={() => setLeaderboardType("balance")}
            className="flex items-center gap-2"
          >
            <Coins className="h-4 w-4" />
            Current Balance
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="space-y-4">
            {leaderboard.length > 0 ? (
              <>
                {/* Top 3 */}
                {leaderboard.slice(0, 3).map((user, index) => {
                  const rank = index + 1;
                  return (
                    <Card
                      key={user._id}
                      className={`glass-card ${
                        rank <= 3 ? "ring-2 ring-primary/20" : ""
                      }`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Badge
                              className={`${getRankBadge(
                                rank
                              )} px-3 py-2 text-lg font-bold`}
                            >
                              {getRankIcon(rank)}
                            </Badge>
                            <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                              <AvatarImage
                                src={user.avatar || "/placeholder.svg"}
                                alt={user.displayName}
                              />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                {user.displayName[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <Link
                                href={`/profile/${user._id}`}
                                className="font-semibold text-lg hover:text-primary transition-colors"
                              >
                                {user.displayName}
                              </Link>
                              <p className="text-muted-foreground">
                                @{user.username}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">
                              {leaderboardType === "earned"
                                ? user.totalEarned
                                : user.coins}
                            </div>
                            <Badge className="coin-glow bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900 dark:to-amber-900 text-yellow-800 dark:text-yellow-200">
                              <Coins className="h-3 w-3 mr-1" />
                              coins
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {/* Rest of the leaderboard */}
                {leaderboard.slice(3).map((user, index) => {
                  const rank = index + 4;
                  return (
                    <Card key={user._id} className="glass-card">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 flex items-center justify-center">
                              <span className="text-lg font-bold text-muted-foreground">
                                #{rank}
                              </span>
                            </div>
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={user.avatar || "/placeholder.svg"}
                                alt={user.displayName}
                              />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                {user.displayName[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <Link
                                href={`/profile/${user._id}`}
                                className="font-medium hover:text-primary transition-colors"
                              >
                                {user.displayName}
                              </Link>
                              <p className="text-sm text-muted-foreground">
                                @{user.username}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-primary">
                              {(leaderboardType === "earned"
                                ? user.totalEarned
                                : user.coins
                              ).toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              coins
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </>
            ) : (
              <div className="text-center py-20">
                <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  No data available
                </h3>
                <p className="text-muted-foreground">
                  The leaderboard will populate as users earn coins
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
