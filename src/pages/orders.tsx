import React, { useEffect, useState } from "react";
import { db } from "../firebase-config"; // Make sure this path is correct for your setup
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import "../css/orders.css";
import RatingDialog from "../components/RatingDialog";

const YourOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [ratingDialog, setRatingDialog] = useState<{
    open: boolean;
    sellerId: string | null;
    sellerName: string;
    itemName: string;
    itemId: string;
    orderId: string;
  }>({
    open: false,
    sellerId: null,
    sellerName: "",
    itemName: "",
    itemId: "",
    orderId: "",
  });
  const [existingRatings, setExistingRatings] = useState<
    Record<string, number>
  >({});
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
      const orderRef = doc(db, "users", user.uid, "orders", orderId);

      // Get the current order data
      const orderSnap = await getDoc(orderRef);
      if (!orderSnap.exists()) {
        console.error("Order does not exist");
        return;
      }
      const orderData = orderSnap.data();

      // Reference to the new location in the archive subcollection
      const archiveRef = doc(db, "users", user.uid, "archive", orderId);

      // Create a new document in the archive with the order data
      await setDoc(archiveRef, orderData);

      // Delete the original order document
      await deleteDoc(orderRef);

      console.log("Order archived", orderId);

      window.location.reload();
    } catch (error) {
      console.error("Error archiving order:", error);
    }
  };

  // Check if user has already rated a seller
  const checkExistingRating = async (sellerId: string) => {
    const user = auth.currentUser;
    if (!user || !sellerId) return 0;

    try {
      const ratingsRef = collection(db, "users", sellerId, "ratings");
      const q = query(ratingsRef, where("raterId", "==", user.uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const ratingData = querySnapshot.docs[0].data();
        return ratingData.rating || 0;
      }
      return 0;
    } catch (error) {
      console.error("Error checking existing rating:", error);
      return 0;
    }
  };

  // Calculate and update seller's average rating
  const updateSellerRating = async (sellerId: string) => {
    try {
      const ratingsRef = collection(db, "users", sellerId, "ratings");
      const ratingsSnapshot = await getDocs(ratingsRef);

      if (ratingsSnapshot.empty) {
        // No ratings yet, set to 0
        await updateDoc(doc(db, "users", sellerId), {
          rating: 0,
          totalRatings: 0,
        });
        return;
      }

      let totalRating = 0;
      let count = 0;

      ratingsSnapshot.forEach((doc) => {
        const data = doc.data();
        totalRating += data.rating || 0;
        count++;
      });

      const averageRating = count > 0 ? totalRating / count : 0;

      await updateDoc(doc(db, "users", sellerId), {
        rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        totalRatings: count,
      });
    } catch (error) {
      console.error("Error updating seller rating:", error);
    }
  };

  // Handle rating submission
  const handleRateSeller = async (rating: number) => {
    const user = auth.currentUser;
    if (!user || !ratingDialog.sellerId) return;

    try {
      // Check if user has already rated this seller
      const existingRating = await checkExistingRating(ratingDialog.sellerId);
      if (existingRating > 0) {
        alert("You have already rated this seller.");
        return;
      }

      // Get seller's username
      const sellerDoc = await getDoc(doc(db, "users", ratingDialog.sellerId));
      const sellerName = sellerDoc.exists()
        ? sellerDoc.data().username || "Seller"
        : "Seller";

      // Get rater's username
      const raterDoc = await getDoc(doc(db, "users", user.uid));
      const raterName = raterDoc.exists()
        ? raterDoc.data().username || "User"
        : "User";

      // Add rating to seller's ratings subcollection
      await addDoc(collection(db, "users", ratingDialog.sellerId, "ratings"), {
        raterId: user.uid,
        raterName: raterName,
        rating: rating,
        itemId: ratingDialog.itemId,
        itemName: ratingDialog.itemName,
        orderId: ratingDialog.orderId,
        timestamp: serverTimestamp(),
      });

      // Update seller's average rating
      await updateSellerRating(ratingDialog.sellerId);

      // Update existing ratings state
      setExistingRatings((prev) => ({
        ...prev,
        [`${ratingDialog.sellerId}`]: rating,
      }));

      alert("Thank you for your rating!");
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert("Error submitting rating. Please try again.");
    }
  };

  useEffect(() => {
    const fetchOrdersAndItems = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const ordersRef = collection(db, "users", user.uid, "orders");
      const ordersSnapshot = await getDocs(ordersRef);
      const ordersWithItems = [];
      const ratingsMap: Record<string, number> = {};

      for (const orderDoc of ordersSnapshot.docs) {
        const orderData = orderDoc.data();
        const itemsDetails = await Promise.all(
          orderData.cartItems.map(async (cartItem) => {
            const itemDocRef = doc(db, "items", cartItem.itemId);
            const itemSnapshot = await getDoc(itemDocRef);

            if (itemSnapshot.exists()) {
              const itemData = itemSnapshot.data();
              // Check if user has already rated this seller
              if (itemData.sellerId) {
                const rating = await checkExistingRating(itemData.sellerId);
                if (rating > 0) {
                  ratingsMap[itemData.sellerId] = rating;
                }
              }

              return {
                ...itemData,
                itemId: cartItem.itemId,
                quantity: cartItem.quantity,
              };
            }
            return null;
          })
        );

        const validItems = itemsDetails.filter((item) => item !== null);
        const orderTotal = validItems.reduce((sum, item) => {
          const price = parseFloat(item.price || "0");
          const quantity = item.quantity || 1;
          return sum + price * quantity;
        }, 0);

        const sellersMap: Record<
          string,
          { sellerName: string; total: number; items: any[] }
        > = {};
        validItems.forEach((item) => {
          const sellerKey = item.sellerId || "unknown";
          const sellerName = item.sellerName || "Seller";
          if (!sellersMap[sellerKey]) {
            sellersMap[sellerKey] = { sellerName, total: 0, items: [] };
          }
          const price = parseFloat(item.price || "0");
          const quantity = item.quantity || 1;
          sellersMap[sellerKey].total += price * quantity;
          sellersMap[sellerKey].items.push(item);
        });

        ordersWithItems.push({
          id: orderDoc.id,
          items: validItems,
          sellers: sellersMap,
          computedTotal: orderTotal,
          ...orderData,
        });
      }

      setExistingRatings(ratingsMap);
      const sortedOrders = ordersWithItems.sort((a, b) => {
        const aTime = a.date?.seconds || 0;
        const bTime = b.date?.seconds || 0;
        return bTime - aTime;
      });
      setOrders(sortedOrders);
    };

    fetchOrdersAndItems();
  }, [auth.currentUser]); // Re-fetch when currentUser changes

  return (
    <div className="your-orders-page">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1>Your Orders</h1>
        <Link
          to="/archives"
          style={{
            padding: "10px 20px",
            backgroundColor: "var(--primary-color)",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
            fontWeight: "600",
            transition: "all 0.2s ease",
            border: "2px solid var(--primary-dark)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--primary-dark)";
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow =
              "0 4px 12px rgba(0, 71, 171, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--primary-color)";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          View Archived Orders
        </Link>
      </div>
      {orders.map((order) => (
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
                <p className="order-total-amount">
                  $
                  {order.computedTotal?.toFixed?.(2) ||
                    parseFloat(order.total || 0).toFixed(2)}
                </p>
              </div>
            </div>
            <div>
              <p>Order</p>
              <p className="order-number">${order.id}</p>
            </div>
          </div>
          {order.sellers && (
            <div className="order-sellers-summary">
              {Object.entries(order.sellers).map(([sellerId, summary]) => (
                <div key={sellerId} className="seller-summary-card">
                  <div className="seller-summary-header">
                    <span className="seller-name">{summary.sellerName}</span>
                    <span className="seller-total">
                      ${summary.total.toFixed(2)}
                    </span>
                  </div>
                  <ul className="seller-items-list">
                    {summary.items.map((item, idx) => (
                      <li key={`${item.itemId}-${idx}`}>
                        <span className="item-name">{item.title}</span>
                        <span className="item-quantity">
                          Qty: {item.quantity || 1}
                        </span>
                        <span className="item-price">
                          ${parseFloat(item.price || 0).toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
          <div className="order-middle">
            <ul className="seller-items-list">
              {order.items.map((item, index) => (
                <li key={index} className="item">
                  <img
                    src={item.photos[0]}
                    alt={item.title}
                    className="item-image"
                  />
                  <div className="item-details">
                    <p className="item-title">{item.title}</p>
                    <span className="item-quantity-count">
                      Quantity: {item.quantity || 1}
                    </span>
                    <button onClick={() => navigate(`/item/${item.itemId}`)}>
                      View item
                    </button>
                  </div>
                  <div className="item-actions">
                    {item.sellerId && (
                      <button
                        onClick={() => {
                          if (!auth.currentUser) {
                            navigate("/signin", {
                              state: {
                                redirectTo: `/messages/${item.sellerId}`,
                              },
                            });
                            return;
                          }
                          navigate(`/messages/${item.sellerId}`, {
                            state: {
                              itemTitle: item.title,
                              itemId: item.itemId,
                              orderId: order.id,
                            },
                          });
                        }}
                      >
                        Message seller
                      </button>
                    )}
                    {item.sellerId && (
                      <button
                        onClick={async () => {
                          // Get seller's name
                          const sellerDoc = await getDoc(
                            doc(db, "users", item.sellerId)
                          );
                          const sellerName = sellerDoc.exists()
                            ? sellerDoc.data().username || "Seller"
                            : "Seller";

                          // Check if already rated
                          const existingRating =
                            existingRatings[item.sellerId] || 0;

                          setRatingDialog({
                            open: true,
                            sellerId: item.sellerId,
                            sellerName: sellerName,
                            itemName: item.title,
                            itemId: item.itemId,
                            orderId: order.id,
                          });
                        }}
                      >
                        {existingRatings[item.sellerId]
                          ? "View Rating"
                          : "Rate Seller"}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="order-bottom">
            <a href="#" onClick={() => archiveOrder(order.id)}>
              Archive order
            </a>
          </div>
        </div>
      ))}
      <RatingDialog
        open={ratingDialog.open}
        onClose={() =>
          setRatingDialog({
            open: false,
            sellerId: null,
            sellerName: "",
            itemName: "",
            itemId: "",
            orderId: "",
          })
        }
        onRate={handleRateSeller}
        sellerName={ratingDialog.sellerName}
        itemName={ratingDialog.itemName}
        alreadyRated={
          ratingDialog.sellerId
            ? existingRatings[ratingDialog.sellerId] > 0
            : false
        }
        existingRating={
          ratingDialog.sellerId
            ? existingRatings[ratingDialog.sellerId] || 0
            : 0
        }
      />
    </div>
  );
};

export default YourOrdersPage;
