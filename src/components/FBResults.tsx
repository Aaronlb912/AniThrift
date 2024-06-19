import React, { useState, useEffect } from "react";
import axios from "axios";

const FBResults = () => {
  const [marketplaceData, setMarketplaceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarketplaceData = async () => {
      try {
        const response = await axios.post(
          "https://us-central1-anithrift-e77a9.cloudfunctions.net/fetchFacebookMarketplace"
        );
        setMarketplaceData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching marketplace data:", error);
        setLoading(false);
      }
    };

    fetchMarketplaceData();
  }, []);

  console.log("results", marketplaceData);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Facebook Marketplace</h1>
      {marketplaceData.length > 0 ? (
        <ul>
          {marketplaceData.map((item) => (
            <li key={item.id}>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
              <img src={item.image_url} alt={item.title} />
            </li>
          ))}
        </ul>
      ) : (
        <p>No items found.</p>
      )}
    </div>
  );
};

export default FBResults;
