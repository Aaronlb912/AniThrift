import React, { useEffect, useState } from "react";
import algoliasearch from "algoliasearch/lite";
import "../css/SearchFilter.css";

// Define props interface
interface FilterBarProps {
  selectedCategories: string[];
  handleCategoryChange: (category: string) => void;
  selectedColor: string[];
  handleColorChange: (color: string) => void;
  selectedCondition: string[];
  handleConditionChange: (condition: string) => void;
}

const client = algoliasearch("UDKPDLE9YO", "0eaa91b0f52cf49f20d168216adbad37");
const index = client.initIndex("items");

const FilterBar: React.FC<FilterBarProps> = ({
  selectedCategories = [], // Ensure default values if props are undefined
  handleCategoryChange,
  selectedColor = [],
  handleColorChange,
  selectedCondition = [],
  handleConditionChange,
}) => {
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);
  const [isConditionDropdownOpen, setIsConditionDropdownOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);

  useEffect(() => {
    // Fetch facet values for categories, colors, and conditions
    const fetchFacetValues = async () => {
      try {
        const categoryResponse = await index.searchForFacetValues(
          "category",
          ""
        );
        setCategories(categoryResponse.facetHits.map((facet) => facet.value));

        const colorResponse = await index.searchForFacetValues("color", "");
        setColors(colorResponse.facetHits.map((facet) => facet.value));

        const conditionResponse = await index.searchForFacetValues(
          "condition",
          ""
        );
        setConditions(conditionResponse.facetHits.map((facet) => facet.value));
      } catch (err) {
        console.error(err);
      }
    };

    fetchFacetValues();
  }, []);

  // Safeguard checks for includes
  const isCategorySelected = (category) =>
    Array.isArray(selectedCategories) && selectedCategories.includes(category);
  const isColorSelected = (color) =>
    Array.isArray(selectedColor) && selectedColor.includes(color);
  const isConditionSelected = (condition) =>
    Array.isArray(selectedCondition) && selectedCondition.includes(condition);

  return (
    <div className="filter-bar">
      {/* Category Filter */}
      <div
        className="filter-by-title"
        onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
      >
        Filter by Category
      </div>
      {isCategoryDropdownOpen && (
        <div className="dropdown">
          {categories.map((category) => (
            <div key={category} className="option">
              <input
                type="checkbox"
                id={`cat-${category}`}
                checked={isCategorySelected(category)}
                onChange={() => handleCategoryChange(category)}
              />
              <label htmlFor={`cat-${category}`}>{category}</label>
            </div>
          ))}
        </div>
      )}

      {/* Color Filter */}
      <div
        className="filter-by-title"
        onClick={() => setIsColorDropdownOpen(!isColorDropdownOpen)}
      >
        Filter by Color
      </div>
      {isColorDropdownOpen && (
        <div className="dropdown">
          {colors.map((color) => (
            <div key={color} className="option">
              <input
                type="checkbox"
                id={`col-${color}`}
                checked={isColorSelected(color)}
                onChange={() => handleColorChange(color)}
              />
              <label htmlFor={`col-${color}`}>{color}</label>
            </div>
          ))}
        </div>
      )}

      {/* Condition Filter */}
      <div
        className="filter-by-title"
        onClick={() => setIsConditionDropdownOpen(!isConditionDropdownOpen)}
      >
        Filter by Condition
      </div>
      {isConditionDropdownOpen && (
        <div className="dropdown">
          {conditions.map((condition) => (
            <div key={condition} className="option">
              <input
                type="checkbox"
                id={`cond-${condition}`}
                checked={isConditionSelected(condition)}
                onChange={() => handleConditionChange(condition)}
              />
              <label htmlFor={`cond-${condition}`}>{condition}</label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterBar;
