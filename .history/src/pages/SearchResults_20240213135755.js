import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../css/search.css";
import axios from "axios";

// Assuming these are your categories and subcategories
const categories = [
  {
    name: "Anime & Videos",
    subcategories: ["DVDs", "Blu-Rays", "Digital"],
  },
  {
    name: "Manga & Novels",
    subcategories: ["Manga", "Light Novels", "Art Books"],
  },
  // Add more categories as needed
];

const oauthToken =
  "v^1.1#i^1#f^0#I^3#r^0#p^1#t^H4sIAAAAAAAAAOVYa2wURRzv9UUIAg0iIGJyrq9A3b3Zvb3buw13cm1BDml7cEcpjaTsY7Ydbm/3ujvb9hIDtWBjggrGGPWDgjEaTcSYYAyK1WgERL8AqfiIYuShYELEhISqMTi3V0pbCRR6iU28L3sz83/+5v+YGdBTOXVR3/K+i9M9U0p39YCeUo+HnQamVlZUzygrnV9RAkYQeHb13NNT3lt2ZrEtZfSsuBraWdOwobc7oxu26E5GKMcyRFOykS0aUgbaIlbEZKx+pcgxQMxaJjYVU6e88boIpfFCKMAJ4ZAWDABFUsmscVlmyoxQgioLQGX9khRmA3JAIeu27cC4YWPJwBGKAxxPA45m2RTHif6AyPMMCAstlLcJWjYyDULCACrqmiu6vNYIW69tqmTb0MJECBWNx5YlG2PxuqUNqcW+EbKiQzgksYQde/So1lSht0nSHXhtNbZLLSYdRYG2TfmiBQ2jhYqxy8bchPku1GFVCIKQJgB/kA3xEBQFymWmlZHwte3IzyCV1lxSERoY4dz1ECVoyBuhgodGDUREvM6b/6xyJB1pCFoRamlNbF0skaCiMQPhdgtp9PCfZE0zDQRNARoMCzT0ayFV4dQhRQVpQzCP0VRrGirKg2Z7G0xcA4nVcCw23AhsCFGj0WjFNJy3aJiOSwEwjKG/Jb+phV10cLuR31eYIUB43eH1d2CYG2MLyQ6GwxLGLrgQRSgpm0UqNXbRjcWh8Om2I1Q7xlnR5+vq6mK6/Ixptfk4AFhfc/3KpNIOMxJFaPO5XqBH12egkeuKAgmnjUScyxJbukmsEgOMNirKs4GAEBjCfbRZ0bGz/5oY4bNvdEYUK0NYWYWQ1wROE4SwAkPFyJDoUJD68nZAWcrRGclKQ5zVJQXSCokzJwMtpBJxGucPaZBWg2GN5sOaRssBNUizGoQAQllWwqH/U6KMN9STULEgLkqsFy3Om2O+pnUtIekhra4u1l29NKc1dasNWiK5Kt0Bag2Q4auzHSFfoolfExlvNlzV+VodEWRSRH8xAMjnevFAWG7aGKoTci+pmFmYMHWk5CbXBvstNSFZOFfj5Mg4CXWdfCbkaiybjRenYhfNyRssFjfnd/E61X/Upa7qlZ0P3MnlVZ7fJgKkLGJIH8rneo5RzIzPlMghJD/d6lrtHUN4VSKf7OSYNgfamFiiknPguJkQKeYMaWnq+FkKDZM4MX4WcslQHQXflCK3MzMETdTWju0b0tk9EVBkR0+Pn0WFkj6hEEXkqjGpApR4WnAZqYU7AuP6zdidCmNB23Qscj1iGvNH5pSZhgY5gGDL1HVoNbETLr2ZjIMlWYeTrQYXoRYhkuuewUl2QmIFIATDIMzzE/JNcc8/rZOtgxS7c97ATcg3+l0mWuL+2F5PP+j1vF/q8QAB0Gw1WFhZtqa87BbKJrWHsSVDlc1uBkkaQ8qeIWHHgkwa5rISskorPei7AWVwxIvQrvVg3vCb0NQydtqIByKw4MpKBTtz7nSOBxzLcpw/wPMt4O4rq+XsnPLZx969NG/+1tf/2N773sUTyp7OHzInnwTTh4k8nooSEr4lvbWlK17tDR/f+Mw7rdyOubMHjhzeNGOtEtuWPv6SRbd++/nR0+GOe9d/tG3visSg8kVb58PBD8Wuw38uOr69L4J37+ckeVPkk7W7X9t49JeDA18drOrfsKPi/lv7wlv6Z5/Z7Jl/6KmL6WiyElXWy1N+OxLY8uDMNb8f6Gpp3nuh/uNU9eB9C/zC4zvFJ86VHvj+gea3U0ueT31TvvXZAdDxmdi8gbv95zc8Z78cRKhtX9XJRHyOuvPvzXe9+Nibh2aV40tlxy7EEi+gmj2z+rc+l9mwr3N/1SOL1v1056WF9a+cb9Du+FFf9tTXt51gAqtPncXnqj6IOH992uG8leh8+uVHtbVLTp0+P6/k18I2/gPGuov8qxMAAA==";

const SearchResults = () => {
  const [products, setProducts] = useState([]);
  const [perPage, setPerPage] = useState(50);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const location = useLocation();

  const getSearchQuery = () => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get("query") || "";
  };

  useEffect(() => {
    const searchQuery = getSearchQuery();
    if (!searchQuery) return;

    // Assuming "/api/search" is your backend endpoint that proxies eBay API requests
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(searchQ)}`, //prettier-ignore
          {
            headers: {
              Authorization: `Bearer ${process.env.EBAY_OAUTH_TOKEN}`,
              "Content-Type": "application/json",
            },
          }
        );
    
        res.json(response.data);
      }
        // Assuming the backend formats the eBay search results correctly
        setProducts(
          response.data.findItemsByKeywordsResponse[0].searchResult[0].item ||
            []
        );
      } catch (error) {
        console.error("Error fetching eBay search results: ", error);
      }
    };

    fetchProducts();
  }, [location, perPage, selectedCategory, selectedSubcategory]); // React to changes in these dependencies

  return (
    <div className="search-results-page">
      <aside className="filters-section">
        <h3>Categories</h3>
        {categories.map((category, index) => (
          <div key={index}>
            <strong
              onClick={() => {
                setSelectedCategory(category.name);
                setSelectedSubcategory(""); // Reset subcategory selection when a new category is selected
              }}
            >
              {category.name}
            </strong>
            {selectedCategory === category.name && (
              <ul>
                {category.subcategories.map((sub, subIndex) => (
                  <li
                    key={subIndex}
                    onClick={() => setSelectedSubcategory(sub)}
                  >
                    {sub}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </aside>
      <main className="results-section">
        <h2>
          {products.length} + results for "{getSearchQuery()}"
        </h2>
        <div className="products-grid">
          {products.map((product, index) => (
            <div key={index} className="product-card">
              {" "}
              {/* Adjusted key to index for simplicity */}
              <img src={product.galleryURL[0]} alt={product.title[0]} />
              <h3>{product.title[0]}</h3>
              <p>${product.sellingStatus[0].currentPrice[0].__value__}</p>
              <p>
                {product.shippingInfo[0].shippingType[0] === "Free"
                  ? "Free Shipping"
                  : "Shipping Cost: $" +
                    product.shippingInfo[0].shippingServiceCost[0].__value__}
              </p>
              <button>+ Add to Cart</button>
              <button>More Like This</button>
            </div>
          ))}
        </div>
        <div className="pagination">
          <label>
            Results per page:
            <select
              value={perPage}
              onChange={(e) => setPerPage(e.target.value)}
            >
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="500">500</option>
            </select>
          </label>
        </div>
      </main>
    </div>
  );
};

export default SearchResults;
