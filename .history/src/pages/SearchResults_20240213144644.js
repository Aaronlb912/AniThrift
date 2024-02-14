// import React, { useState, useEffect } from "react";
// import { useLocation } from "react-router-dom";
// import "../css/search.css";
// import axios from "axios";

// // Assuming these are your categories and subcategories
// const categories = [
//   {
//     name: "Anime & Videos",
//     subcategories: ["DVDs", "Blu-Rays", "Digital"],
//   },
//   {
//     name: "Manga & Novels",
//     subcategories: ["Manga", "Light Novels", "Art Books"],
//   },
//   // Add more categories as needed
// ];

// const SearchResults = () => {
//   const [products, setProducts] = useState([]);
//   const [perPage, setPerPage] = useState(50);
//   const [selectedCategory, setSelectedCategory] = useState("");
//   const [selectedSubcategory, setSelectedSubcategory] = useState("");
//   const location = useLocation();

//   const getSearchQuery = () => {
//     const searchParams = new URLSearchParams(location.search);
//     return searchParams.get("query") || "";
//   };

//   useEffect(() => {
//     const searchQuery = getSearchQuery();
//     if (!searchQuery) return;

//     // Assuming "/api/search" is your backend endpoint that proxies eBay API requests
//     const fetchProducts = async () => {
//       try {
//         const response = await axios.get(`/api/search`, {
//           params: { query: searchQuery },
//         });

//         // Assuming the backend formats the eBay search results correctly
//         setProducts(
//           response.data.findItemsByKeywordsResponse[0].searchResult[0].item ||
//             []
//         );
//       } catch (error) {
//         console.error("Error fetching eBay search results: ", error);
//       }
//     };

//     fetchProducts();
//   }, [location, perPage, selectedCategory, selectedSubcategory]); // React to changes in these dependencies

//   return (
//     <div className="search-results-page">
//       <aside className="filters-section">
//         <h3>Categories</h3>
//         {categories.map((category, index) => (
//           <div key={index}>
//             <strong
//               onClick={() => {
//                 setSelectedCategory(category.name);
//                 setSelectedSubcategory(""); // Reset subcategory selection when a new category is selected
//               }}
//             >
//               {category.name}
//             </strong>
//             {selectedCategory === category.name && (
//               <ul>
//                 {category.subcategories.map((sub, subIndex) => (
//                   <li
//                     key={subIndex}
//                     onClick={() => setSelectedSubcategory(sub)}
//                   >
//                     {sub}
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>
//         ))}
//       </aside>
//       <main className="results-section">
//         <h2>
//           {products.length} + results for "{getSearchQuery()}"
//         </h2>
//         <div className="products-grid">
//           {products.map((product, index) => (
//             <div key={index} className="product-card">
//               {" "}
//               {/* Adjusted key to index for simplicity */}
//               <img src={product.galleryURL[0]} alt={product.title[0]} />
//               <h3>{product.title[0]}</h3>
//               <p>${product.sellingStatus[0].currentPrice[0].__value__}</p>
//               <p>
//                 {product.shippingInfo[0].shippingType[0] === "Free"
//                   ? "Free Shipping"
//                   : "Shipping Cost: $" +
//                     product.shippingInfo[0].shippingServiceCost[0].__value__}
//               </p>
//               <button>+ Add to Cart</button>
//               <button>More Like This</button>
//             </div>
//           ))}
//         </div>
//         <div className="pagination">
//           <label>
//             Results per page:
//             <select
//               value={perPage}
//               onChange={(e) => setPerPage(e.target.value)}
//             >
//               <option value="20">20</option>
//               <option value="50">50</option>
//               <option value="100">100</option>
//               <option value="500">500</option>
//             </select>
//           </label>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default SearchResults;

import React, { useState, useEffect } from "react";
import axios from "axios";

const SearchResults = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Note: You need to replace 'YOUR_EBAY_OAUTH_TOKEN' with your actual eBay OAuth token.
        const response = await axios.get(
          "https://api.ebay.com/buy/browse/v1/item_summary/search?q=anime&limit=10",
          {
            headers: {
              Authorization: "Bearer v^1.1#i^1#I^3#f^0#r^0#p^3#t^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",
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
          }
        );

        // Update the state with the fetched products
        setProducts(response.data.itemSummaries);
      } catch (error) {
        console.error("Error fetching eBay search results:", error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="search-results-page">
      <h2>Search Results for "Anime"</h2>
      <div className="products-grid">
        {products.map((product, index) => (
          <div key={index} className="product-card">
            <img src={product.image.imageUrl} alt={product.title} />
            <h3>{product.title}</h3>
            <p>
              Price: {product.price.value} {product.price.currency}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;
