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

const oauthToken = process.env.EBAY_OAUTH_TOKEN;

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
              Authorization: `Bearer ${oauthToken}`,
              "Content-Type": "application/json",
              
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
