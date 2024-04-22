import React, { useState, useEffect } from "react";
import { useSearch } from "./SearchHandler"; // Adjust path as needed
import "../css/EbaySearch.css";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";

const EbayResults: React.FC = () => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [bigOffset, setBigOffset] = useState(0); // Offset for chunks of 120 items
  const [smallOffset, setSmallOffset] = useState(0); // Offset for viewing 12 items within the 120
  const { searchQuery } = useSearch(); // Get the current search query
  const itemsPerPage = 12;
  const largeItemsPerPage = 120;

  const fetchResults = async (offset: number) => {
    setLoading(true);
    try {
      const functionUrl =
        "https://us-central1-anithrift-e77a9.cloudfunctions.net/searchEbayItems";
      const response = await fetch(functionUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keywords: searchQuery ? `${searchQuery} Anime` : "Anime",
          offset: offset,
        }),
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const responseData = await response.json();
      const items = responseData.itemSummaries; // Adjust according to your response structure
      if (items) {
        const groupedResults = groupResultsInPages(items);
        setResults(groupedResults);
        setBigOffset(offset);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const groupResultsInPages = (items) => {
    const grouped = [];
    while (items.length) {
      grouped.push(items.splice(0, itemsPerPage)); // Create pages of 12 items
    }
    return grouped;
  };

  // Trigger initial fetch and re-fetch whenever the search query changes or the large offset changes
  useEffect(() => {
    fetchResults(bigOffset);
  }, [searchQuery, bigOffset]);

  const handleNextSmall = async () => {
    if (smallOffset + 1 >= results.length) {
      await handleNextLarge(); // Load the next 120 items
    } else {
      setSmallOffset((prev) => prev + 1);
    }
  };

  const handlePrevSmall = async () => {
    if (smallOffset === 0) {
      if (bigOffset > 0) {
        await handlePrevLarge(); // Load the previous 120 items
        setSmallOffset(results.length - 1); // Go to the last page of the new chunk
      }
    } else {
      setSmallOffset((prev) => prev - 1);
    }
  };

  const handleNextLarge = async () => {
    const newOffset = bigOffset + largeItemsPerPage;
    await fetchResults(newOffset);
    setSmallOffset(0); // Reset smallOffset when moving to a new large chunk
  };

  const handlePrevLarge = async () => {
    if (bigOffset > 0) {
      const newOffset = Math.max(0, bigOffset - largeItemsPerPage);
      await fetchResults(newOffset);
      setSmallOffset(0); // Reset smallOffset when moving to a previous large chunk
    }
  };

  return (
    <div>
      {loading && (
        <div className="loadingOverlay" style={{ display: "flex" }}>
          Loading...
        </div>
      )}
      <div className="resultsContainer">
        {results[smallOffset]?.map((item, index) => (
          <a
            key={index}
            href={item.itemWebUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="resultLink"
          >
            <div className="resultItem">
              <h3>{item.title || "No Title"}</h3>
              <p>
                {item.price
                  ? `${item.price.value} ${item.price.currency}`
                  : "No Price"}
              </p>
              <img
                src={item.image ? item.image.imageUrl : ""}
                alt={item.title || "Item image"}
              />
            </div>
          </a>
        ))}
      </div>
      <div className="buttonsContainer">
        <button onClick={handlePrevLarge} disabled={bigOffset === 0}>
          <KeyboardDoubleArrowLeftIcon />
        </button>
        <button
          onClick={handlePrevSmall}
          disabled={smallOffset === 0 && bigOffset === 0}
        >
          <KeyboardArrowLeftIcon />
        </button>
        {Array.from({ length: 10 }).map((_, index) => {
          const pageNum = index + 1 + (bigOffset / largeItemsPerPage) * 10;
          return (
            <button
              key={index}
              onClick={() => setSmallOffset(index)}
              disabled={index >= results.length}
              className={smallOffset === index ? "selectedPage" : ""}
            >
              {pageNum}
            </button>
          );
        })}
        <button onClick={handleNextSmall}>
          <KeyboardArrowRightIcon />
        </button>
        <button onClick={handleNextLarge}>
          <KeyboardDoubleArrowRightIcon />
        </button>
      </div>
    </div>
  );
};

export default EbayResults;
