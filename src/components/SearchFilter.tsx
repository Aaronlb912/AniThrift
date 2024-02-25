// FilterBar.tsx
import React from "react";
import "../css/SearchFilter.css";

interface FilterBarProps {
  selectedCategories: string[];
  handleCategoryChange: (category: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  selectedCategories,
  handleCategoryChange,
}) => {
  return (
    <div className="filter-bar">
      <h2>Filter by Category</h2>
      <div className="category-dropdown">
        {[
          "Anime & Videos",
          "Manga & Novels",
          "Merchandise",
          "Figures & Trinkets",
          "Apparel",
          "Audio",
          "Games",
          "All Categories",
        ].map((category) => (
          <div key={category} className="category-option">
            <input
              type="checkbox"
              id={category}
              checked={selectedCategories.includes(category)}
              onChange={() => handleCategoryChange(category)}
            />
            <label htmlFor={category}>{category}</label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilterBar;
