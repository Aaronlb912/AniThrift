import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import "../css/search.css";

const SearchResult = () => {
  const [products, setProducts] = useState([]);
  const [perPage, setPerPage] = useState(50);
  const location = useLocation();

  // Function to parse the search query from the URL
  const getSearchQuery = () => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get("query") || ""; // Default to an empty string if no query is found
  };

  useEffect(() => {
    const searchQuery = getSearchQuery(); // Retrieve the search query from the URL

    const fetchProducts = async () => {
      // Replace `/api/search` with your actual endpoint
      const response = await fetch(
        `/api/search?query=${encodeURIComponent(
          searchQuery
        )}&perPage=${perPage}`
      );
      const data = await response.json();
      setProducts(
        data.findItemsByKeywordsResponse[0].searchResult[0].item || []
      );
    };

    if (searchQuery) {
      // Only fetch products if there is a search query
      fetchProducts();
    }
  }, [location, perPage]); // Depend on location to re-fetch when the query changes

  return (
    <div className="search-results-page">
      <aside className="filters-section">
        {/* Filter section goes here */}
      </aside>
      <main className="results-section">
        <h2>
          {products.length}+ for "{getSearchQuery()}"
        </h2>
        <div className="products-grid">
          {products.map((product, index) => (
            <div key={index} className="product-card"> {/* Adjusted key to index for simplicity */}
              <img src={product.galleryURL[0]} alt={product.title[0]} />
              <h3>{product.title[0]}</h3>
              <p>${product.sellingStatus[0].currentPrice[0].__value__}</p>
              <p>
                {product.shippingInfo[0].shippingType[0] === "Free"
                  ? "Free Shipping"
                  : "Shipping Cost: $" +
                    product.shippingInfo[0].shippingServiceCost[0].__value__}
              </p>
              <button>+ Add to Cart</button>
              <button>More Like This</button>
            </div>
          ))}
        </div>
        <div className="pagination">
          <label>
            Results per page:
            <select
              value={perPage}
              onChange={(e) => setPerPage(e.target.value)}
            >
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="500">500</option>
            </select>
          </label>
        </div>
      </main>
    </div>
  );
};

export default SearchResult;
