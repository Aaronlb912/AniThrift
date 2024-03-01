import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import algoliasearch from "algoliasearch/lite";
import FilterBar from "../components/SearchFilter";
import "../css/search.css";

const client = algoliasearch("UDKPDLE9YO", "0eaa91b0f52cf49f20d168216adbad37");

// Assuming SearchResult type is defined somewhere
interface SearchResult {
  objectID: string;
  photos: string[];
  title: string;
  price: number;
}

const SearchResults: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedFacets, setSelectedFacets] = useState<{
    [key: string]: string[];
  }>({});
  const navigate = useNavigate();

  // Adjust handleFacetChange to match the expected signature from FilterBar
  const handleFacetChange = (updatedFacets: { [key: string]: string[] }) => {
    setSelectedFacets(updatedFacets);
  };

  useEffect(() => {
    const index = client.initIndex("items");

    // Construct the Algolia filter string correctly
    const filters = Object.entries(selectedFacets)
      .flatMap(
        ([facet, values]) => values.map((value) => `${facet}:"${value}"`) // Ensure values are quoted
      )
      .join(" OR ");

    index
      .search(searchQuery, { filters })
      .then(({ hits }) => {
        setSearchResults(hits as SearchResult[]);
      })
      .catch((err) => console.error(err));
  }, [searchQuery, selectedFacets]);

  const handleItemClick = (itemId: string) => {
    navigate(`/item/${itemId}`);
  };

  return (
    <div className="search-page-container">
      <FilterBar
        selectedFacets={selectedFacets}
        handleFacetChange={handleFacetChange}
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
