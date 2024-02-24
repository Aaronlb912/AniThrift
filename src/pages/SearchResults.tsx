import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useLocation to access query params
import { useSearch } from "../components/SearchHandler"; // Adjust the import path as necessary
import { Link } from "@mui/icons-material";
import "../css/search.css"; // CSS file for styling
import algoliasearch, { SearchIndex } from "algoliasearch";

const client = algoliasearch("UDKPDLE9YO", "0eaa91b0f52cf49f20d168216adbad37");

interface SearchResult {
  objectID: string;
  photos: string[];
  title: string;
  price: number;
}

interface SearchHookResult {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  results: SearchResult[]; // Adjust the type as necessary
}

const SearchResults: React.FC = () => {
  const { searchQuery, setSearchQuery, results } = useSearch() as SearchHookResult;
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const index: SearchIndex = client.initIndex("items");

    index
      .search(searchQuery)
      .then(({ hits }: { hits: SearchResult[] }) => {
        if (hits) {
          setSearchResults(hits);
        } else {
          setSearchResults([]);
        }
      })
      .catch((err: Error) => console.log('err', err));
  }, [searchQuery]);

  // Handler to navigate to the item's info page
  const handleItemClick = (itemId: string) => {
    navigate(`/item/${itemId}`); // Assuming the path to your item info page looks like this
  };

  return (
    <div className="search-results-container">
      {searchResults && searchResults.length > 0 ? (
        searchResults.map((item: SearchResult) => (
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
  );
};

export default SearchResults;
