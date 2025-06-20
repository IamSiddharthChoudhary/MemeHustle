"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import MemeCard from "../components/MemeCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  TrendingUp,
  Star,
  Users,
  ArrowRight,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import CursorFollower from "../components/cursor-follower";

interface Meme {
  _id: string;
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
  createdAt: string;
  creatorInfo?: {
    _id: string;
    username: string;
    displayName: string;
    avatar?: string;
  };
  likesCount?: number;
}

export default function HomePage() {
  const { user } = useAuth();
  const [featuredMemes, setFeaturedMemes] = useState<Meme[]>([]);
  const [latestMemes, setLatestMemes] = useState<Meme[]>([]);
  const [trendingMemes, setTrendingMemes] = useState<Meme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMemes: 0,
    totalUsers: 0,
    totalTransactions: 0,
  });

  useEffect(() => {
    fetchMemes();
    fetchStats();
  }, []);

  const fetchMemes = async () => {
    try {
      const [featuredRes, latestRes, trendingRes] = await Promise.all([
        fetch("/api/memes?limit=6&sortBy=isFeatured"),
        fetch("/api/memes?limit=8&sortBy=createdAt&order=desc"),
        fetch("/api/memes?limit=6&sortBy=likes&order=desc"),
      ]);

      const [featuredData, latestData, trendingData] = await Promise.all([
        featuredRes.json(),
        latestRes.json(),
        trendingRes.json(),
      ]);

      if (featuredRes.ok) setFeaturedMemes(featuredData.memes);
      if (latestRes.ok) setLatestMemes(latestData.memes);
      if (trendingRes.ok) setTrendingMemes(trendingData.memes);
    } catch (error) {
      console.error("Failed to fetch memes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats");
      const data = await response.json();
      if (response.ok) {
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <CursorFollower />
      <Navbar />

      {/* Hero Section with Animated Gradient */}
      <section className="relative overflow-hidden py-20 lg:py-32 mb-8">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 animate-gradient-move" />

        {/* Additional animated overlay for more depth */}
        <div className="absolute inset-0 opacity-50">
          <div className="absolute inset-0 animate-gradient" />
        </div>

        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 px-4 py-2 text-sm font-medium animate-pulse">
                <Sparkles className="h-4 w-4 mr-2" />
                Welcome to the Future of Memes
              </Badge>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                <span className="gradient-text">MemeVault</span>
                <br />
                <span className="text-foreground">Premium Marketplace</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Discover, buy, sell, and trade premium memes with virtual coins.
                Join thousands of creators in the ultimate meme economy.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                asChild
                className="text-lg px-8 py-6 h-auto hover:scale-105 transition-transform"
              >
                <Link href="/explore">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Explore Memes
                </Link>
              </Button>
              {!user && (
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="text-lg px-8 py-6 h-auto hover:scale-105 transition-transform"
                >
                  <Link href="/signup">
                    <Zap className="h-5 w-5 mr-2" />
                    Join Now
                  </Link>
                </Button>
              )}
            </div>

            {/* Stats
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto mt-16">
              <Card className="glass-card text-center hover:scale-105 transition-transform">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-primary">
                    {stats.totalMemes.toLocaleString()}
                  </div>
                  <div className="text-muted-foreground">Premium Memes</div>
                </CardContent>
              </Card>
              <Card className="glass-card text-center hover:scale-105 transition-transform">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-primary">
                    {stats.totalUsers.toLocaleString()}
                  </div>
                  <div className="text-muted-foreground">Active Creators</div>
                </CardContent>
              </Card>
              <Card className="glass-card text-center hover:scale-105 transition-transform">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-primary">
                    {stats.totalTransactions.toLocaleString()}
                  </div>
                  <div className="text-muted-foreground">Transactions</div>
                </CardContent>
              </Card>
            </div> */}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 pb-20">
        {/* Featured Memes */}
        {featuredMemes.length > 0 && (
          <section>
            <div className="flex items-center justify-between my-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Featured Memes</h2>
                  <p className="text-muted-foreground">
                    Hand-picked premium content
                  </p>
                </div>
              </div>
              <Button variant="outline" asChild>
                <Link href="/featured" className="flex items-center gap-2">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredMemes.map((meme) => (
                <MemeCard key={meme._id} meme={meme} />
              ))}
            </div>
          </section>
        )}

        {/* Trending Memes */}
        {trendingMemes.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Trending Now</h2>
                  <p className="text-muted-foreground">
                    Most popular this week
                  </p>
                </div>
              </div>
              <Button variant="outline" asChild>
                <Link href="/trending" className="flex items-center gap-2">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingMemes.map((meme) => (
                <MemeCard key={meme._id} meme={meme} />
              ))}
            </div>
          </section>
        )}

        {/* Latest Memes */}
        {latestMemes.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Fresh Drops</h2>
                  <p className="text-muted-foreground">
                    Latest uploads from creators
                  </p>
                </div>
              </div>
              <Button variant="outline" asChild>
                <Link href="/explore" className="flex items-center gap-2">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {latestMemes.map((meme) => (
                <MemeCard key={meme._id} meme={meme} />
              ))}
            </div>
          </section>
        )}

        {/* CTA Section */}
        {!user && (
          <section className="text-center py-16">
            <Card className="glass-card max-w-2xl mx-auto hover:scale-105 transition-transform">
              <CardContent className="p-12">
                <div className="space-y-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
                    <Trophy className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">
                      Ready to Join the Revolution?
                    </h3>
                    <p className="text-muted-foreground">
                      Start your meme journey today. Upload, trade, and earn
                      coins in the most vibrant meme community.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" asChild>
                      <Link href="/signup">
                        <Users className="h-5 w-5 mr-2" />
                        Create Account
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <Link href="/login">Sign In</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </div>
    </div>
  );
}
