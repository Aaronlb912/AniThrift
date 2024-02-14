import React, { useState, useEffect } from "react";
import axios from "axios";

const SearchResults = ({ query }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!query) return;

    const fetchProducts = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/search`, {
          params: { query },
        });
        setProducts(response.data.itemSummaries);
      } catch (error) {
        console.error("Error fetching search results:", error);
        console.log(error);
      }
    };

    fetchProducts();
  }, [query]);

  return (
    <div>
      <h2>Search Results</h2>
      <div>
        {products.map((product, index) => (
          <div key={index}>
            <img src={product.image.imageUrl} alt={product.title} />
            <div>{product.title}</div>
            <div>
              {product.price.value} {product.price.currency}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;
