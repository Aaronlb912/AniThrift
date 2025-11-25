import React, { useEffect, useState, useCallback } from "react";
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

const YourArchivedPage = () => {
  const [archives, setArchives] = useState([]);
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
  const [existingRatings, setExistingRatings] = useState<Record<string, number>>({});
  const [existingReviews, setExistingReviews] = useState<Record<string, string>>({});
  const auth = getAuth();
  const navigate = useNavigate();

  const formatDate = (date: any) => {
    return date
      ? new Date(date.seconds * 1000).toLocaleDateString("en-US")
      : "";
  };

  // Check if user has already rated a seller
  const checkExistingRating = useCallback(async (sellerId: string): Promise<{ rating: number; review: string }> => {
    const user = auth.currentUser;
    if (!user || !sellerId) return { rating: 0, review: "" };

    try {
      const ratingsRef = collection(db, "users", sellerId, "ratings");
      const q = query(ratingsRef, where("raterId", "==", user.uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const ratingData = querySnapshot.docs[0].data();
        return {
          rating: ratingData.rating || 0,
          review: ratingData.review || "",
        };
      }
      return { rating: 0, review: "" };
    } catch (error) {
      console.error("Error checking existing rating:", error);
      return { rating: 0, review: "" };
    }
  }, [auth.currentUser]);

  // Calculate and update seller's average rating
  const updateSellerRating = async (sellerId: string) => {
    try {
      const ratingsRef = collection(db, "users", sellerId, "ratings");
      const ratingsSnapshot = await getDocs(ratingsRef);

      if (ratingsSnapshot.empty) {
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
  const handleRateSeller = async (rating: number, review?: string) => {
    const user = auth.currentUser;
    if (!user || !ratingDialog.sellerId) return;

    try {
      // Check if user has already rated this seller
      const existingRatingData = await checkExistingRating(ratingDialog.sellerId);
      if (existingRatingData.rating > 0) {
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
        review: review || "",
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
      const ratingsMap: Record<string, number> = {};
      const reviewsMap: Record<string, string> = {};

      for (const archiveDoc of archivesSnapshot.docs) {
        const archiveData = archiveDoc.data();
        const itemsDetails = await Promise.all(
          archiveData.cartItems.map(async (cartItem: { itemId: string; quantity: number }) => {
            const itemDocRef = doc(db, "items", cartItem.itemId);
            const itemSnapshot = await getDoc(itemDocRef);
            
            if (itemSnapshot.exists()) {
              const itemData = itemSnapshot.data();
              // Check if user has already rated this seller
              if (itemData.sellerId) {
                const ratingData = await checkExistingRating(itemData.sellerId);
                if (ratingData.rating > 0) {
                  ratingsMap[itemData.sellerId] = ratingData.rating;
                  if (ratingData.review) {
                    reviewsMap[itemData.sellerId] = ratingData.review;
                  }
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

        const sellersMap: Record<string, { sellerName: string; total: number; items: any[] }> = {};
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

        archivesWithItems.push({
          id: archiveDoc.id,
          items: validItems,
          sellers: sellersMap,
          computedTotal: orderTotal,
          ...archiveData,
        });
      }

      setExistingRatings(ratingsMap);
      setExistingReviews(reviewsMap);
      const sortedArchives = archivesWithItems.sort((a, b) => {
        const aTime = a.date?.seconds || 0;
        const bTime = b.date?.seconds || 0;
        return bTime - aTime;
      });
      setArchives(sortedArchives);
    };

    fetchArchivesAndItems();
  }, [auth.currentUser, checkExistingRating]); // Re-fetch when currentUser changes

  return (
    <div className="your-orders-page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1>Your Archived Orders</h1>
        <Link
          to="/orders"
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
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 71, 171, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--primary-color)";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          View Active Orders
        </Link>
      </div>
      {archives.map((order) => (
        <div key={order.id} className="order-card">
          <div className="order-top">
            <div className="order-info">
              <div className="order-info-item">
                <span className="order-info-label">Order Placed</span>
                <span className="order-info-value">
                  {formatDate(order.date)}
                </span>
              </div>
              <div className="order-info-divider"></div>
              <div className="order-info-item">
                <span className="order-info-label">Order #</span>
                <span className="order-info-value order-id">{order.id}</span>
              </div>
              <div className="order-info-divider"></div>
              <div className="order-info-item order-total-item">
                <span className="order-info-label">Total</span>
                <span className="order-info-value order-total-amount">
                  $
                  {order.computedTotal?.toFixed?.(2) ||
                    parseFloat(String(order.total || 0)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          {order.sellers && (
            <div className="order-sellers-summary">
              {Object.entries(order.sellers).map(([sellerId, summary]) => (
                <div key={sellerId} className="seller-summary-card">
                  <div className="seller-summary-header">
                    <span className="seller-name">{summary.sellerName}</span>
                    <span className="seller-total">${summary.total.toFixed(2)}</span>
                  </div>
                  <ul className="seller-items-list">
                    {summary.items.map((item, idx) => (
                      <li key={`${item.itemId}-${idx}`}>
                        <span className="item-name">{item.title}</span>
                        <span className="item-quantity">Qty: {item.quantity || 1}</span>
                        <span className="item-price">${parseFloat(item.price || 0).toFixed(2)}</span>
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
                  src={item.photos?.[0] || ""}
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
                            state: { redirectTo: `/messages/${item.sellerId}` },
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
                        const sellerDoc = await getDoc(doc(db, "users", item.sellerId));
                        const sellerName = sellerDoc.exists()
                          ? sellerDoc.data().username || "Seller"
                          : "Seller";

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
                      {existingRatings[item.sellerId] ? "View Rating" : "Rate Seller"}
                    </button>
                  )}
                </div>
              </li>
              ))}
            </ul>
          </div>
          <div className="order-bottom">
            <button
              type="button"
              onClick={() => archiveOrder(order.id)}
              style={{
                background: "none",
                border: "none",
                color: "inherit",
                textDecoration: "underline",
                cursor: "pointer",
                padding: 0,
                font: "inherit",
              }}
            >
              Unarchive order
            </button>
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
        existingReview={
          ratingDialog.sellerId
            ? existingReviews[ratingDialog.sellerId] || ""
            : ""
        }
      />
    </div>
  );
};

export default YourArchivedPage;
