import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase-config";
import { doc, getDoc } from "firebase/firestore";
import "../css/ItemInfo.css"; // Ensure your CSS file path is correct

const ItemInfo = () => {
  let { id } = useParams(); // This ID is now expected to be the global item ID
  const [item, setItem] = useState(null);
  const [seller, setSeller] = useState(null);

  useEffect(() => {
    const fetchItemAndSeller = async () => {
      // Fetch the item from the global 'items' collection
      const itemRef = doc(db, "items", id);
      const itemSnap = await getDoc(itemRef);

      if (itemSnap.exists()) {
        const itemData = itemSnap.data();
        setItem(itemData);

        // Fetch the seller's information using sellerId from the item
        if (itemData.sellerId) {
          const sellerRef = doc(db, "users", itemData.sellerId);
          console.log(sellerRef);
          const sellerSnap = await getDoc(sellerRef);

          if (sellerSnap.exists()) {
            // Here you might want to include only the necessary seller info
            // Adjust according to your user document structure
            setSeller({
              name: sellerSnap.data().username, // Assuming 'name' field exists
              rating: sellerSnap.data().rating, // Assuming 'rating' field exists
            });
          } else {
            console.log("Seller document does not exist");
            setSeller(null);
          }
        }
      } else {
        console.log("Item document does not exist");
      }
    };

    fetchItemAndSeller();
  }, [id]);

  if (!item) return <div>Loading...</div>;

  return (
    <div className="item-info-container">
      <div className="item-images">
        {item.photos &&
          item.photos.map((photo, index) => (
            <img
              key={index}
              src={photo}
              alt={`Item ${index}`}
              className="item-image"
            />
          ))}
      </div>
      <div className="item-details">
        <h2>{item.title}</h2>
        <p>{item.description}</p>
        <p>Category: {item.category}</p>
        <p>Condition: {item.condition}</p>
        <p>Price: ${item.price}</p>
        <button>Add to Watchlist</button>
        <button>Add to Cart</button>
      </div>
      {seller && (
        <div className="seller-info">
          <h3>Seller: {seller.name}</h3>
          <p>Rating: {seller.rating}</p>
        </div>
      )}
    </div>
  );
};

export default ItemInfo;
