"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  Heart,
  Eye,
  Download,
  Coins,
  Star,
  Crown,
  ExternalLink,
  Share2,
  CheckCircle,
} from "lucide-react";

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

interface MemeCardProps {
  meme: Meme;
  onLike?: (memeId: string, liked: boolean) => void;
  onPurchase?: (memeId: string, updatedMeme: Partial<Meme>) => void;
}

export default function MemeCard({ meme, onLike, onPurchase }: MemeCardProps) {
  const { user, updateUser, refreshUser } = useAuth();
  const [isLiked, setIsLiked] = useState(
    user ? meme.likes.includes(user._id) : false
  );
  const [likesCount, setLikesCount] = useState(
    meme.likesCount || meme.likes.length
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [memeState, setMemeState] = useState(meme);

  const handleLike = async () => {
    if (!user) {
      toast.error("Please login to like memes");
      return;
    }

    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount((prev) => (newLikedState ? prev + 1 : prev - 1));
    onLike?.(meme._id, newLikedState);
    toast.success(newLikedState ? "Meme liked! ❤️" : "Like removed");
  };

  const handlePurchase = async () => {
    if (!user) {
      toast.error("Please login to purchase memes");
      return;
    }

    if (user.coins < memeState.price) {
      toast.error(
        `You need ${memeState.price} coins but only have ${user.coins}`
      );
      return;
    }

    if (user._id === memeState.creator) {
      toast.error("You cannot buy your own meme");
      return;
    }

    if (!memeState.isForSale) {
      toast.error("This meme is not for sale");
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading("Processing purchase...");

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          buyerId: user._id,
          memeId: memeState._id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.dismiss(loadingToast);
        toast.success(data.message);

        // Update user balance in context
        updateUser({
          coins: data.data.buyer.coins,
          totalSpent: data.data.buyer.totalSpent,
        });

        // Update meme state
        const updatedMeme = {
          ...memeState,
          isForSale: data.data.meme.isForSale,
          currentOwner: data.data.meme.currentOwner,
          downloads: data.data.meme.downloads,
        };
        setMemeState(updatedMeme);
        setIsPurchased(true);

        // Notify parent component
        onPurchase?.(memeState._id, updatedMeme);

        // Refresh user data to ensure consistency
        await refreshUser();
      } else {
        throw new Error(data.error || "Purchase failed");
      }
    } catch (error) {
      console.error("Purchase error:", error);
      toast.dismiss(loadingToast);
      toast.error(
        error instanceof Error
          ? error.message
          : "Purchase failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!user) {
      toast.error("Please login to download memes");
      return;
    }

    // Check if user owns this meme (for exclusive memes)
    if (
      memeState.isExclusive &&
      memeState.currentOwner &&
      memeState.currentOwner !== user._id
    ) {
      toast.error("You need to purchase this exclusive meme first");
      return;
    }

    toast.success(`Downloaded ${memeState.title}! 📥`);

    // Create a mock download
    const link = document.createElement("a");
    link.href = memeState.imageUrl;
    link.download = `${memeState.title}.jpg`;
    link.click();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: memeState.title,
          text: memeState.description,
          url: `/meme/${memeState._id}`,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(
        `${window.location.origin}/meme/${memeState._id}`
      );
      toast.success("Link copied to clipboard! 📋");
    }
  };

  // Check if user owns this meme
  const isOwned =
    user &&
    ((memeState.isExclusive && memeState.currentOwner === user._id) ||
      (!memeState.isExclusive && isPurchased));

  // Check if user is the creator
  const isCreator = user && user._id === memeState.creator;

  return (
    <Card className="group meme-card-hover glass-card overflow-hidden">
      <CardHeader className="p-0 relative">
        <div className="relative aspect-square bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
          <Image
            src={memeState.imageUrl || "/placeholder.svg"}
            alt={memeState.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Overlay Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {memeState.isFeatured && (
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
            {memeState.isExclusive && (
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg">
                <Crown className="h-3 w-3 mr-1" />
                Exclusive
              </Badge>
            )}
            {isOwned && (
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg">
                <CheckCircle className="h-3 w-3 mr-1" />
                Owned
              </Badge>
            )}
          </div>

          {/* Quick Actions Overlay */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex flex-col gap-2">
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 bg-white/90 hover:bg-white"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 bg-white/90 hover:bg-white"
                asChild
              >
                <Link href={`/meme/${memeState._id}`}>
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Overlay */}
          <div className="absolute bottom-3 left-3 flex items-center gap-3 text-white text-sm">
            <div className="flex items-center gap-1 bg-black/50 rounded-full px-2 py-1">
              <Eye className="h-3 w-3" />
              {memeState.views.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 bg-black/50 rounded-full px-2 py-1">
              <Download className="h-3 w-3" />
              {memeState.downloads.toLocaleString()}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
            {memeState.title}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-2 mt-1">
            {memeState.description}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {memeState.category}
          </Badge>
          <div className="flex flex-wrap gap-1">
            {memeState.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        </div>

        {memeState.creatorInfo && (
          <div className="flex items-center space-x-2 pt-2 border-t">
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={memeState.creatorInfo.avatar || "/placeholder.svg"}
                alt={memeState.creatorInfo.displayName}
              />
              <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {memeState.creatorInfo.displayName[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Link
              href={`/profile/${memeState.creatorInfo._id}`}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              ..{memeState.creatorInfo.username}
            </Link>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`h-8 px-2 ${
              isLiked
                ? "text-red-500 hover:text-red-600"
                : "text-muted-foreground hover:text-red-500"
            }`}
          >
            <Heart
              className={`h-4 w-4 mr-1 ${isLiked ? "fill-current" : ""}`}
            />
            {likesCount}
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          {memeState.price === 0 ? (
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownload}
              className="h-8"
            >
              <Download className="h-3 w-3 mr-1" />
              Free
            </Button>
          ) : (
            <>
              <Badge className="coin-glow bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900 dark:to-amber-900 text-yellow-800 dark:text-yellow-200">
                <Coins className="h-3 w-3 mr-1" />
                {memeState.price}
              </Badge>

              {isCreator ? (
                <Badge variant="secondary" className="h-8 px-3">
                  Your Meme
                </Badge>
              ) : isOwned ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownload}
                  className="h-8"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
              ) : memeState.isForSale ? (
                <Button
                  size="sm"
                  onClick={handlePurchase}
                  disabled={isLoading}
                  className="h-8"
                >
                  {isLoading ? "Buying..." : "Buy"}
                </Button>
              ) : (
                <Badge variant="secondary" className="h-8 px-3">
                  Sold Out
                </Badge>
              )}
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
