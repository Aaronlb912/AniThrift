import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useSearch } from "./SearchHandler"; // Adjust path as needed
import EbayFilter from "./EbayFilter";
import "../css/EbaySearch.css";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";

interface EbayResultsProps {
  searchQuery?: string; // Optional prop to pass search query directly
}

interface EbayFilters {
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
}

const EbayResults: React.FC<EbayResultsProps> = ({ searchQuery: propSearchQuery }) => {
  const [allResults, setAllResults] = useState<any[]>([]); // Store all fetched results
  const [results, setResults] = useState<any[]>([]); // Filtered and paginated results
  const [loading, setLoading] = useState<boolean>(false);
  const [bigOffset, setBigOffset] = useState(0); // Offset for chunks of 120 items
  const [smallOffset, setSmallOffset] = useState(0); // Offset for viewing 12 items within the 120
  const [filters, setFilters] = useState<EbayFilters>({});
  const [maxPrice, setMaxPrice] = useState(1000); // Default max price
  const location = useLocation();
  
  // Call hooks unconditionally at the top level (required by React Hooks rules)
  const queryParams = new URLSearchParams(location.search);
  const urlSearchQuery = queryParams.get("query") || "";
  
  // Get search query from context - must be called unconditionally
  // Component should be within SearchProvider, so this should work
  const { searchQuery: contextSearchQuery = "" } = useSearch();
  
  // Use prop first, then URL, then context, then default
  const searchQuery = propSearchQuery || urlSearchQuery || contextSearchQuery || "";
  
  const itemsPerPage = 12;
  const largeItemsPerPage = 120;

  const fetchResults = async (offset: number) => {
    setLoading(true);
    try {
      const functionUrl =
        "https://us-central1-anithrift-e77a9.cloudfunctions.net/searchEbayItems";
      
      // Build keywords - use search query if available, otherwise default to "Anime"
      const keywords = searchQuery && searchQuery.trim() 
        ? `${searchQuery.trim()} Anime` 
        : "Anime";
      
      const response = await fetch(functionUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keywords: keywords,
          offset: offset,
        }),
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      const items = responseData.itemSummaries || responseData.items || []; // Handle different response structures
      
      if (items && Array.isArray(items) && items.length > 0) {
        setAllResults(items); // Store all items for filtering
        
        // Calculate max price from items
        let highestPrice = 0;
        items.forEach((item: any) => {
          const itemPrice = item.price?.value ? parseFloat(item.price.value) : 0;
          if (itemPrice > highestPrice) {
            highestPrice = itemPrice;
          }
        });
        
        // Round up the highest price
        let roundedMax = 1000; // Default
        if (highestPrice > 0) {
          if (highestPrice < 50) {
            roundedMax = Math.ceil(highestPrice / 10) * 10; // Round to nearest 10
          } else if (highestPrice < 500) {
            roundedMax = Math.ceil(highestPrice / 50) * 50; // Round to nearest 50
          } else {
            roundedMax = Math.ceil(highestPrice / 100) * 100; // Round to nearest 100
          }
          // Ensure minimum of 100
          roundedMax = Math.max(roundedMax, 100);
        }
        setMaxPrice(roundedMax);
        
        setBigOffset(offset);
      } else {
        setAllResults([]);
      }
    } catch (error) {
      console.error("Error fetching eBay data:", error);
      setResults([]); // Set empty results on error
    } finally {
      setLoading(false);
    }
  };

  const groupResultsInPages = (items: any[]) => {
    const grouped: any[][] = [];
    const itemsCopy = [...items]; // Create a copy to avoid mutating the original
    while (itemsCopy.length) {
      grouped.push(itemsCopy.splice(0, itemsPerPage)); // Create pages of 12 items
    }
    return grouped;
  };

  // Filter and sort results based on filters
  const filteredResults = useMemo(() => {
    let filtered = [...allResults];

    // Apply price filters
    if (filters.minPrice !== undefined) {
      filtered = filtered.filter((item) => {
        const price = item.price?.value ? parseFloat(item.price.value) : 0;
        return price >= filters.minPrice!;
      });
    }

    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter((item) => {
        const price = item.price?.value ? parseFloat(item.price.value) : 0;
        return price <= filters.maxPrice!;
      });
    }

    // Apply sorting
    if (filters.sortBy === "price-low") {
      filtered.sort((a, b) => {
        const priceA = a.price?.value ? parseFloat(a.price.value) : 0;
        const priceB = b.price?.value ? parseFloat(b.price.value) : 0;
        return priceA - priceB;
      });
    } else if (filters.sortBy === "price-high") {
      filtered.sort((a, b) => {
        const priceA = a.price?.value ? parseFloat(a.price.value) : 0;
        const priceB = b.price?.value ? parseFloat(b.price.value) : 0;
        return priceB - priceA;
      });
    }

    return filtered;
  }, [allResults, filters]);

  // Group filtered results into pages
  useEffect(() => {
    if (filteredResults.length > 0) {
      const grouped = groupResultsInPages(filteredResults);
      setResults(grouped);
      // Reset to first page when filters change
      if (smallOffset >= grouped.length) {
        setSmallOffset(0);
      }
    } else {
      setResults([]);
      setSmallOffset(0);
    }
  }, [filteredResults]);

  // Reset offsets when search query changes
  useEffect(() => {
    setBigOffset(0);
    setSmallOffset(0);
    setAllResults([]);
    setResults([]);
  }, [searchQuery]);

  // Trigger initial fetch and re-fetch whenever the search query changes or the large offset changes
  useEffect(() => {
    if (searchQuery !== undefined) {
      fetchResults(bigOffset);
    }
  }, [searchQuery, bigOffset]);

  const handleNextSmall = async () => {
    if (smallOffset + 1 >= results.length) {
      await handleNextLarge(); // Load the next 120 items
    } else {
      setSmallOffset((prev) => prev + 1);
    }
  };

  const handlePrevSmall = async () => {
    if (smallOffset === 0) {
      if (bigOffset > 0) {
        await handlePrevLarge(); // Load the previous 120 items
        setSmallOffset(results.length - 1); // Go to the last page of the new chunk
      }
    } else {
      setSmallOffset((prev) => prev - 1);
    }
  };

  const handleNextLarge = async () => {
    const newOffset = bigOffset + largeItemsPerPage;
    await fetchResults(newOffset);
    setSmallOffset(0); // Reset smallOffset when moving to a new large chunk
  };

  const handlePrevLarge = async () => {
    if (bigOffset > 0) {
      const newOffset = Math.max(0, bigOffset - largeItemsPerPage);
      await fetchResults(newOffset);
      setSmallOffset(0); // Reset smallOffset when moving to a previous large chunk
    }
  };

  const handleFilterChange = (newFilters: EbayFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="ebay-results-wrapper">
      <EbayFilter filters={filters} onFilterChange={handleFilterChange} maxPriceLimit={maxPrice} />
      <div className="ebay-results-content">
        {loading && (
          <div className="loadingOverlay" style={{ display: "flex" }}>
            Loading...
          </div>
        )}
        <div className="resultsContainer">
        {results[smallOffset]?.map((item, index) => (
          <a
            key={index}
            href={item.itemWebUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="resultLink"
          >
            <div className="resultItem">
              <h3>{item.title || "No Title"}</h3>
              <p>
                {item.price
                  ? `${item.price.value} ${item.price.currency}`
                  : "No Price"}
              </p>
              <img
                src={item.image ? item.image.imageUrl : ""}
                alt={item.title || "Item image"}
              />
            </div>
          </a>
        ))}
      </div>
      <div className="buttonsContainer">
        <button onClick={handlePrevLarge} disabled={bigOffset === 0}>
          <KeyboardDoubleArrowLeftIcon />
        </button>
        <button
          onClick={handlePrevSmall}
          disabled={smallOffset === 0 && bigOffset === 0}
        >
          <KeyboardArrowLeftIcon />
        </button>
        {Array.from({ length: 10 }).map((_, index) => {
          const pageNum = index + 1 + (bigOffset / largeItemsPerPage) * 10;
          return (
            <button
              key={index}
              onClick={() => setSmallOffset(index)}
              disabled={index >= results.length}
              className={smallOffset === index ? "selectedPage" : ""}
            >
              {pageNum}
            </button>
          );
        })}
        <button onClick={handleNextSmall}>
          <KeyboardArrowRightIcon />
        </button>
        <button onClick={handleNextLarge}>
          <KeyboardDoubleArrowRightIcon />
        </button>
      </div>
      </div>
    </div>
  );
};

export default EbayResults;
