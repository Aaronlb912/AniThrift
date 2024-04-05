import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import algoliasearch from "algoliasearch/lite";
import FilterBar from "../components/SearchFilter";
import EbayResults from "../components/EbayResults";
import "../css/search.css";

const client = algoliasearch("UDKPDLE9YO", "0eaa91b0f52cf49f20d168216adbad37");
const index = client.initIndex("items");

// Assuming SearchResult type is defined somewhere
interface SearchResult {
  objectID: string;
  photos: string[];
  title: string;
  price: number;
}

const SearchResults: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("query") || ""; // Extract 'query' parameter from URL

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedFacets, setSelectedFacets] = useState<{
    [key: string]: string[];
  }>({});

  // Adjust handleFacetChange to match the expected signature from FilterBar
  const handleFacetChange = (updatedFacets: { [key: string]: string[] }) => {
    setSelectedFacets(updatedFacets);
  };

  useEffect(() => {
    const defaultFilter = 'listingStatus:"selling"';
    const dynamicFilters = Object.entries(selectedFacets)
      .flatMap(([facet, values]) =>
        values.map((value) => `${facet}:"${value}"`)
      )
      .join(" OR ");

    const combinedFilters = `${defaultFilter} ${
      dynamicFilters ? "AND (" + dynamicFilters + ")" : ""
    }`;

    index
      .search(searchQuery, { filters: combinedFilters })
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
      <h1>AniThrift Results</h1>
      <div className="Results">
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
                <div className="item-title">{item.title}</div>
                <div className="item-price">${item.price}</div>
                <img
                  src={item.photos[0] || "placeholder-image-url"}
                  alt={item.title}
                  className="item-image"
                />
              </div>
            ))
          ) : (
            <div>No results found.</div>
          )}
        </div>
      </div>
      <h1>Ebay Results</h1>
      <div className="Results">
        <EbayResults searchQuery={searchQuery} />
      </div>
      <h1>FaceBook MarketPlace Results</h1>
      <div className="Results"></div>
    </div>
  );
};

export default SearchResults;
