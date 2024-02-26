import React, { useState } from "react";
import "../css/SearchFilter.css";

interface FilterBarProps {
  selectedCategories: string[];
  handleCategoryChange: (category: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  selectedCategories,
  handleCategoryChange,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  return (
    <div className="filter-bar">
      <div className="filter-by-category-title" onClick={toggleDropdown}>
        Filter by Category{" "}
      </div>
      {isDropdownOpen && (
        <div className="category-dropdown">
          {[
            "anime",
            "Videos",
            "Manga",
            "Novels",
            "Merchandise",
            "Figures",
            "Trinkets",
            "Apparel",
            "Audio",
            "Games",
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
      )}
    </div>
  );
};

export default FilterBar;
