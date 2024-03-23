import React, { useEffect, useState } from "react";
import { db } from "../firebase-config"; // Make sure this path is correct for your setup
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "../css/ArchivedOrders.css";

const YourArchivedPage = () => {
  const [archives, setArchives] = useState([]);
  const auth = getAuth();
  const navigate = useNavigate();

  const formatDate = (date) => {
    return date
      ? new Date(date.seconds * 1000).toLocaleDateString("en-US")
      : "";
  };

  const archiveOrder = async (orderId) => {
    const user = auth.currentUser;
    if (!user) {
      console.error("User not logged in");
      return;
    }

    try {
      // Reference to the existing order document
      const archiveRef = doc(db, "users", user.uid, "archive", orderId);

      // Get the current order data
      const archiveSnap = await getDoc(archiveRef);
      if (!archiveSnap.exists()) {
        console.error("Order does not exist");
        return;
      }
      const archiveData = archiveSnap.data();

      // Reference to the new location in the archive subcollection
      const unarchiveRef = doc(db, "users", user.uid, "orders", orderId);

      // Create a new document in the archive with the order data
      await setDoc(unarchiveRef, archiveData);

      // Delete the original order document
      await deleteDoc(archiveRef);

      console.log("Order archived", orderId);

      window.location.reload();
    } catch (error) {
      console.error("Error archiving order:", error);
    }
  };

  useEffect(() => {
    const fetchArchivesAndItems = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const archivesRef = collection(db, "users", user.uid, "archive");
      const archivesSnapshot = await getDocs(archivesRef);
      const archivesWithItems = [];

      for (const archiveDoc of archivesSnapshot.docs) {
        const archiveData = archiveDoc.data();
        const itemsDetails = await Promise.all(
          archiveData.cartItems.map(async (cartItem) => {
            const itemDocRef = doc(db, "items", cartItem.itemId);
            const itemSnapshot = await getDoc(itemDocRef);
            // Include itemId in the object spread
            return itemSnapshot.exists()
              ? {
                  ...itemSnapshot.data(),
                  itemId: cartItem.itemId,
                  quantity: cartItem.quantity,
                }
              : null;
          })
        );

        archivesWithItems.push({
          id: archiveDoc.id,
          items: itemsDetails.filter((item) => item !== null),
          ...archiveData, // Spread additional order data such as date and total price
        });
      }

      setArchives(archivesWithItems);
    };

    fetchArchivesAndItems();
  }, [auth.currentUser]); // Re-fetch when currentUser changes

  return (
    <div className="your-orders-page">
      <h1>Your Archived Orders</h1>
      {archives.map((order) => (
        <div key={order.id} className="order-card">
          <div className="order-top">
            <div className="order-info">
              <div className="order-placed">
                <div>
                  <p>ORDER PLACED</p>
                  <p className="order-date">{formatDate(order.date)}</p>
                </div>
              </div>
              <div>
                <p>TOTAL</p>
                <p className="order-total-amount">${order.total}</p>
              </div>
            </div>
            <div>
              <p>Order</p>
              <p className="order-number">${order.id}</p>
            </div>
          </div>
          <div className="order-middle">
            {order.items.map((item, index) => (
              <div key={index} className="item">
                <img
                  src={item.photos[0]}
                  alt={item.title}
                  className="item-image"
                />
                <div className="item-details">
                  <p className="item-title">{item.title}</p>
                  <button onClick={() => navigate(`/item/${item.itemId}`)}>
                    View item
                  </button>
                </div>
                <div className="item-actions">
                  <button>Message seller</button>
                  <button>Write a review</button>
                </div>
              </div>
            ))}
          </div>
          <div className="order-bottom">
            <a href="#" onClick={() => archiveOrder(order.id)}>
              Unarchive order
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default YourArchivedPage;
