import React, { useState, useEffect } from "react";
import axios from "axios";

const MalSearch = ({ onItemSelected }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState({
    anime: [],
    manga: [],
    characters: [],
  });
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadResults = async () => {
      if (!searchTerm.trim()) {
        setResults({ anime: [], manga: [], characters: [] });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const requests = [
          axios.get(
            `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(
              searchTerm
            )}&limit=3`
          ),
          axios.get(
            `https://api.jikan.moe/v4/manga?q=${encodeURIComponent(
              searchTerm
            )}&limit=3`
          ),
          axios.get(
            `https://api.jikan.moe/v4/characters?q=${encodeURIComponent(
              searchTerm
            )}&limit=3`
          ),
        ];

        const [animeResponse, mangaResponse, characterResponse] =
          await Promise.all(requests);

        setResults({
          anime: animeResponse.data.data,
          manga: mangaResponse.data.data,
          characters: characterResponse.data.data,
        });
      } catch (error) {
        console.error("Failed to load results:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const timerId = setTimeout(() => {
      loadResults();
    }, 1000);

    return () => clearTimeout(timerId);
  }, [searchTerm]);

  const handleItemSelect = (item) => {
    onItemSelected(item);
    setSearchTerm("");
    setIsFocused(false);
  };

  return (
    <div style={{ position: "relative" }}>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 300)}
        placeholder="Search for anime, manga, or characters..."
      />
      {isLoading && <p>Loading...</p>}
      {isFocused && (
        <div
          style={{
            position: "absolute",
            zIndex: 1,
            width: "100%",
            backgroundColor: "#FFFFFF",
            background: "solid",
            border: "1px solid black", // Corrected the border property
            borderRadius: "5px",
            padding: "10px", // Add your desired padding here
            boxSizing: "border-box", // This ensures padding does not increase the box's overall size
          }}
        >
          {/* Added background color here */}
          {["anime", "manga", "characters"].map(
            (category) =>
              results[category].length > 0 && (
                <SearchResultsList
                  key={category}
                  title={category.charAt(0).toUpperCase() + category.slice(1)}
                  items={results[category]}
                  onItemSelected={handleItemSelect}
                />
              )
          )}
        </div>
      )}
    </div>
  );
};

const SearchResultsList = ({ title, items, onItemSelected }) => {
  return (
    <div>
      <h3 style={{ margin: "10px 0" }}>{title}</h3>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {items.map((item) => (
          <li
            key={item.mal_id}
            style={{
              padding: "10px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
            onMouseDown={() => onItemSelected(item)}
          >
            <img
              src={item.images?.jpg?.image_url || item.image_url}
              alt={item.title || item.name}
              style={{
                width: "50px",
                marginRight: "10px",
                borderRadius: "4px",
              }}
            />
            <div>
              <span>{item.title || item.name}</span>
              <span
                style={{ marginLeft: "10px", color: "#888", display: "block" }}
              ></span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MalSearch;
