import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "../firebase-config"; // Adjust this import based on your file structure
import { collection, getDocs, query, where } from "firebase/firestore";

// Create a context for the search functionality
const SearchContext = createContext();

// Custom hook to use the search context
export const useSearch = () => useContext(SearchContext);

// Component to provide search context to children
export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      let q;
      if (searchQuery === "ours") {
        q = query(collection(db, "items"));
      } else {
        q = query(collection(db, "items"), where("title", "==", searchQuery));
      }

      try {
        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setResults(items);
      } catch (error) {
        console.error("Error fetching items:", error);
        setResults([]);
      }
    };

    if (searchQuery) {
      fetchItems();
    }
  }, [searchQuery]);

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery, results }}>
      {children}
    </SearchContext.Provider>
  );
};

export default SearchProvider;
