import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import "../css/search.css";

const SearchResult = ({ searchQuery }) => {
  const [products, setProducts] = useState([]);
  const [perPage, setPerPage] = useState(50);

  useEffect(() => {
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

    fetchProducts();
  }, [searchQuery, perPage]);

  return (
    <div className="search-results-page">
      <aside className="filters-section">
        {/* Filter section goes here */}
      </aside>
      <main className="results-section">
        <h2>
          {products.length}+ for "{searchQuery}"
        </h2>
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.itemId[0]} className="product-card">
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
