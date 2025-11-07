import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { db } from "../firebase-config";
import { collection, getDocs, query, where, Query } from "firebase/firestore";

interface SearchResult {
  id: string;
  [key: string]: unknown;
}

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  results: SearchResult[];
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = (): SearchContextType => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within SearchProvider");
  }
  return context;
};

interface SearchProviderProps {
  children: React.ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    const fetchItems = async () => {
      if (!searchQuery) {
        setResults([]);
        return;
      }

      let q: Query;
      if (searchQuery === "ours") {
        q = query(collection(db, "items"));
      } else {
        q = query(collection(db, "items"), where("title", "==", searchQuery));
      }

      try {
        const querySnapshot = await getDocs(q);
        const items: SearchResult[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setResults(items);
      } catch (error) {
        console.error("Error fetching items:", error);
        setResults([]);
      }
    };

    fetchItems();
  }, [searchQuery]);

  const contextValue = useMemo(
    () => ({ searchQuery, setSearchQuery, results }),
    [searchQuery, results]
  );

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  );
};

export default SearchProvider;
