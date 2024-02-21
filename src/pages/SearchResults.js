import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Import useLocation to access query params
import { useSearch } from "../components/SearchHandler"; // Adjust the import path as necessary
import "../css/search.css"; // CSS file for styling

const SearchResults = () => {
  const { searchQuery, setSearchQuery, results } = useSearch();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get("query") || queryParams.get("source"); // 'query' for specific searches, 'source' for general 'ours'

    if (query && query !== searchQuery) {
      setSearchQuery(query); // Update search context with the new query
    }
  }, [location.search, searchQuery, setSearchQuery]);

  // Handler to navigate to the item's info page
  const handleItemClick = (itemId) => {
    navigate(`/item/${itemId}`); // Assuming the path to your item info page looks like this
  };

  return (
    <div className="search-results-container">
      {results.length > 0 ? (
        results.map((item) => (
          <div
            key={item.id}
            className="search-result-item"
            onClick={() => navigate(`/item/${item.id}`)}
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
  );
};

export default SearchResults;
