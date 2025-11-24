import React, { useState, useEffect, useMemo, useCallback } from "react";
import "./App.css";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "./firebase-config";
import { Carousel } from "./components/Carousel";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Link } from "react-router-dom";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import ban1 from "./assets/ban1.jpeg";
import ban2 from "./assets/ban2.jpg";
import ban3 from "./assets/ban3.jpg";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  DocumentReference,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { filterAdultContent } from "./utils/contentFilter";

interface Item {
  id: string;
  imageUrl: string;
  name: string;
  price: string;
  category?: string;
  tags?: string[];
  sellerId?: string;
  listingStatus?: string;
  createdAt?: number;
  viewedAt?: number;
  viewCount?: number;
  isAdultContent?: boolean;
}

const FALLBACK_IMAGE = "https://via.placeholder.com/400x400.png?text=No+Image";

const formatPrice = (value: unknown): string => {
  if (value === undefined || value === null) return "Price unavailable";
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
  return "Price unavailable";
};

const parseTimestamp = (value: unknown): number => {
  if (!value) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  if (typeof value === "object" && value !== null) {
    const maybeSeconds = (value as { seconds?: number }).seconds;
    if (typeof maybeSeconds === "number") {
      return maybeSeconds * 1000;
    }
    const toDateFn = (value as { toDate?: () => Date }).toDate;
    if (typeof toDateFn === "function") {
      const date = toDateFn();
      return Number.isNaN(date.getTime()) ? 0 : date.getTime();
    }
  }
  return 0;
};

const sanitizeTags = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((tag) =>
      typeof tag === "string" ? tag.trim().toLowerCase() : ""
    )
    .filter(Boolean);
};

const mapFirestoreItem = (id: string, data: Record<string, any>): Item => {
  const photoUrl = Array.isArray(data.photos) && data.photos.length > 0
    ? data.photos[0]
    : FALLBACK_IMAGE;

  return {
    id,
    name: data.title || data.name || "Untitled",
    price: formatPrice(data.price),
    imageUrl: photoUrl,
    category: typeof data.category === "string" ? data.category : "",
    tags: sanitizeTags(data.tags),
    sellerId: typeof data.sellerId === "string" ? data.sellerId : undefined,
    listingStatus: typeof data.listingStatus === "string" ? data.listingStatus : undefined,
    createdAt: parseTimestamp(data.creationDate || data.createdAt || data.created_at),
    viewCount: typeof data.viewCount === "number" ? data.viewCount : 0,
    isAdultContent: Boolean(data.isAdultContent),
  };
};

interface HeroArrowProps {
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const HeroPrevArrow: React.FC<HeroArrowProps> = ({ className, style, onClick }) => (
  <div
    className={`${className ?? ""} hero-carousel-arrow hero-carousel-arrow--prev`}
    style={{ ...style }}
    onClick={onClick}
    role="button"
    tabIndex={0}
    onKeyDown={(event) => {
      if ((event.key === "Enter" || event.key === " ") && onClick) {
        event.preventDefault();
        onClick();
      }
    }}
  >
    <KeyboardArrowLeftIcon fontSize="large" />
  </div>
);

const HeroNextArrow: React.FC<HeroArrowProps> = ({ className, style, onClick }) => (
  <div
    className={`${className ?? ""} hero-carousel-arrow hero-carousel-arrow--next`}
    style={{ ...style }}
    onClick={onClick}
    role="button"
    tabIndex={0}
    onKeyDown={(event) => {
      if ((event.key === "Enter" || event.key === " ") && onClick) {
        event.preventDefault();
        onClick();
      }
    }}
  >
    <KeyboardArrowRightIcon fontSize="large" />
  </div>
);

const App: React.FC = () => {
  const [user] = useAuthState(auth);
  const [watchListItems, setWatchListItems] = useState<Item[]>([]);
  const [recentlyViewedItems, setRecentlyViewedItems] = useState<Item[]>([]);
  const [picksForYouItems, setPicksForYouItems] = useState<Item[]>([]);
  const [recentCategoryItems, setRecentCategoryItems] = useState<Item[]>([]);
  const [guestRecentItems, setGuestRecentItems] = useState<Item[]>([]);
  const [guestPopularItems, setGuestPopularItems] = useState<Item[]>([]);
  const [guestItems, setGuestItems] = useState<Item[]>([]);

  const fetchWatchListItems = useCallback(async (uid: string) => {
    try {
      const watchlistRef = collection(db, "users", uid, "watchlist");
      const querySnapshot = await getDocs(watchlistRef);
      const items = (
        await Promise.all(
          querySnapshot.docs.map(async (docSnapshot) => {
            const itemRef = docSnapshot.data().ref as DocumentReference | undefined;
            if (!itemRef) return null;

            const itemSnapshot = await getDoc(itemRef);
            if (itemSnapshot.exists()) {
              const data = itemSnapshot.data();
              return mapFirestoreItem(itemSnapshot.id, data);
            }
            return null;
          })
        )
      ).filter((item): item is Item => item !== null);
      setWatchListItems(items);
    } catch (error) {
      console.error("Error fetching watchlist items:", error);
      setWatchListItems([]);
    }
  }, []);

  const fetchAllMarketplaceItems = useCallback(async (): Promise<Item[]> => {
    const snapshot = await getDocs(collection(db, "items"));
    return snapshot.docs.map((docSnapshot) => {
      const data = docSnapshot.data();
      return mapFirestoreItem(docSnapshot.id, data);
    });
  }, []);

  const fetchPersonalizedCarousels = useCallback(
    async (uid: string) => {
      try {
        const recentlyViewedRef = collection(db, "users", uid, "recentlyViewed");
        let recentlyViewedSnapshot;
        try {
          recentlyViewedSnapshot = await getDocs(
            query(recentlyViewedRef, orderBy("viewedAt", "desc"), limit(50))
          );
        } catch (error) {
          recentlyViewedSnapshot = await getDocs(recentlyViewedRef);
        }

        const recentlyViewed = (
          await Promise.all(
            recentlyViewedSnapshot.docs.map(async (docSnapshot) => {
              const data = docSnapshot.data();
              const itemRef = data.ref as DocumentReference | undefined;
              if (!itemRef) return null;

              const itemSnapshot = await getDoc(itemRef);
              if (!itemSnapshot.exists()) return null;

              const mapped = mapFirestoreItem(itemSnapshot.id, itemSnapshot.data());
              const viewedAtValue = parseTimestamp(data.viewedAt);
              return {
                ...mapped,
                viewedAt: viewedAtValue || Date.now(),
              };
            })
          )
        ).filter((item): item is Item => item !== null);

        recentlyViewed.sort((a, b) => (b.viewedAt ?? 0) - (a.viewedAt ?? 0));
        const filteredRecentlyViewed = await filterAdultContent(recentlyViewed.slice(0, 20));
        setRecentlyViewedItems(filteredRecentlyViewed);

        if (recentlyViewed.length === 0) {
          const all = await fetchAllMarketplaceItems();
          const available = all.filter((item) => item.listingStatus !== "sold" && item.sellerId !== uid);
          const filteredAvailable = await filterAdultContent(available);
          const sortedRecent = filteredAvailable
            .filter((item) => {
              const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
              return (item.createdAt ?? 0) >= monthAgo;
            })
            .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
          const finalPicks = sortedRecent.length > 0
              ? sortedRecent.slice(0, 12)
              : filteredAvailable.sort(() => 0.5 - Math.random()).slice(0, 12);
          setPicksForYouItems(finalPicks);
          const popularPool = filteredAvailable
            .slice()
            .sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0));
          setRecentCategoryItems(
            popularPool.length > 0
              ? popularPool.slice(0, 9)
              : filteredAvailable.slice(0, 9)
          );
          return;
        }

        const categoryStats = new Map<string, { count: number; latest: number }>();
        const tagStats = new Map<string, number>();

        recentlyViewed.forEach((item, index) => {
          const fallbackLatest = recentlyViewed.length - index;
          if (item.category) {
            const entry = categoryStats.get(item.category) || { count: 0, latest: 0 };
            entry.count += 1;
            entry.latest = Math.max(entry.latest, item.viewedAt ?? fallbackLatest);
            categoryStats.set(item.category, entry);
          }
          (item.tags || []).forEach((tag) => {
            tagStats.set(tag, (tagStats.get(tag) || 0) + 1);
          });
        });

        const topCategoryNames = Array.from(categoryStats.entries())
          .sort((a, b) => b[1].count - a[1].count)
          .slice(0, 3)
          .map(([category]) => category);

        const topTagNames = Array.from(tagStats.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([tag]) => tag);

        const recentCategoriesByOrder = Array.from(categoryStats.entries())
          .sort((a, b) => (b[1].latest ?? 0) - (a[1].latest ?? 0))
          .map(([category]) => category)
          .filter(Boolean)
          .slice(0, 3);

        const allItems = await fetchAllMarketplaceItems();
        const availableItems = allItems.filter((item) =>
          item.listingStatus !== "sold" && item.sellerId !== uid
        );
        const filteredAvailableItems = await filterAdultContent(availableItems);
        const recentlyViewedIds = new Set(recentlyViewed.map((item) => item.id));

        const scoredItems = filteredAvailableItems
          .filter((item) => !recentlyViewedIds.has(item.id))
          .map((item) => {
            let score = 0;
            if (item.category && topCategoryNames.includes(item.category)) {
              score += 3;
            }
            const itemTags = item.tags || [];
            const overlaps = itemTags.filter((tag) => topTagNames.includes(tag));
            score += overlaps.length;
            return {
              item,
              score,
            };
          })
          .filter(({ score }) => score > 0)
          .sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return (b.item.createdAt ?? 0) - (a.item.createdAt ?? 0);
          });

        const picks = scoredItems
          .map(({ item }) => item)
          .slice(0, 12);

        const filteredPicks = await filterAdultContent(
          picks.length > 0 ? picks : recentlyViewed.slice(0, 12)
        );
        setPicksForYouItems(filteredPicks);

        const categoryItems: Item[] = [];
        const seenIds = new Set<string>();
        recentCategoriesByOrder.forEach((category) => {
          const itemsForCategory = filteredAvailableItems
            .filter((item) => item.category === category)
            .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
            .slice(0, 3);
          itemsForCategory.forEach((item) => {
            if (!seenIds.has(item.id)) {
              categoryItems.push(item);
              seenIds.add(item.id);
            }
          });
        });

        if (categoryItems.length === 0) {
          categoryItems.push(...recentlyViewed.slice(0, 9));
        }

        const filteredCategoryItems = await filterAdultContent(categoryItems);
        setRecentCategoryItems(filteredCategoryItems);
      } catch (error) {
        console.error("Error building personalized carousels:", error);
        setRecentlyViewedItems([]);
        setPicksForYouItems([]);
        setRecentCategoryItems([]);
      }
    },
    [fetchAllMarketplaceItems]
  );

  useEffect(() => {
    const initGuestItems = async () => {
      const all = await fetchAllMarketplaceItems();
      const available = all.filter((item) => item.listingStatus !== "sold");
      const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

      const recent = available
        .filter((item) => (item.createdAt ?? 0) >= monthAgo)
        .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));

      const popular = available
        .slice()
        .sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0));

      const fallbackShuffled = available.sort(() => 0.5 - Math.random());

      const filteredRecent = await filterAdultContent(
        recent.length > 0 ? recent.slice(0, 20) : fallbackShuffled.slice(0, 20)
      );
      const filteredPopular = await filterAdultContent(
        popular.length > 0
          ? popular.slice(0, 20)
          : fallbackShuffled.slice(0, 20)
      );
      
      setGuestRecentItems(filteredRecent);
      setGuestPopularItems(filteredPopular);
    };

    if (user) {
      fetchWatchListItems(user.uid);
      fetchPersonalizedCarousels(user.uid);
    } else {
      setWatchListItems([]);
      setRecentlyViewedItems([]);
      setPicksForYouItems([]);
      setRecentCategoryItems([]);
      initGuestItems();
    }
  }, [
    user,
    fetchWatchListItems,
    fetchPersonalizedCarousels,
    fetchAllMarketplaceItems,
  ]);

  const defaultCarouselItems = useMemo(
    () => [
      {
        imageUrl: ban1,
        name: "Featured Listing 1",
        price: "$45.00",
      },
      {
        imageUrl: ban2,
        name: "Featured Listing 2",
        price: "$38.00",
      },
      {
        imageUrl: ban3,
        name: "Featured Listing 3",
        price: "$52.00",
      },
    ],
    []
  );

  const picksCarouselItems = user
    ? picksForYouItems.length > 0
      ? picksForYouItems
      : recentlyViewedItems.length > 0
      ? recentlyViewedItems
      : guestRecentItems
    : guestRecentItems.length > 0
    ? guestRecentItems
    : defaultCarouselItems;

  const recentCategoriesCarouselItems = user
    ? recentCategoryItems.length > 0
      ? recentCategoryItems
      : recentlyViewedItems.length > 0
      ? recentlyViewedItems
      : guestPopularItems
    : guestPopularItems.length > 0
    ? guestPopularItems
    : defaultCarouselItems;

  const heroSlides = useMemo(
    () => [
      {
        id: "welcome",
        title: "Welcome to AniThrift!",
        subtitle:
          "Your destination for pre-loved and rare anime finds. Refresh your collection without breaking the bank.",
        ctaText: "Shop All Vintage Finds",
        ctaLink: "/search?query=vintage",
        overlayStart: "rgba(49, 46, 129, 0.88)",
        overlayEnd: "rgba(30, 64, 175, 0.82)",
        eyebrow: "Curated Marketplace",
      },
      {
        id: "figures",
        title: "Rare Figures, Secured.",
        subtitle:
          "Discover exclusive statues, prize figures, and grails from the series you love—fully authenticated by our community.",
        ctaText: "Explore Figures & Statues",
        ctaLink: "/search?query=figures",
        overlayStart: "rgba(107, 33, 168, 0.88)",
        overlayEnd: "rgba(147, 51, 234, 0.78)",
        eyebrow: "Collector Spotlight",
      },
      {
        id: "flash-sale",
        title: "20% Off All Apparel",
        subtitle:
          "Streetwear, cosplay essentials, and cozy fits inspired by your favorite worlds—limited time only!",
        ctaText: "Grab the Discount",
        ctaLink: "/search?query=apparel",
        overlayStart: "rgba(220, 38, 38, 0.9)",
        overlayEnd: "rgba(234, 179, 8, 0.85)",
        eyebrow: "Flash Sale",
      },
    ],
    []
  );

  const heroCarouselSettings = useMemo(
    () => ({
      dots: true,
      infinite: heroSlides.length > 1,
      speed: 900,
      fade: true,
      autoplay: true,
      autoplaySpeed: 6000,
      pauseOnHover: true,
      arrows: true,
      nextArrow: <HeroNextArrow />,
      prevArrow: <HeroPrevArrow />,
      draggable: true,
      swipe: true,
      adaptiveHeight: false,
    }),
    [heroSlides.length]
  );

  return (
    <div className="background">
      <div className="homepage">
        <section className="hero-carousel-wrapper">
          <div className="hero-carousel">
            <Slider {...heroCarouselSettings}>
              {heroSlides.map((slide) => {
                const backgroundStyle = {
                  backgroundImage: `linear-gradient(135deg, ${slide.overlayStart}, ${slide.overlayEnd})`,
                } as React.CSSProperties;

                return (
                  <div key={slide.id} className="hero-slide-outer">
                    <div className="hero-slide" style={backgroundStyle}>
                      <div className="hero-slide-content">
                        {slide.eyebrow && (
                          <span className="hero-slide-eyebrow">{slide.eyebrow}</span>
                        )}
                        <h1>{slide.title}</h1>
                        <p>{slide.subtitle}</p>
                        {slide.ctaText && (
                          <Link className="hero-slide-button" to={slide.ctaLink}>
                            {slide.ctaText}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </Slider>
          </div>
        </section>
        <div className="first-carousel">
          <h2>{user ? "Picks for You" : "Recent Uploads"}</h2>
          <Carousel items={picksCarouselItems} />
        </div>
        <div className="Second-carousel">
          <h2>{user ? "Your Recent Categories" : "Popular Items"}</h2>
          <Carousel items={recentCategoriesCarouselItems} />
        </div>
        {user && watchListItems.length > 0 && (
          <div className="Liked items">
            <h2>Saved Items</h2>
            <Carousel items={watchListItems} />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;

