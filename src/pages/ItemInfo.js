import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase-config";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import "../css/ItemInfo.css"; // Ensure your CSS file path is correct

const ItemInfo = () => {
  let { id } = useParams(); // This ID is now expected to be the global item ID
  const [item, setItem] = useState(null);
  const [seller, setSeller] = useState(null);
  const [userId, setUserId] = useState(null); // Initialize userId state

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, set userId state
        setUserId(user.uid);
      } else {
        // User is signed out. Handle accordingly, e.g., set userId to null
        setUserId(null);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

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

  const addToWatchlist = async () => {
    if (!item || !userId) {
      console.error("No item data available or user not logged in");
      return;
    }

    const watchlistRef = collection(db, "users", userId, "watchlist");

    try {
      await addDoc(watchlistRef, {
        itemId: id,
        title: item.title,
        imageUrl: item.photos ? item.photos[0] : null, // Assuming you have photos array
        price: item.price,
        addedOn: new Date(), // Optional: track when item was added
      });

      console.log("Item added to watchlist");
    } catch (error) {
      console.error("Error adding item to watchlist: ", error);
    }
  };

  const addToCart = async () => {
    if (!item || !userId) {
      console.error("No item data available or user not logged in");
      return;
    }

    const cartRef = collection(db, "users", userId, "cart");

    try {
      await addDoc(cartRef, {
        itemId: id,
        title: item.title,
        imageUrl: item.photos ? item.photos[0] : null, // Assuming you have photos array
        price: item.price,
        addedOn: new Date(), // Optional: track when item was added
      });

      console.log("Item added to cart");
    } catch (error) {
      console.error("Error adding item to cart: ", error);
    }
  };

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
        <button onClick={addToWatchlist}>Add to Watchlist</button>
        <button onClick={addToCart}>Add to Cart</button>
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
