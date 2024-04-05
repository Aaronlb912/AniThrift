import React, { useState, useEffect } from "react";
import { useSearch } from "./SearchHandler"; // Adjust path as needed
import "../css/EbaySearch.css";

const EbayResults: React.FC = () => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [offset, setOffset] = useState(0);
  const { searchQuery } = useSearch(); // Get the current search query
  const itemsPerPage = 12;

  // Adjust fetchResults to use the current search query
  const fetchResults = async (newOffset: number) => {
    setLoading(true);
    try {
      const functionUrl =
        "https://us-central1-anithrift-e77a9.cloudfunctions.net/searchEbayItems";

      const response = await fetch(functionUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keywords: searchQuery ? `${searchQuery} Anime` : "Anime", // Include searchQuery in the request
          offset: newOffset,
        }),
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const responseData = await response.json();
      console.log("response", responseData);

      const items = responseData.itemSummaries; // Adjust according to your response structure
      if (items) {
        setResults(items);
        setOffset(newOffset);
      } else {
        console.log("No items found in the response");
        setResults([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetchResults whenever the search query changes
  useEffect(() => {
    fetchResults(0); // Reset offset to 0 when searchQuery changes
  }, [searchQuery]);

  const handleNext = () => {
    fetchResults(offset + itemsPerPage);
  };

  const handlePrev = () => {
    const newOffset = offset - itemsPerPage < 0 ? 0 : offset - itemsPerPage;
    fetchResults(newOffset);
  };

  return (
    <div>
      {loading && <p className="loadingText">Loading...</p>}

      <div className="resultsContainer">
        {results.map((item, index) => (
          <a
            href={item.itemWebUrl}
            key={index}
            target="_blank"
            rel="noopener noreferrer"
            className="resultLink"
          >
            <div className="resultItem">
              <h3>{item.title || "No Title"}</h3>
              <p>
                {item.price && item.price.value
                  ? `${item.price.value} ${item.price.currency}`
                  : "No Price"}
              </p>
              <img
                src={
                  item.image && item.image.imageUrl ? item.image.imageUrl : ""
                }
                alt={item.title || "Item image"}
              />
            </div>
          </a>
        ))}
      </div>
      <div className="buttonsContainer">
        <button onClick={handlePrev} disabled={offset === 0}>
          Previous Items
        </button>
        <button onClick={handleNext}>Next Items</button>
      </div>
    </div>
  );
};

export default EbayResults;
