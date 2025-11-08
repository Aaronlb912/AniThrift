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
import { useNavigate } from "react-router-dom";
import "../css/ArchivedOrders.css";
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
  const auth = getAuth();
  const navigate = useNavigate();

  const formatDate = (date: any) => {
    return date
      ? new Date(date.seconds * 1000).toLocaleDateString("en-US")
      : "";
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

      for (const archiveDoc of archivesSnapshot.docs) {
        const archiveData = archiveDoc.data();
        const itemsDetails = await Promise.all(
          archiveData.cartItems.map(async (cartItem) => {
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

        archivesWithItems.push({
          id: archiveDoc.id,
          items: itemsDetails.filter((item) => item !== null),
          ...archiveData, // Spread additional order data such as date and total price
        });
      }

      setExistingRatings(ratingsMap);

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
                  {item.sellerId && (
                    <button
                      onClick={() => {
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

export default YourArchivedPage;
