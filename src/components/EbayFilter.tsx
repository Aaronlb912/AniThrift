import React, { useState, useEffect } from "react";
import "../css/EbayFilter.css";

interface EbayFilterProps {
  filters: {
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
  };
  onFilterChange: (filters: {
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
  }) => void;
  maxPriceLimit?: number; // Maximum price limit for the slider
}

const EbayFilter: React.FC<EbayFilterProps> = ({ filters, onFilterChange, maxPriceLimit = 1000 }) => {
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());
  const [localFilters, setLocalFilters] = useState(filters);

  // Update local filters when prop changes
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const toggleDropdown = (filterName: string) => {
    setOpenDropdowns((current) => {
      const newSet = new Set(current);
      if (newSet.has(filterName)) {
        newSet.delete(filterName);
      } else {
        newSet.add(filterName);
      }
      return newSet;
    });
  };

  const handlePriceChange = (type: "min" | "max", value: string) => {
    const numValue = value === "" ? undefined : parseFloat(value);
    const newFilters = {
      ...localFilters,
      [type === "min" ? "minPrice" : "maxPrice"]: numValue,
    };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSortChange = (sortBy: string) => {
    const newFilters = {
      ...localFilters,
      sortBy: sortBy === "none" ? undefined : sortBy,
    };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      minPrice: undefined,
      maxPrice: undefined,
      sortBy: undefined,
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <div className="ebay-filter-bar">
      <h3>Filter Results</h3>
      
      {/* Price Range Filter */}
      <div className="filter-section">
        <div
          className="filter-by-title"
          onClick={() => toggleDropdown("price")}
        >
          Filter by Price
        </div>
          {openDropdowns.has("price") && (
            <div className="dropdown">
              <div className="price-inputs">
                <div className="price-input-group">
                  <label>Min Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={localFilters.minPrice || ""}
                    onChange={(e) => handlePriceChange("min", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="price-input-group">
                  <label>Max Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={localFilters.maxPrice || ""}
                    onChange={(e) => handlePriceChange("max", e.target.value)}
                    placeholder="No limit"
                  />
                </div>
              </div>
            </div>
          )}
      </div>

      {/* Sort Options */}
      <div className="filter-section">
        <div
          className="filter-by-title"
          onClick={() => toggleDropdown("sort")}
        >
          Sort By
        </div>
        {openDropdowns.has("sort") && (
          <div className="dropdown">
            <div className="option">
              <input
                type="radio"
                id="sort-none"
                name="sort"
                checked={!localFilters.sortBy || localFilters.sortBy === "none"}
                onChange={() => handleSortChange("none")}
              />
              <label htmlFor="sort-none">Default</label>
            </div>
            <div className="option">
              <input
                type="radio"
                id="sort-price-low"
                name="sort"
                checked={localFilters.sortBy === "price-low"}
                onChange={() => handleSortChange("price-low")}
              />
              <label htmlFor="sort-price-low">Price: Low to High</label>
            </div>
            <div className="option">
              <input
                type="radio"
                id="sort-price-high"
                name="sort"
                checked={localFilters.sortBy === "price-high"}
                onChange={() => handleSortChange("price-high")}
              />
              <label htmlFor="sort-price-high">Price: High to Low</label>
            </div>
          </div>
        )}
      </div>

      {/* Clear Filters Button */}
      {(localFilters.minPrice || localFilters.maxPrice || localFilters.sortBy) && (
        <button className="clear-filters-btn" onClick={clearFilters}>
          Clear All Filters
        </button>
      )}
    </div>
  );
};

export default EbayFilter;

