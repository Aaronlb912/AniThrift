import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebase-config";
import {
  collection,
  doc,
  getDocs,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
// Import icons from MUI or your choice of library
import DeleteIcon from "@mui/icons-material/Delete";
import { Button } from "@mui/material";
import "../css/Cart.css";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchCartItems(currentUser.uid);
      }
    });
  }, []);

  const fetchCartItems = async (userId) => {
    const cartRef = collection(db, "users", userId, "cart");
    const cartSnapshot = await getDocs(cartRef);

    // Directly map through the documents without fetching seller information again
    const items = cartSnapshot.docs.map((docSnapshot) => {
      const itemData = docSnapshot.data();
      return {
        id: docSnapshot.id,
        ...itemData,
        // Assuming sellerId and sellerName are part of the itemData
        sellerId: itemData.sellerId,
        sellerName: itemData.sellerName,
      };
    });

    // Group items by sellerId while retaining access to sellerName for display
    const groupedItems = items.reduce((acc, item) => {
      // Use sellerId as the key for grouping
      if (!acc[item.sellerId]) {
        acc[item.sellerId] = {
          sellerName: item.sellerName, // Store sellerName for easy access
          items: [], // Initialize items array
        };
      }
      acc[item.sellerId].items.push(item);
      return acc;
    }, {});

    setCartItems(groupedItems);
  };

  const removeItemFromCart = async (itemId) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "cart", itemId));
    fetchCartItems(user.uid); // Refresh cart items after deletion
  };

  return (
    <div className="cart-container">
      {Object.keys(cartItems).length ? (
        Object.entries(cartItems).map(([sellerId, { sellerName, items }]) => (
          <div key={sellerId} className="seller-box">
            <h2>Seller: {sellerName}</h2>
            {items.map((item) => (
              <div key={item.id} className="item-row">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="item-image"
                />
                <div className="item-info">
                  <p className="item-title">{item.title}</p>
                  <p className="item-price">${item.price}</p>
                </div>
                <Button
                  onClick={() => removeItemFromCart(item.id)}
                  className="remove-item-btn"
                >
                  <DeleteIcon />
                </Button>
              </div>
            ))}
            <p className="total-price">
              Total: $
              {items
                .reduce((total, item) => total + Number(item.price), 0)
                .toFixed(2)}
            </p>
            <Button variant="contained" className="checkout-btn">
              Checkout ({items.length} items)
            </Button>
          </div>
        ))
      ) : (
        <div className="empty-cart-message">
          <p>Your cart is empty.</p>
          <Button component={Link} to="/all-categories" className="explore-btn">
            Explore
          </Button>
        </div>
      )}
    </div>
  );
};

export default CartPage;
