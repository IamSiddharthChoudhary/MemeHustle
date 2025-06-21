"use client";
import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import MemeCard from "../../components/MemeCard";
import SearchFilters from "../../components/SearchFilters";
import LoadingSpinner from "../../components/LoadingSpinner";
import Pagination from "../../components/Pagination";
import { useAuth } from "../../contexts/AuthContext";

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

export default function ExplorePage() {
  const { user } = useAuth();
  const [memes, setMemes] = useState<Meme[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchMemes();
  }, [pagination.page, searchQuery, selectedCategory, sortBy, order]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      if (response.ok) {
        setCategories(data.categories.map((cat: any) => cat._id));
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchMemes = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        order,
      });

      if (searchQuery) params.append("search", searchQuery);
      if (selectedCategory && selectedCategory !== "all")
        params.append("category", selectedCategory);

      const response = await fetch(`/api/memes?${params}`);
      const data = await response.json();

      if (response.ok) {
        setMemes(data.memes);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch memes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSortChange = (newSortBy: string, newOrder: string) => {
    setSortBy(newSortBy);
    setOrder(newOrder);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLike = (memeId: string, liked: boolean) => {
    setMemes((prev) =>
      prev.map((meme) =>
        meme._id === memeId
          ? {
              ...meme,
              likes: liked
                ? [...meme.likes, user!._id]
                : meme.likes.filter((id) => id !== user!._id),
              likesCount: (meme.likesCount || 0) + (liked ? 1 : -1),
            }
          : meme
      )
    );
  };

  const handlePurchase = (memeId: string) => {
    // fetchMemes();
    // if (user) {
    // }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">
            Explore Memes
          </h1>
          <p className="text-muted-foreground text-lg">
            Discover amazing memes from creators around the world
          </p>
        </div>

        <SearchFilters
          onSearch={handleSearch}
          onCategoryChange={handleCategoryChange}
          onSortChange={handleSortChange}
          categories={categories}
        />

        {isLoading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-muted-foreground">
                Showing {memes.length} of {pagination.total} memes
              </p>
            </div>

            {memes.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {memes.map((meme) => (
                    <MemeCard
                      key={meme._id}
                      meme={meme}
                      onLike={handleLike}
                      onPurchase={handlePurchase}
                    />
                  ))}
                </div>

                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">No memes found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or browse different
                  categories
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
