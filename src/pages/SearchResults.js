import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useLocation to access query params
import { useSearch } from "../components/SearchHandler"; // Adjust the import path as necessary
import { Link } from "@mui/icons-material";
import "../css/search.css"; // CSS file for styling
const algoliasearch = require("algoliasearch");
const client = algoliasearch("UDKPDLE9YO", "0eaa91b0f52cf49f20d168216adbad37");

const SearchResults = () => {
  const { searchQuery, setSearchQuery, results } = useSearch();
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const index = client.initIndex("items");

    index
      .search(searchQuery)
      .then(({ hits }) => {
        if (hits) {
          setSearchResults(hits);
        } else {
          setSearchResults([]);
        }
      })
      .catch((err) => console.log("err", err));
  }, [searchQuery]);

  return (
    <div className="search-results-container">
      {searchResults && searchResults.length > 0 ? (
        searchResults.map((item) => (
          <div
            key={item.objectID}
            className="search-result-item"
            onClick={() => navigate(`/item/${item.objectID}`)}
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
