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
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Divider,
  Box,
} from "@mui/material";
import "../css/orders.css";
import RatingDialog from "../components/RatingDialog";

interface OrderData {
  id: string;
  date?: any;
  items: any[];
  sellers: Record<string, { sellerName: string; total: number; items: any[] }>;
  computedTotal: number;
  createdAt?: any;
  shippingAddress?: any;
  shippingCost?: number;
  itemTotal?: number;
  totalAmount?: number;
  platformFee?: number;
  status?: string;
  stripeSessionId?: string;
}

const YourOrdersPage = () => {
  const [orders, setOrders] = useState<OrderData[]>([]);
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
  const [existingReviews, setExistingReviews] = useState<
    Record<string, string>
  >({});
  const [invoiceDialog, setInvoiceDialog] = useState<{
    open: boolean;
    order: OrderData | null;
  }>({
    open: false,
    order: null,
  });
  const auth = getAuth();
  const navigate = useNavigate();

  const formatDate = (date) => {
    return date
      ? new Date(date.seconds * 1000).toLocaleDateString("en-US")
      : "";
  };

  const archiveOrder = async (orderId: string) => {
    const user = auth.currentUser;
    if (!user) {
      console.error("User not logged in");
      alert("You must be logged in to archive orders.");
      return;
    }

    try {
      // Try to get order from user's orders subcollection first
      let orderRef = doc(db, "users", user.uid, "orders", orderId);
      let orderSnap = await getDoc(orderRef);
      let orderData = null;

      if (orderSnap.exists()) {
        orderData = orderSnap.data();
      } else {
        // If not in user's subcollection, check global orders collection
        const globalOrderRef = doc(db, "orders", orderId);
        const globalOrderSnap = await getDoc(globalOrderRef);

        if (globalOrderSnap.exists()) {
          const globalOrderData = globalOrderSnap.data();
          // Only archive if it belongs to this user
          if (globalOrderData.buyerId === user.uid) {
            orderData = globalOrderData;
            // Also create it in user's orders subcollection so we can archive it
            await setDoc(orderRef, orderData);
          }
        }
      }

      if (!orderData) {
        console.error("Order does not exist or does not belong to user");
        alert("Order not found or you don't have permission to archive it.");
        return;
      }

      // Reference to the new location in the archive subcollection
      const archiveRef = doc(db, "users", user.uid, "archive", orderId);

      // Create a new document in the archive with the order data
      await setDoc(archiveRef, orderData);

      // Delete the original order document from user's orders
      // Re-fetch to ensure we have the latest snapshot
      const finalOrderSnap = await getDoc(orderRef);
      if (finalOrderSnap.exists()) {
        await deleteDoc(orderRef);
      }

      // Also delete from global orders collection if it exists there
      const globalOrderRef = doc(db, "orders", orderId);
      const globalOrderSnap = await getDoc(globalOrderRef);
      if (
        globalOrderSnap.exists() &&
        globalOrderSnap.data().buyerId === user.uid
      ) {
        await deleteDoc(globalOrderRef);
      }

      console.log("Order archived", orderId);

      // Refresh the orders list
      window.location.reload();
    } catch (error) {
      console.error("Error archiving order:", error);
      alert("Failed to archive order. Please try again.");
    }
  };

  // Check if user has already rated a seller
  const checkExistingRating = useCallback(
    async (sellerId: string): Promise<{ rating: number; review: string }> => {
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
    },
    [auth.currentUser]
  );

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
  const handleRateSeller = async (rating: number, review?: string) => {
    const user = auth.currentUser;
    if (!user || !ratingDialog.sellerId) return;

    try {
      // Check if user has already rated this seller
      const existingRatingData = await checkExistingRating(
        ratingDialog.sellerId
      );
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

  useEffect(() => {
    const fetchOrdersAndItems = async () => {
      const user = auth.currentUser;
      if (!user) return;

      // Fetch from user's orders subcollection
      const userOrdersRef = collection(db, "users", user.uid, "orders");
      const userOrdersSnapshot = await getDocs(userOrdersRef);

      // Also fetch from global orders collection as fallback (for older orders)
      const globalOrdersRef = collection(db, "orders");
      const globalOrdersQuery = query(
        globalOrdersRef,
        where("buyerId", "==", user.uid)
      );
      const globalOrdersSnapshot = await getDocs(globalOrdersQuery);

      // Combine both sources, using user subcollection as primary
      const userOrderIds = new Set(
        userOrdersSnapshot.docs.map((doc) => doc.id)
      );
      const allOrderDocs = [
        ...userOrdersSnapshot.docs,
        ...globalOrdersSnapshot.docs.filter((doc) => !userOrderIds.has(doc.id)),
      ];

      const ordersWithItems = [];
      const ratingsMap: Record<string, number> = {};
      const reviewsMap: Record<string, string> = {};

      for (const orderDoc of allOrderDocs) {
        const orderData = orderDoc.data();

        // Only show orders that have been successfully purchased
        // Filter out cancelled or failed orders, but show pending orders with payment confirmation
        const orderStatus = orderData.status || "";
        const hasPayment = !!orderData.stripeSessionId;

        // Skip explicitly failed or cancelled orders
        if (orderStatus === "cancelled" || orderStatus === "failed") {
          continue;
        }

        // Show orders that:
        // 1. Are completed/paid (explicitly successful)
        // 2. Have a stripeSessionId (payment was processed, even if status is pending)
        //    (This handles cases where webhook hasn't fired yet but payment succeeded)
        if (
          !hasPayment &&
          orderStatus !== "completed" &&
          orderStatus !== "paid"
        ) {
          continue; // Skip orders without payment confirmation
        }

        const itemsDetails = await Promise.all(
          orderData.cartItems.map(async (cartItem) => {
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
      setExistingReviews(reviewsMap);
      const sortedOrders = ordersWithItems.sort((a, b) => {
        const aTime = a.date?.seconds || a.createdAt?.seconds || 0;
        const bTime = b.date?.seconds || b.createdAt?.seconds || 0;
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
              <div className="order-info-divider"></div>
              <div className="order-info-item">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setInvoiceDialog({ open: true, order })}
                  sx={{ mt: 1 }}
                >
                  View Invoice
                </Button>
              </div>
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
            <button
              onClick={(e) => {
                e.preventDefault();
                if (
                  window.confirm("Are you sure you want to archive this order?")
                ) {
                  archiveOrder(order.id);
                }
              }}
              style={{
                background: "none",
                border: "none",
                color: "var(--primary-color)",
                cursor: "pointer",
                textDecoration: "underline",
                padding: 0,
                fontSize: "inherit",
                fontFamily: "inherit",
              }}
            >
              Archive order
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

      {/* Invoice Dialog */}
      <Dialog
        open={invoiceDialog.open}
        onClose={() => setInvoiceDialog({ open: false, order: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Order Invoice
          </Typography>
        </DialogTitle>
        <DialogContent>
          {invoiceDialog.order && (
            <Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ color: "#666", mb: 1 }}>
                  Order ID: {invoiceDialog.order.id}
                </Typography>
                <Typography variant="body2" sx={{ color: "#666" }}>
                  Date:{" "}
                  {formatDate(
                    invoiceDialog.order.date || invoiceDialog.order.createdAt
                  )}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Shipping Address */}
              {invoiceDialog.order.shippingAddress && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold" }}>
                    Shipping Address
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
                    {(() => {
                      const addr = invoiceDialog.order.shippingAddress;
                      if (typeof addr === "string") {
                        try {
                          const parsed = JSON.parse(addr);
                          return formatInvoiceAddress(parsed);
                        } catch {
                          return addr;
                        }
                      }
                      return formatInvoiceAddress(addr);
                    })()}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              {/* Order Items */}
              <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                Order Items
              </Typography>
              {invoiceDialog.order.items.map((item: any, index: number) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    gap: 2,
                    mb: 2,
                    p: 2,
                    backgroundColor: "#f5f5f5",
                    borderRadius: 1,
                  }}
                >
                  {item.photos?.[0] && (
                    <img
                      src={item.photos[0]}
                      alt={item.title}
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "cover",
                        borderRadius: "4px",
                      }}
                    />
                  )}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#666", mt: 0.5 }}>
                      Quantity: {item.quantity || 1}
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    $
                    {(
                      Number(item.price || 0) * Number(item.quantity || 1)
                    ).toFixed(2)}
                  </Typography>
                </Box>
              ))}

              <Divider sx={{ my: 2 }} />

              {/* Order Summary */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body1">Subtotal:</Typography>
                  <Typography variant="body1">
                    ${Number(invoiceDialog.order.itemTotal || 0).toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body1">Shipping:</Typography>
                  <Typography variant="body1">
                    ${Number(invoiceDialog.order.shippingCost || 0).toFixed(2)}
                  </Typography>
                </Box>
                {invoiceDialog.order.platformFee && (
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2" sx={{ color: "#666" }}>
                      Platform Fee:
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#666" }}>
                      ${Number(invoiceDialog.order.platformFee).toFixed(2)}
                    </Typography>
                  </Box>
                )}
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    Total:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    $
                    {invoiceDialog.order.computedTotal?.toFixed(2) ||
                      Number(invoiceDialog.order.totalAmount || 0).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setInvoiceDialog({ open: false, order: null })}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

const formatInvoiceAddress = (address: any): string => {
  if (!address) return "N/A";
  if (typeof address === "string") {
    try {
      const parsed = JSON.parse(address);
      return formatInvoiceAddress(parsed);
    } catch {
      return address;
    }
  }
  const parts = [
    address.street1,
    address.street2,
    `${address.city}, ${address.state} ${address.zip}`,
    address.country,
  ].filter(Boolean);
  return parts.join("\n");
};

export default YourOrdersPage;
