import React from "react";
import { useNavigate } from "react-router-dom";
import { useSearch } from "../components/SearchHandler";
import "../css/infoPages.css"; // Make sure the path matches your file structure

const AllCategoriesPage = () => {
  const navigate = useNavigate();
  const categories = [
    "Anime & Videos",
    "Manga & Novels",
    "Merchandise",
    "Figures & Trinkets",
    "Apparel",
    "Audio",
    "Games",
    // Add more categories as needed
  ];

  const handleFetchAll = () => {
    // Directly navigate to the search results page with a query param
    navigate("/search?source=ours");
  };

  const handleNavigateToCategory = (category) => {
    navigate(`/search?category=${encodeURIComponent(category)}`);
  };

  return (
    <div className="all-categories-container">
      <h1>All Categories</h1>
      <div className="banner">
        <h2>Explore all that AniThrift has to offer</h2>
        <p>A world of anime and manga awaits you</p>
        <button onClick={() => navigate("/search?query=all")}>
          Shop Now →
        </button>
      </div>
      <h2>Shop from our database</h2>
      <div className="categories-container">
        {categories.map((category, index) => (
          <div key={index} className="category-block">
            <img
              src="data:image/png;base64,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"
              alt={category}
            />
            {/* Placeholder image */}
            <p>{category}</p>
          </div>
        ))}
      </div>
      <button onClick={handleFetchAll} className="shop-all-button">
        Shop All From Our Database →
      </button>
      <h2>Shop from Ebay's database</h2>
      <div className="categories-container">
        {categories.map((category, index) => (
          <div key={index} className="category-block">
            <img
              src="data:image/png;base64,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"
              alt={category}
            />
            {/* Placeholder image */}
            <p>{category}</p>
          </div>
        ))}
      </div>
      <button onClick={() => navigate("/search?database=ours")}>
        Shop All From Ebay's Database →
      </button>
      <h2>Shop from Facebook's database</h2>
      <div className="categories-container">
        {categories.map((category, index) => (
          <div key={index} className="category-block">
            <img
              src="data:image/png;base64,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"
              alt={category}
            />
            {/* Placeholder image */}
            <p>{category}</p>
          </div>
        ))}
      </div>
      <button onClick={() => navigate("/search?database=ours")}>
        Shop All From Facebook's Database →
      </button>
      {/* Repeat the above block for eBay and Facebook Marketplace categories */}

      <div className="shop-all">
        <h2>Shop All</h2>
      </div>
      <button onClick={() => navigate("/search?query=combined")}>
        Shop All →
      </button>
    </div>
  );
};

export default AllCategoriesPage;
