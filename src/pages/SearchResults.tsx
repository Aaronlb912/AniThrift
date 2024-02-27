import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import algoliasearch from "algoliasearch/lite";
import FilterBar from "../components/SearchFilter";
import "../css/search.css";

const client = algoliasearch("UDKPDLE9YO", "0eaa91b0f52cf49f20d168216adbad37");

interface SearchResult {
  objectID: string;
  photos: string[];
  title: string;
  price: number;
}

const SearchResults: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleCategoryChange = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];
    setSelectedCategories(newCategories);
  };

  const handleColorChange = (color: string) => {
    const newColors = selectedColors.includes(color)
      ? selectedColors.filter((c) => c !== color)
      : [...selectedColors, color];
    setSelectedColors(newColors);
  };

  const handleConditionChange = (condition: string) => {
    const newConditions = selectedConditions.includes(condition)
      ? selectedConditions.filter((c) => c !== condition)
      : [...selectedConditions, condition];
    setSelectedConditions(newConditions);
  };

  useEffect(() => {
    const index = client.initIndex("items");

    let filters = "";
    if (selectedCategories.length > 0) {
      filters += selectedCategories
        .map((category) => `category:${category}`)
        .join(" OR ");
    }
    if (selectedColors.length > 0) {
      filters +=
        (filters ? " AND " : "") +
        selectedColors.map((color) => `color:${color}`).join(" OR ");
    }
    if (selectedConditions.length > 0) {
      filters +=
        (filters ? " AND " : "") +
        selectedConditions
          .map((condition) => `condition:${condition}`)
          .join(" OR ");
    }

    index
      .search(searchQuery, { filters })
      .then(({ hits }) => {
        setSearchResults(hits as SearchResult[]);
      })
      .catch((err) => console.error(err));
  }, [searchQuery, selectedCategories, selectedColors, selectedConditions]);

  const handleItemClick = (itemId: string) => {
    navigate(`/item/${itemId}`);
  };

  return (
    <div className="search-page-container">
      <FilterBar
        selectedCategories={selectedCategories}
        handleCategoryChange={handleCategoryChange}
        selectedColors={selectedColors}
        handleColorChange={handleColorChange}
        selectedConditions={selectedConditions}
        handleConditionChange={handleConditionChange}
      />
      <div className="search-results-container">
        {searchResults.length > 0 ? (
          searchResults.map((item) => (
            <div
              key={item.objectID}
              className="search-result-item"
              onClick={() => handleItemClick(item.objectID)}
            >
              <img
                src={item.photos[0] || "placeholder-image-url"}
                alt={item.title}
                className="item-image"
              />
              <div className="item-title">{item.title}</div>
              <div className="item-price">${item.price}</div>
            </div>
          ))
        ) : (
          <div>No results found.</div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
