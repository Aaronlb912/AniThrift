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
  itemId?: string;
  imageUrl: string;
  title: string;
  price: number;
  sellerId: string;
  sellerName: string;
  quantity: number;
  shippingSummary?: {
    payer: string;
    weightTierId: string;
    serviceId: string;
  };
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

    // Fetch full item data including shipping info
    const items = await Promise.all(
      cartSnapshot.docs.map(async (docSnapshot) => {
        const itemData = docSnapshot.data();
        
        // Fetch full item data if we have itemId
        if (itemData.itemId) {
          try {
            const itemDoc = await getDoc(doc(db, "items", itemData.itemId));
            if (itemDoc.exists()) {
              const fullItemData = itemDoc.data();
              return {
                id: docSnapshot.id,
                itemId: itemData.itemId,
                ...itemData,
                sellerId: itemData.sellerId,
                sellerName: itemData.sellerName,
                shippingSummary: fullItemData.shippingSummary || itemData.shippingSummary || null,
              };
            }
          } catch (error) {
            console.error("Error fetching item data:", error);
          }
        }
        
        return {
          id: docSnapshot.id,
          ...itemData,
          sellerId: itemData.sellerId,
          sellerName: itemData.sellerName,
          shippingSummary: itemData.shippingSummary || null,
        };
      })
    );

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

  const handleCheckout = (sellerId?: string) => {
    if (sellerId) {
      // Checkout specific seller's items only
      const sellerItems = cartItems[sellerId]?.items || [];
      navigate("/checkout", { state: { cartItems: sellerItems } });
    } else {
      // Checkout all items from all sellers
      const allItems = Object.values(cartItems).flatMap((group) => group.items);
      navigate("/checkout", { state: { cartItems: allItems } });
    }
  };

  const calculateTotal = () => {
    const allItems = Object.values(cartItems).flatMap((group) => group.items);
    return allItems.reduce(
      (total, item) => total + (Number(item.price) * Number(item.quantity)),
      0
    );
  };

  const getTotalItems = () => {
    return Object.values(cartItems).reduce(
      (total, group) => total + group.items.length,
      0
    );
  };

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1 className="cart-title">Shopping Cart</h1>
        {Object.keys(cartItems).length > 0 && (
          <p className="cart-subtitle">
            {getTotalItems()} {getTotalItems() === 1 ? "item" : "items"}
          </p>
        )}
      </div>

      {Object.keys(cartItems).length ? (
        <>
          <div className="cart-content">
            {Object.entries(cartItems).map(([sellerId, { sellerName, items }]) => (
              <div key={sellerId} className="seller-group">
                <div className="seller-header">
                  <h2 className="seller-name">{sellerName}</h2>
                </div>
                <div className="items-list">
                  {items.map((item) => (
                    <div key={item.id} className="cart-item-card">
                      <Link
                        to={`/item/${item.itemId}`}
                        className="item-link"
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="item-image"
                        />
                      </Link>
                      <div className="item-details">
                        <Link
                          to={`/item/${item.itemId}`}
                          className="item-link"
                        >
                          <h3 className="item-title">{item.title}</h3>
                        </Link>
                        <div className="item-meta">
                          <span className="item-price">${Number(item.price).toFixed(2)}</span>
                          <span className="item-quantity">Qty: {item.quantity}</span>
                          <span className="item-subtotal">
                            ${(Number(item.price) * Number(item.quantity)).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => removeItemFromCart(item.id)}
                        className="remove-item-btn"
                        aria-label="Remove item"
                      >
                        <DeleteIcon />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="seller-total">
                  <div className="seller-total-info">
                    <span className="seller-total-label">Seller Total:</span>
                    <span className="seller-total-amount">
                      $
                      {items
                        .reduce(
                          (total, item) => total + (Number(item.price) * Number(item.quantity)),
                          0
                        )
                        .toFixed(2)}
                    </span>
                  </div>
                  <Button
                    variant="contained"
                    className="seller-checkout-btn"
                    onClick={() => handleCheckout(sellerId)}
                  >
                    Checkout {sellerName}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h2 className="empty-cart-title">Your cart is empty</h2>
          <p className="empty-cart-message">
            Start shopping to add items to your cart
          </p>
          <Button
            component={Link}
            to="/search"
            variant="contained"
            className="explore-btn"
          >
            Start Shopping
          </Button>
        </div>
      )}
    </div>
  );
};

export default CartPage;
