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
      // Replace this URL with your server endpoint that proxies eBay API requests
      const url = 'https://searchebayitems-4f2wbghdla-uc.a.run.app';
      const data = {
        query: query
      };
      let response = await axios.post(url, data)
        .then(response => {
          console.log('Response data:', response.data);
        })
        .catch(error => {
          console.error('Error making the request:', error.message);
        });
      setProducts(response.data.itemSummaries); // Adjust according to the actual response structure
    };

    if (query) fetchProducts();
  }, [query]);

  return (
    <div>
      <h2>Search Results</h2>
      <h3>{query}</h3>
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
