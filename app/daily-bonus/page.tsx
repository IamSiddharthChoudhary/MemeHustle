"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Gift, Coins, Calendar, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function DailyBonusPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [claimed, setClaimed] = useState(false);

  if (!user) {
    router.push("/login");
    return null;
  }

  const handleClaimBonus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/coins/daily-bonus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setClaimed(true);
        await refreshUser();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Failed to claim bonus");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 floating-animation">
            <Gift className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Daily Bonus</h1>
          <p className="text-muted-foreground text-lg">
            Claim your daily coins and keep the meme economy flowing!
          </p>
        </div>

        <Card className="glass-card">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Calendar className="h-6 w-6" />
              Daily Reward
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-6xl font-bold text-primary mb-2">10</div>
              <Badge className="coin-glow bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900 dark:to-amber-900 text-yellow-800 dark:text-yellow-200 text-lg px-4 py-2">
                <Coins className="h-5 w-5 mr-2" />
                Free Coins Daily
              </Badge>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold">How it works:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Visit daily to claim your 10 free coins</li>
                <li>• Use coins to download memes or tip creators</li>
                <li>• Bonus resets every 24 hours</li>
                <li>• Build your coin balance over time</li>
              </ul>
            </div>

            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Current Balance:{" "}
                <span className="font-semibold text-primary">
                  {user.coins} coins
                </span>
              </p>

              {claimed ? (
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">
                    Bonus claimed! Come back tomorrow
                  </span>
                </div>
              ) : (
                <Button
                  size="lg"
                  onClick={handleClaimBonus}
                  disabled={isLoading}
                  className="w-full sm:w-auto text-lg px-8 py-6 h-auto pulse-glow"
                >
                  {isLoading ? (
                    "Claiming..."
                  ) : (
                    <>
                      <Gift className="h-5 w-5 mr-2" />
                      Claim Daily Bonus
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="glass-card">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-primary">
                {user.totalEarned}
              </div>
              <div className="text-muted-foreground">Total Earned</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-primary">
                {user.totalSpent}
              </div>
              <div className="text-muted-foreground">Total Spent</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
