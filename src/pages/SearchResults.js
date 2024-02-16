import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const SearchResults = () => {
  const [products, setProducts] = useState([]);
  const query = useQuery().get("query");

  useEffect(() => {
    const fetchProducts = async () => {
      const url = "https://searchebayitems-4f2wbghdla-uc.a.run.app";
      try {
        const response = await axios.post(url, { query });
        setProducts(response.data.itemSummaries); // Make sure this matches the structure of your response
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    fetchProducts();
  }, [query]);

  return (
    <div>
      <h2>Search Results</h2>
      <h3>{query}</h3>
      <div>
        {products.length > 0 ? (
          products.map((product, index) => (
            <div key={index}>
              <img src={product.image.imageUrl} alt={product.title} />
              <div>{product.title}</div>
              <div>
                {product.price.value} {product.price.currency}
              </div>
            </div>
          ))
        ) : (
          <div>No results found</div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
