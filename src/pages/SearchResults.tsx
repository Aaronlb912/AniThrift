import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../firebase-config";
import { collection, getDocs, query, where } from "firebase/firestore";
import FilterBar from "../components/SearchFilter";
import "../css/search.css";

// SearchResult type for Firebase items
interface SearchResult {
  id: string;
  photos: string[];
  title: string;
  price: number;
  [key: string]: unknown;
}

const SearchResults: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("query") || ""; // Extract 'query' parameter from URL

  const [allItems, setAllItems] = useState<SearchResult[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedFacets, setSelectedFacets] = useState<{
    [key: string]: string[];
  }>({});
  const [priceRange, setPriceRange] = useState<{
    min?: number;
    max?: number;
  }>({});
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12;

  // Adjust handleFacetChange to match the expected signature from FilterBar
  const handleFacetChange = (updatedFacets: { [key: string]: string[] }) => {
    setSelectedFacets(updatedFacets);
  };

  useEffect(() => {
    const fetchItems = async () => {
      try {
        // Start with base query for items with listingStatus "selling"
        let q = query(
          collection(db, "items"),
          where("listingStatus", "==", "selling")
        );

        // Apply filters from selectedFacets if any
        // Note: Firestore has limitations on multiple where clauses
        // For now, we'll filter client-side for facets
        
        const querySnapshot = await getDocs(q);
        let items: SearchResult[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as SearchResult[];

        // Filter by search query (case-insensitive search in title, description, tags, etc.)
        if (searchQuery.trim()) {
          const queryLower = searchQuery.toLowerCase();
          items = items.filter((item) => {
            const title = (item.title || "").toLowerCase();
            const description = (item.description || "").toLowerCase();
            const category = (item.category || "").toLowerCase();
            const tags = Array.isArray(item.tags) 
              ? item.tags.map((tag: string) => tag.toLowerCase()).join(" ")
              : "";
            const animeTags = Array.isArray(item.animeTags)
              ? item.animeTags.map((tag: string) => tag.toLowerCase()).join(" ")
              : "";
            
            return (
              title.includes(queryLower) ||
              description.includes(queryLower) ||
              category.includes(queryLower) ||
              tags.includes(queryLower) ||
              animeTags.includes(queryLower)
            );
          });
        }

        // Apply price range filter
        if (priceRange.min !== undefined || priceRange.max !== undefined) {
          items = items.filter((item) => {
            const itemPrice = typeof item.price === 'number' ? item.price : parseFloat(String(item.price || 0));
            if (priceRange.min !== undefined && itemPrice < priceRange.min) {
              return false;
            }
            if (priceRange.max !== undefined && itemPrice > priceRange.max) {
              return false;
            }
            return true;
          });
        }

        // Apply facet filters client-side
        if (Object.keys(selectedFacets).length > 0) {
          items = items.filter((item) => {
            return Object.entries(selectedFacets).every(([facet, values]) => {
              if (values.length === 0) return true;
              
              const itemValue = item[facet];
              
              // Handle array fields (tags, animeTags)
              if (Array.isArray(itemValue)) {
                // For arrays, check if any of the selected values exist in the array
                return values.some((val) => 
                  itemValue.some((itemVal: string) => 
                    String(itemVal).toLowerCase() === String(val).toLowerCase()
                  )
                );
              }
              
              // Handle string fields (category, condition)
              if (typeof itemValue === 'string') {
                return values.some((val) => 
                  itemValue.toLowerCase() === String(val).toLowerCase()
                );
              }
              
              // Fallback for other types
              return values.includes(String(itemValue));
            });
          });
        }

        // Store all items and paginate
        setAllItems(items);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedItems = items.slice(startIndex, endIndex);
        
        setSearchResults(paginatedItems);
      } catch (error) {
        console.error("Error fetching items from Firebase:", error);
        setSearchResults([]);
      }
    };

    fetchItems();
  }, [searchQuery, selectedFacets, priceRange, currentPage]);
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedFacets, priceRange]);

  const handleItemClick = (itemId: string) => {
    navigate(`/item/${itemId}`);
  };

  return (
    <div className="search-page-container">
      <h1>AniThrift Results</h1>
      <div className="Results">
        <FilterBar
          selectedFacets={selectedFacets}
          handleFacetChange={handleFacetChange}
          priceRange={priceRange}
          onPriceRangeChange={setPriceRange}
        />
        <div className="search-results-container">
          {searchResults.length > 0 ? (
            searchResults.map((item) => (
              <div
                key={item.id}
                className="search-result-item"
                onClick={() => handleItemClick(item.id)}
              >
                <div className="item-image-wrapper">
                  <img
                    src={Array.isArray(item.photos) && item.photos.length > 0 
                      ? item.photos[0] 
                      : "placeholder-image-url"}
                    alt={item.title || "Item"}
                    className="item-image"
                  />
                </div>
                <div className="item-info">
                  <div className="item-title">{item.title || "Untitled"}</div>
                  <div className="item-price">${typeof item.price === 'number' ? item.price.toFixed(2) : item.price || "0.00"}</div>
                </div>
              </div>
            ))
          ) : (
            <div>No results found.</div>
          )}
        </div>
        {/* Pagination Controls */}
        {allItems.length > itemsPerPage && (
          <div className="pagination-controls" style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '10px', 
            marginTop: '20px',
            padding: '20px'
          }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '10px 16px',
                border: '2px solid var(--primary-color)',
                borderRadius: '12px',
                backgroundColor: currentPage === 1 ? 'var(--secondary-dark)' : 'var(--secondary-light)',
                color: currentPage === 1 ? '#999' : 'var(--primary-color)',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 600
              }}
            >
              Previous
            </button>
            <span style={{ 
              padding: '0 15px',
              fontFamily: 'Nunito, sans-serif',
              color: '#333'
            }}>
              Page {currentPage} of {Math.ceil(allItems.length / itemsPerPage)}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(Math.ceil(allItems.length / itemsPerPage), prev + 1))}
              disabled={currentPage >= Math.ceil(allItems.length / itemsPerPage)}
              style={{
                padding: '10px 16px',
                border: '2px solid var(--primary-color)',
                borderRadius: '12px',
                backgroundColor: currentPage >= Math.ceil(allItems.length / itemsPerPage) ? 'var(--secondary-dark)' : 'var(--secondary-light)',
                color: currentPage >= Math.ceil(allItems.length / itemsPerPage) ? '#999' : 'var(--primary-color)',
                cursor: currentPage >= Math.ceil(allItems.length / itemsPerPage) ? 'not-allowed' : 'pointer',
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 600
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
