import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../firebase-config";
import {
  collection,
  doc,
  getDocs,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import DeleteIcon from "@mui/icons-material/Delete";
import { Button } from "@mui/material";
import "../css/Cart.css";

interface CartItem {
  id: string;
  imageUrl: string;
  title: string;
  price: number;
  sellerId: string;
  sellerName: string;
}

interface GroupedCartItems {
  [key: string]: {
    sellerName: string;
    items: CartItem[];
  };
}

const CartPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<GroupedCartItems>({});
  const [user, setUser] = useState<firebase.User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchCartItems(currentUser.uid);
      }
    });
  }, []);

  const fetchCartItems = async (userId: string) => {
    const cartRef = collection(db, "users", userId, "cart");
    const cartSnapshot = await getDocs(cartRef);

    const items = cartSnapshot.docs.map((docSnapshot) => {
      const itemData = docSnapshot.data();
      return {
        id: docSnapshot.id,
        ...itemData,
        sellerId: itemData.sellerId,
        sellerName: itemData.sellerName,
      };
    });

    const groupedItems = items.reduce((acc, item) => {
      if (!acc[item.sellerId]) {
        acc[item.sellerId] = {
          sellerName: item.sellerName,
          items: [],
        };
      }
      acc[item.sellerId].items.push(item as any);
      return acc;
    }, {} as GroupedCartItems);

    setCartItems(groupedItems);
  };

  const removeItemFromCart = async (itemId: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "cart", itemId));
    fetchCartItems(user.uid);
  };

  const handleCheckout = () => {
    const allItems = Object.values(cartItems).flatMap((group) => group.items);
    navigate("/checkout", { state: { cartItems: allItems } });
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
            <Button
              variant="contained"
              className="checkout-btn"
              onClick={handleCheckout} // Updated to use the new handleCheckout function
            >
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
