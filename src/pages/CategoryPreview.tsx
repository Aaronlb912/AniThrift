import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { db } from "../firebase-config";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import MainLayout from "../components/MainLayout";
import { Carousel } from "../components/Carousel";
import { filterAdultContent } from "../utils/contentFilter";
import "../css/CategoryPreview.css";

interface Item {
  id: string;
  name: string;
  title?: string;
  price: string | number;
  imageUrl: string;
  photos?: string[];
  category?: string;
  viewCount?: number;
  createdAt?: Date;
  creationDate?: string;
  isAdultContent?: boolean;
}

// Helper to format price consistently (with $ prefix like App.tsx)
const formatPrice = (value: unknown): string => {
  if (value === undefined || value === null) return "$0.00";
  if (typeof value === "number" && !Number.isNaN(value)) {
    return `$${value.toFixed(2)}`;
  }
  if (typeof value === "string") {
    const numeric = Number(value);
    if (!Number.isNaN(numeric)) {
      return `$${numeric.toFixed(2)}`;
    }
    return value.startsWith("$") ? value : `$${value}`;
  }
  return "$0.00";
};

// Map category query strings to Firestore category values
const categoryMap: { [key: string]: string[] } = {
  anime: ["Digital Media", "anime", "Anime"],
  manga: ["Manga & Novels", "manga", "Manga"],
  merch: ["Merchandise", "merch", "Merchandise"],
  figures: ["Figures & Trinkets", "figures", "Figures"],
  apparel: ["Apparel", "apparel"],
  audio: ["Audio", "audio"],
  games: ["Games", "games"],
};

const categoryNames: { [key: string]: string } = {
  anime: "Digital Media",
  manga: "Manga & Novels",
  merch: "Merchandise",
  figures: "Figures & Trinkets",
  apparel: "Apparel",
  audio: "Audio",
  games: "Games",
  "": "All Categories",
};

const CategoryPreview: React.FC = () => {
  const { categoryQuery } = useParams<{ categoryQuery: string }>();
  const navigate = useNavigate();
  const [recentItems, setRecentItems] = useState<Item[]>([]);
  const [popularItems, setPopularItems] = useState<Item[]>([]);
  const [featuredItems, setFeaturedItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const categoryName = useMemo(() => {
    return categoryQuery ? categoryNames[categoryQuery] || categoryQuery : "All Categories";
  }, [categoryQuery]);

  const searchQuery = useMemo(() => {
    return categoryQuery || "";
  }, [categoryQuery]);

  useEffect(() => {
    const fetchItems = async () => {
      if (!categoryQuery) {
        // For "All Categories", fetch all items
        await fetchAllCategoryItems();
        return;
      }

      const categoryValues = categoryMap[categoryQuery] || [categoryQuery];
      setLoading(true);

      try {
        // Fetch all selling items first, then filter by category client-side
        // This is more reliable than trying to match categories in Firestore queries
        const recentQuery = query(
          collection(db, "items"),
          where("listingStatus", "==", "selling"),
          limit(100) // Fetch more items to ensure we have enough after filtering
        );

        const recentSnapshot = await getDocs(recentQuery);
        const allRecentItems: Item[] = [];

        recentSnapshot.docs.forEach((doc) => {
          const data = doc.data();
          const itemCategory = (data.category || "").toLowerCase().trim();
          
          // Check if item matches any of the category values (case-insensitive)
          const matchesCategory = categoryValues.some((cat) => {
            const catLower = cat.toLowerCase().trim();
            return itemCategory === catLower || 
                   itemCategory.includes(catLower) || 
                   catLower.includes(itemCategory);
          });
          
          if (matchesCategory) {
            const photoUrl =
              Array.isArray(data.photos) && data.photos.length > 0
                ? data.photos[0]
                : "https://via.placeholder.com/300x300?text=No+Image";
            
            // Format price consistently
            const formattedPrice = formatPrice(data.price);
            
            allRecentItems.push({
              id: doc.id,
              name: data.title || data.name || "Untitled",
              title: data.title || data.name || "Untitled",
              price: formattedPrice,
              imageUrl: photoUrl,
              photos: data.photos || [],
              category: data.category || "",
              viewCount: data.viewCount || 0,
              createdAt: data.creationDate 
                ? new Date(data.creationDate) 
                : undefined,
              creationDate: data.creationDate,
              isAdultContent: Boolean(data.isAdultContent),
            });
          }
        });

        // Sort by creation date and take top 10
        const sortedRecent = allRecentItems
          .sort((a, b) => {
            const dateA = a.createdAt || (a.creationDate ? new Date(a.creationDate) : new Date(0));
            const dateB = b.createdAt || (b.creationDate ? new Date(b.creationDate) : new Date(0));
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, 10);

        const filteredRecent = await filterAdultContent(sortedRecent);
        setRecentItems(filteredRecent);
        
        console.log(`Found ${allRecentItems.length} items for category ${categoryQuery}, showing ${filteredRecent.length} recent items`);

        // Fetch popular items - reuse the same items and sort by viewCount
        const allPopularItems: Item[] = [...allRecentItems];

        // Sort by view count and take top 10
        const sortedPopular = allPopularItems
          .sort((a, b) => {
            // If viewCount is the same, sort by creation date
            const viewDiff = (b.viewCount || 0) - (a.viewCount || 0);
            if (viewDiff !== 0) return viewDiff;
            const dateA = a.createdAt || (a.creationDate ? new Date(a.creationDate) : new Date(0));
            const dateB = b.createdAt || (b.creationDate ? new Date(b.creationDate) : new Date(0));
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, 10);

        const filteredPopular = await filterAdultContent(sortedPopular);
        setPopularItems(filteredPopular);
        console.log(`Showing ${filteredPopular.length} popular items`);

        // Featured items: mix of recent and popular (top 8)
        const featured = [...filteredRecent, ...filteredPopular]
          .filter((item, index, self) => 
            index === self.findIndex((t) => t.id === item.id)
          )
          .slice(0, 8);
        const filteredFeatured = await filterAdultContent(featured);
        setFeaturedItems(filteredFeatured);

      } catch (error) {
        console.error("Error fetching category items:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchAllCategoryItems = async () => {
      setLoading(true);
      try {
        // Fetch recent items
        const recentQuery = query(
          collection(db, "items"),
          where("listingStatus", "==", "selling"),
          orderBy("creationDate", "desc"),
          limit(10)
        );

        const recentSnapshot = await getDocs(recentQuery);
        const recent: Item[] = recentSnapshot.docs.map((doc) => {
          const data = doc.data();
          const photoUrl =
            Array.isArray(data.photos) && data.photos.length > 0
              ? data.photos[0]
              : "https://via.placeholder.com/300x300?text=No+Image";
          
          // Format price consistently
          const formattedPrice = formatPrice(data.price);
          
          return {
            id: doc.id,
            name: data.title || data.name || "Untitled",
            title: data.title || data.name || "Untitled",
            price: formattedPrice,
            imageUrl: photoUrl,
            photos: data.photos || [],
            category: data.category || "",
            viewCount: data.viewCount || 0,
            createdAt: data.creationDate 
              ? new Date(data.creationDate) 
              : undefined,
            creationDate: data.creationDate,
            isAdultContent: Boolean(data.isAdultContent),
          };
        });

        const filteredRecent = await filterAdultContent(recent);
        setRecentItems(filteredRecent);

        // Fetch popular items
        let popularSnapshot;
        try {
          const popularQuery = query(
            collection(db, "items"),
            where("listingStatus", "==", "selling"),
            orderBy("viewCount", "desc"),
            limit(10)
          );
          popularSnapshot = await getDocs(popularQuery);
        } catch (error) {
          // Fallback: fetch without orderBy if index doesn't exist
          console.warn("Could not order by viewCount, fetching all and sorting client-side:", error);
          const popularQuery = query(
            collection(db, "items"),
            where("listingStatus", "==", "selling"),
            limit(50)
          );
          popularSnapshot = await getDocs(popularQuery);
        }
        const popular: Item[] = popularSnapshot.docs.map((doc) => {
          const data = doc.data();
          const photoUrl =
            Array.isArray(data.photos) && data.photos.length > 0
              ? data.photos[0]
              : "https://via.placeholder.com/300x300?text=No+Image";
          
          // Format price consistently
          const formattedPrice = formatPrice(data.price);
          
          return {
            id: doc.id,
            name: data.title || data.name || "Untitled",
            title: data.title || data.name || "Untitled",
            price: formattedPrice,
            imageUrl: photoUrl,
            photos: data.photos || [],
            category: data.category || "",
            viewCount: data.viewCount || 0,
            createdAt: data.creationDate 
              ? new Date(data.creationDate) 
              : undefined,
            creationDate: data.creationDate,
            isAdultContent: Boolean(data.isAdultContent),
          };
        });

        // Sort by view count
        const sortedPopular = popular
          .sort((a, b) => {
            const viewDiff = (b.viewCount || 0) - (a.viewCount || 0);
            if (viewDiff !== 0) return viewDiff;
            const dateA = a.createdAt || (a.creationDate ? new Date(a.creationDate) : new Date(0));
            const dateB = b.createdAt || (b.creationDate ? new Date(b.creationDate) : new Date(0));
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, 10);
        const filteredPopular = await filterAdultContent(sortedPopular);
        setPopularItems(filteredPopular);

        // Featured items
        const featured = [...filteredRecent, ...filteredPopular]
          .filter((item, index, self) => 
            index === self.findIndex((t) => t.id === item.id)
          )
          .slice(0, 8);
        const filteredFeatured = await filterAdultContent(featured);
        setFeaturedItems(filteredFeatured);

      } catch (error) {
        console.error("Error fetching all items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [categoryQuery]);

  const handleViewMore = () => {
    navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="category-preview-container">
          <div className="category-loading">Loading...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="category-preview-container">
        {/* Category Hero Section */}
        <div className="category-hero">
          <h1 className="category-title">{categoryName}</h1>
          <p className="category-description">
            Discover the latest and most popular items in {categoryName.toLowerCase()}
          </p>
        </div>

        {/* Featured Items Section */}
        {featuredItems.length > 0 ? (
          <section className="category-section">
            <div className="section-header">
              <h2 className="section-title">Featured Items</h2>
            </div>
            <Carousel items={featuredItems} />
          </section>
        ) : !loading && (
          <section className="category-section">
            <div className="section-header">
              <h2 className="section-title">Featured Items</h2>
            </div>
            <p className="no-items-message">No featured items found in this category.</p>
          </section>
        )}

        {/* Most Recent Items Section */}
        {recentItems.length > 0 ? (
          <section className="category-section">
            <div className="section-header">
              <h2 className="section-title">Most Recent</h2>
            </div>
            <Carousel items={recentItems} />
          </section>
        ) : !loading && (
          <section className="category-section">
            <div className="section-header">
              <h2 className="section-title">Most Recent</h2>
            </div>
            <p className="no-items-message">No recent items found in this category.</p>
          </section>
        )}

        {/* Most Popular Items Section */}
        {popularItems.length > 0 ? (
          <section className="category-section">
            <div className="section-header">
              <h2 className="section-title">Most Popular</h2>
            </div>
            <Carousel items={popularItems} />
          </section>
        ) : !loading && (
          <section className="category-section">
            <div className="section-header">
              <h2 className="section-title">Most Popular</h2>
            </div>
            <p className="no-items-message">No popular items found in this category.</p>
          </section>
        )}

        {/* View More Button */}
        <div className="view-more-container">
          <button className="view-more-button" onClick={handleViewMore}>
            View All {categoryName} Items
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default CategoryPreview;

