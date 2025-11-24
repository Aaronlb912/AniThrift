import React, { useEffect, useState } from "react";
import { db } from "../firebase-config";
import { collection, getDocs, query, where } from "firebase/firestore";
import "../css/SearchFilter.css";

interface FilterBarProps {
  selectedFacets: { [key: string]: string[] };
  handleFacetChange: (updatedFacets: { [key: string]: string[] }) => void;
  priceRange?: { min?: number; max?: number };
  onPriceRangeChange?: (range: { min?: number; max?: number }) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  selectedFacets,
  handleFacetChange,
  priceRange = { min: undefined, max: undefined },
  onPriceRangeChange,
}) => {
  const [facets, setFacets] = useState<{ [key: string]: string[] }>({});
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());
  const [tagSearchQuery, setTagSearchQuery] = useState("");
  const [animeTagSearchQuery, setAnimeTagSearchQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState(1000); // Default max price
  const [localPriceRange, setLocalPriceRange] = useState({
    min: priceRange.min !== undefined ? priceRange.min : undefined,
    max: priceRange.max !== undefined ? priceRange.max : undefined,
  });

  // Update local price range when prop changes
  useEffect(() => {
    setLocalPriceRange({
      min: priceRange.min,
      max: priceRange.max,
    });
  }, [priceRange.min, priceRange.max]);

  useEffect(() => {
    const fetchFacets = async () => {
      try {
        // Fetch all items with listingStatus "selling" from Firebase
        const q = query(
          collection(db, "items"),
          where("listingStatus", "==", "selling")
        );
        const querySnapshot = await getDocs(q);
        
        // Extract unique values for each facet field and find max price
        const facetData: { [key: string]: Set<string> } = {
          category: new Set(),
          condition: new Set(),
          tags: new Set(),
          animeTags: new Set(),
        };

        let highestPrice = 0;

        querySnapshot.docs.forEach((doc) => {
          const data = doc.data();
          
          // Track highest price
          const itemPrice = typeof data.price === 'number' ? data.price : parseFloat(String(data.price || 0));
          if (itemPrice > highestPrice) {
            highestPrice = itemPrice;
          }
          
          // Collect category values
          if (data.category) {
            facetData.category.add(data.category);
          }
          
          // Collect condition values
          if (data.condition) {
            facetData.condition.add(data.condition);
          }
          
          // Collect tags (array)
          if (Array.isArray(data.tags)) {
            data.tags.forEach((tag: string) => {
              if (tag) facetData.tags.add(tag);
            });
          }
          
          // Collect animeTags (array)
          if (Array.isArray(data.animeTags)) {
            data.animeTags.forEach((tag: string) => {
              if (tag) facetData.animeTags.add(tag);
            });
          }
        });

        // Round up the highest price to nearest 10, 50, or 100 based on value
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

        // Convert Sets to sorted arrays
        const facets: { [key: string]: string[] } = {};
        Object.keys(facetData).forEach((key) => {
          facets[key] = Array.from(facetData[key]).sort();
        });

        setFacets(facets);
      } catch (err) {
        console.error("Error fetching facets from Firebase:", err);
      }
    };

    fetchFacets();
  }, []);

  const updateFacetSelection = (facet: string, value: string) => {
    const currentSelections = selectedFacets[facet] || [];
    const isSelected = currentSelections.includes(value);
    const newSelections = isSelected
      ? currentSelections.filter((v) => v !== value)
      : [...currentSelections, value];

    handleFacetChange({
      ...selectedFacets,
      [facet]: newSelections,
    });
  };

  const isFacetSelected = (facet: string, value: string) =>
    selectedFacets[facet]?.includes(value);

  const toggleDropdown = (facetName: string) => {
    setOpenDropdowns((currentOpenDropdowns) => {
      const newOpenDropdowns = new Set(currentOpenDropdowns);
      if (newOpenDropdowns.has(facetName)) {
        newOpenDropdowns.delete(facetName);
      } else {
        newOpenDropdowns.add(facetName);
      }
      return newOpenDropdowns;
    });
  };

  const handlePriceRangeChange = (type: "min" | "max", value: string) => {
    const numValue = value === "" ? undefined : parseFloat(value);
    
    // Validate the input
    if (numValue !== undefined && (isNaN(numValue) || numValue < 0)) {
      return;
    }
    
    const newRange = {
      ...localPriceRange,
      [type]: numValue,
    };
    
    // Ensure min doesn't exceed max and vice versa
    if (type === "min" && numValue !== undefined && localPriceRange.max !== undefined && numValue > localPriceRange.max) {
      newRange.max = numValue;
    }
    if (type === "max" && numValue !== undefined && localPriceRange.min !== undefined && numValue < localPriceRange.min) {
      newRange.min = numValue;
    }
    
    setLocalPriceRange(newRange);
    
    if (onPriceRangeChange) {
      onPriceRangeChange({
        min: newRange.min,
        max: newRange.max,
      });
    }
  };

  const hasActiveFilters = () => {
    // Check if any facets are selected
    const hasSelectedFacets = Object.values(selectedFacets).some(
      (values) => values && values.length > 0
    );
    
    // Check if price range is set
    const hasPriceRange = priceRange.min !== undefined || priceRange.max !== undefined;
    
    return hasSelectedFacets || hasPriceRange;
  };

  const handleResetFilters = () => {
    // Reset all facet selections
    handleFacetChange({});
    
    // Reset price range
    setLocalPriceRange({
      min: undefined,
      max: undefined,
    });
    
    if (onPriceRangeChange) {
      onPriceRangeChange({
        min: undefined,
        max: undefined,
      });
    }
    
    // Clear search queries
    setTagSearchQuery("");
    setAnimeTagSearchQuery("");
    
    // Close all dropdowns
    setOpenDropdowns(new Set());
  };

  return (
    <div className="filter-bar">
      {/* Reset Filters Button */}
      {hasActiveFilters() && (
        <button
          type="button"
          onClick={handleResetFilters}
          className="reset-filters-button"
        >
          Reset All Filters
        </button>
      )}
      
      {/* Price Range Filter */}
      {onPriceRangeChange && (
        <div>
          <div
            className="filter-by-title"
            onClick={() => toggleDropdown("price")}
          >
            Filter by Price
          </div>
          {openDropdowns.has("price") && (
            <div className="dropdown">
              <div className="price-input-container">
                <div className="price-input-group">
                  <label htmlFor="price-min">Min Price ($)</label>
                  <input
                    type="number"
                    id="price-min"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={localPriceRange.min !== undefined ? localPriceRange.min : ""}
                    onChange={(e) => handlePriceRangeChange("min", e.target.value)}
                    className="price-input"
                  />
                </div>
                <div className="price-input-group">
                  <label htmlFor="price-max">Max Price ($)</label>
                  <input
                    type="number"
                    id="price-max"
                    min="0"
                    step="0.01"
                    placeholder={`${maxPrice}+`}
                    value={localPriceRange.max !== undefined ? localPriceRange.max : ""}
                    onChange={(e) => handlePriceRangeChange("max", e.target.value)}
                    className="price-input"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {Object.keys(facets).map((facet) => (
        <div key={facet}>
          <div
            className="filter-by-title"
            onClick={() => toggleDropdown(facet)}
          >
            Filter by {facet.charAt(0).toUpperCase() + facet.slice(1)}
          </div>
          {openDropdowns.has(facet) && (
            <div className="dropdown">
              {facet === "tags" ? (
                <>
                  <input
                    type="text"
                    placeholder="Search tags..."
                    value={tagSearchQuery}
                    onChange={(e) => setTagSearchQuery(e.target.value)}
                  />
                  {/* Only display the list if the user has started typing */}
                  {tagSearchQuery && (
                    <div className="tag-options">
                      {facets[facet]
                        .filter((value) =>
                          value
                            .toLowerCase()
                            .includes(tagSearchQuery.toLowerCase())
                        )
                        .map((value) => (
                          <div key={value} className="option">
                            <input
                              type="checkbox"
                              id={`tag-${value}`}
                              checked={isFacetSelected("tags", value)}
                              onChange={() =>
                                updateFacetSelection("tags", value)
                              }
                            />
                            <label htmlFor={`tag-${value}`}>{value}</label>
                          </div>
                        ))}
                    </div>
                  )}
                </>
              ) : facet === "animeTags" ? (
                <>
                  <input
                    type="text"
                    placeholder="Search anime tags..."
                    value={animeTagSearchQuery}
                    onChange={(e) => setAnimeTagSearchQuery(e.target.value)}
                  />
                  {animeTagSearchQuery && (
                    <div className="tag-options">
                      {facets[facet]
                        .filter((value) =>
                          value
                            .toLowerCase()
                            .includes(animeTagSearchQuery.toLowerCase())
                        )
                        .map((value) => (
                          <div key={value} className="option">
                            <input
                              type="checkbox"
                              id={`animeTag-${value}`}
                              checked={isFacetSelected("animeTags", value)}
                              onChange={() =>
                                updateFacetSelection("animeTags", value)
                              }
                            />
                            <label htmlFor={`animeTag-${value}`}>{value}</label>
                          </div>
                        ))}
                    </div>
                  )}
                </>
              ) : (
                facets[facet].map((value) => (
                  <div key={value} className="option">
                    <input
                      type="checkbox"
                      id={`${facet}-${value}`}
                      checked={isFacetSelected(facet, value)}
                      onChange={() => updateFacetSelection(facet, value)}
                    />
                    <label htmlFor={`${facet}-${value}`}>{value}</label>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FilterBar;
