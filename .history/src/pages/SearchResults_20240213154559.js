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
//   };process.env.EBAY_OAUTH_TOKENprocess.env.EBAY_OAUTH_TOKEN}`,

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
              "X-EBAY-C-ENDUSERCTX":
                "contextualLocation=country%3DUS%2Czip%3D19406",
              Authorization: `Bearer v^1.1#i^1#p^1#r^0#I^3#f^0#t^H4sIAAAAAAAAAOVYa2wURRzv9dqSplQ+CIi1kXN5JNDs7uztXu9uwx25todcAm3xylna8NjHbLve3u6xM2vvxJiGKAHEGKMSExNAhWAwfjEBC5EaEyCRwAcMiUZUggniAytRweoXnXtQrpVAoZfYxPuyNzP/52/+j5kBgzW1S7et3PZHvWtG5b5BMFjpcnF1oLamuukBd2VDdQUoIXDtG1w4WLXV/f0yJKWMtPgERGnLRNCTSRkmEvOTIcqxTdGSkI5EU0pBJGJFjEdWrxK9DBDTtoUtxTIoT6wtRDWDoNTM+5oFnyAEhaCPzJo3ZXZZIUqVIC8HVVmCqpdXlNw6Qg6MmQhLJg5RXuAVaOClOb6LC4o+XuR9DAD+HsqTgDbSLZOQMIAK580V87x2ia13NlVCCNqYCKHCsciKeEck1hZt71rGlsgKF3GIYwk7aPyo1VKhJyEZDryzGpSnFuOOokCEKDZc0DBeqBi5acx9mF+EWlNUGPQFFS0AvEAqC5QrLDsl4TvbkZvRVVrLk4rQxDrO3g1Rgob8FFRwcdRORMTaPLnPGkcydE2HdoiKtkTWRTo7qXDE1HG/rWv02J94SzcN/JoCNBj005DXAqriVYuKCtKKME/Q1GqZqp4DDXnaLdwCidVwIjZCCTaEqMPssCMazllUQuflxjDke3KbWthFB/ebuX2FKQKEJz+8+w6McWNs67KD4ZiEiQt5iEKUlE7rKjVxMR+LxfDJoBDVj3FaZNmBgQFmgGcsu4/1AsCx3atXxZV+mCIRkknlcr1Ar9+dgdbzriiQcCJdxNk0sSVDYpUYYPZRYYHz+fy+Iu7jzQpPnP3XRInP7PiMKFeGSAHFzzf7fQEuoAmKypUjQ8LFIGVzdkBZytIpyU5CnDYkBdIKiTMnBW1dJbI0Lx/QIK02BzVaCGoaLfvUZprTIAQQyrISDPyfEmWyoR6Hig1xWWK9bHHeHWET63oC0uNaW1sk0xTNaomM2q51xtckN4NWE6SEpvTmANuZENaGJpsNt3W+1dAJMl1EfzkAyOV6+UBYaSEM1Sm5F1esNOy0DF3JTq8N5m21U7JxtsXJknEcGgb5TMnVSDodK0/FLpuT91gs7s/v8nWq/6hL3dYrlAvc6eVVjh8RAVJaZ0gfyuV6llGsFGtJ5BCSm96Yt9ozgfC2RKzsZJk+ByJMLFHJOXDSTDop5gxpaerkWQoNkzgxeRZyyVAdBd+XonxnZgiael8/RvekMzMVUGTHSE6eRYWSMaUQ1clVY1oFKPG04LKuFu4ITN5vBj2tMDZElmOT6xHTkTsyd1lJaJIDCLYtw4B2gpty6U2lHCzJBpxuNbgMtUgnue4anWYnJM4P/AGfALip+abkzz8bp1sHKXfnvIebEDv+XSZckf9xW13HwVbX0UqXC/gBzTWBJTXutVXumRQitYdBkqnKVobRJY0hZc+UsGNDJgmzaUm3K2tc+pfnldGSF6F968G8sTehWjdXV/JABBpvrVRzsx6q9wrAy/Fc0Mfzvh6w4NZqFTe3anaX69XPpW/4oWH78JaPF30Wl0aGekH9GJHLVV1Bwrdi9lvz2J/PJGf0fnooduUGO4w31Q0OeFcOC8Lp6iV/7v/2xMnXfQcbj3d+ncrG9sxuD7rxs3+roSPH5ihV3Wf9+OFrCxcfq9rgnO68+OKGYdDw5JwtoSMvXfc8tuOESF+7cvHUL2d3zdn97tXokDv6/lKtb/65xX81jLyxP9pQG7POz7/+u6fh5DPv/DRcsdN7DC3P1H31yIOyrLcsGKk/9cPSX5PR384fNZ7/kf+iSX1v5gX33L2PXrh0cGdUYK+e27N84+iNA9abs64/17b9oxNDazZ99wlOhnaPbH/lkFwHL9f55ydijQf2jKqHz3yYOPJaTSPbsuiFhrWXXkYfrN+1vffi272Xm3bsLWzjP7EI4aOrEwAA`,
              "X-EBAY-API-VERSION": "967",
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
