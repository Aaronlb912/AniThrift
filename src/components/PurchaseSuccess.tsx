import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { db } from "../firebase-config";
import { collection, query, where, getDocs, doc, getDoc, deleteDoc, getDocs as getDocsQuery } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Button, Box, Typography, Divider, CircularProgress, Alert, Paper } from "@mui/material";
import MainLayout from "./MainLayout";
import "../css/PurchaseSuccess.css";

interface OrderItem {
  itemId: string;
  title: string;
  imageUrl?: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  cartItems: OrderItem[];
  shippingAddress: any;
  shippingCost: number;
  itemTotal: number;
  totalAmount: number;
  platformFee?: number;
  sellerPayoutAmount?: number;
  stripeSessionId: string;
  status: string;
  createdAt: any;
}

const PurchaseSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sellerName, setSellerName] = useState<string>("");
  const auth = getAuth();

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    
    if (!sessionId) {
      setError("No session ID provided");
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        // First, check if there are pending checkout sessions
        const pendingSessions = sessionStorage.getItem('pendingCheckoutSessions');
        const currentIndex = parseInt(sessionStorage.getItem('currentCheckoutIndex') || '0');
        const totalSessions = parseInt(sessionStorage.getItem('totalCheckoutSessions') || '1');

        if (pendingSessions) {
          try {
            const sessions: string[] = JSON.parse(pendingSessions);
            
            if (sessions.length > 0) {
              // Update index and remove first session
              const nextIndex = currentIndex + 1;
              const remainingSessions = sessions.slice(1);
              
              if (remainingSessions.length > 0) {
                sessionStorage.setItem('pendingCheckoutSessions', JSON.stringify(remainingSessions));
                sessionStorage.setItem('currentCheckoutIndex', nextIndex.toString());
                
                // Fetch and display current order, then redirect to next
                await loadOrderData(sessionId);
                
                // Redirect to next checkout session after showing invoice
                setTimeout(() => {
                  window.location.href = sessions[0];
                }, 5000);
                
                return;
              } else {
                // All sessions completed
                sessionStorage.removeItem('pendingCheckoutSessions');
                sessionStorage.removeItem('currentCheckoutIndex');
                sessionStorage.removeItem('totalCheckoutSessions');
              }
            }
          } catch (error) {
            console.error("Error processing pending sessions:", error);
            sessionStorage.removeItem('pendingCheckoutSessions');
            sessionStorage.removeItem('currentCheckoutIndex');
            sessionStorage.removeItem('totalCheckoutSessions');
          }
        }

        // Load order data
        await loadOrderData(sessionId);
      } catch (err: any) {
        console.error("Error fetching order:", err);
        setError(err.message || "Failed to load order details");
        setLoading(false);
      }
    };

    fetchOrder();
  }, [searchParams]);

  const loadOrderData = async (sessionId: string) => {
    try {
      // Query orders collection for this session ID
      const ordersRef = collection(db, "orders");
      const q = query(ordersRef, where("stripeSessionId", "==", sessionId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("Order not found. It may still be processing.");
        setLoading(false);
        return;
      }

      const orderDoc = querySnapshot.docs[0];
      const orderData = orderDoc.data() as Order;
      orderData.id = orderDoc.id;

      // Fetch seller name
      if (orderData.sellerId) {
        try {
          const sellerDoc = await getDoc(doc(db, "users", orderData.sellerId));
          if (sellerDoc.exists()) {
            const sellerData = sellerDoc.data();
            setSellerName(sellerData.name || sellerData.username || "Seller");
          }
        } catch (err) {
          console.error("Error fetching seller name:", err);
        }
      }

      // Clear cart items that were in this order
      if (auth.currentUser && orderData.cartItems) {
        try {
          const cartRef = collection(db, "users", auth.currentUser.uid, "cart");
          const cartSnapshot = await getDocs(cartRef);
          
          // Get item IDs from the order
          const orderItemIds = new Set(orderData.cartItems.map(item => item.itemId));
          
          // Delete cart items that match order items
          const deletePromises = cartSnapshot.docs
            .filter(cartDoc => {
              const cartData = cartDoc.data();
              return orderItemIds.has(cartData.itemId);
            })
            .map(cartDoc => deleteDoc(doc(db, "users", auth.currentUser!.uid, "cart", cartDoc.id)));
          
          await Promise.all(deletePromises);
          console.log("Cart cleared for purchased items");
        } catch (err) {
          console.error("Error clearing cart:", err);
          // Don't block the success page if cart clearing fails
        }
      }

      setOrder(orderData);
      setLoading(false);
    } catch (err: any) {
      console.error("Error loading order:", err);
      setError(err.message || "Failed to load order");
      setLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAddress = (address: any) => {
    if (!address) return "N/A";
    if (typeof address === "string") {
      try {
        const parsed = JSON.parse(address);
        return formatAddress(parsed);
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

  if (loading) {
    return (
      <MainLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (error || !order) {
    return (
      <MainLayout>
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || "Order not found"}
          </Alert>
          <Button variant="contained" onClick={() => navigate("/orders")}>
            View My Orders
          </Button>
        </Box>
      </MainLayout>
    );
  }

  const pendingSessions = sessionStorage.getItem('pendingCheckoutSessions');
  const hasMoreSessions = pendingSessions && JSON.parse(pendingSessions).length > 0;
  const currentIndex = parseInt(sessionStorage.getItem('currentCheckoutIndex') || '0');
  const totalSessions = parseInt(sessionStorage.getItem('totalCheckoutSessions') || '1');

  return (
    <MainLayout>
      <div className="purchase-success-container">
        <Box sx={{ maxWidth: "900px", margin: "0 auto", p: 3 }}>
          {/* Success Header */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography variant="h3" sx={{ color: "#4caf50", mb: 1, fontWeight: "bold" }}>
              ✓ Payment Successful!
            </Typography>
            <Typography variant="body1" sx={{ color: "#666" }}>
              Thank you for your purchase. Your order has been confirmed.
            </Typography>
            {hasMoreSessions && (
              <Alert severity="info" sx={{ mt: 2, textAlign: "left" }}>
                Processing checkout {currentIndex + 1} of {totalSessions}. 
                You'll be redirected to complete the next seller's checkout shortly.
              </Alert>
            )}
          </Box>

          {/* Invoice */}
          <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" sx={{ mb: 1, fontWeight: "bold" }}>
                Order Invoice
              </Typography>
              <Typography variant="body2" sx={{ color: "#666" }}>
                Order ID: {order.id}
              </Typography>
              <Typography variant="body2" sx={{ color: "#666" }}>
                Date: {formatDate(order.createdAt)}
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Seller Info */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold" }}>
                Seller Information
              </Typography>
              <Typography variant="body1">{sellerName || "Seller"}</Typography>
            </Box>

            {/* Shipping Address */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold" }}>
                Shipping Address
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
                {formatAddress(order.shippingAddress)}
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Order Items */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                Order Items
              </Typography>
              {order.cartItems.map((item, index) => (
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
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
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
                      Quantity: {item.quantity}
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    ${(Number(item.price) * Number(item.quantity)).toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Order Summary */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body1">Subtotal:</Typography>
                <Typography variant="body1">${Number(order.itemTotal).toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body1">Shipping:</Typography>
                <Typography variant="body1">${Number(order.shippingCost || 0).toFixed(2)}</Typography>
              </Box>
              {order.platformFee && (
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" sx={{ color: "#666" }}>
                    Platform Fee:
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#666" }}>
                    ${Number(order.platformFee).toFixed(2)}
                  </Typography>
                </Box>
              )}
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  Total:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  ${Number(order.totalAmount).toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Next Steps */}
          <Paper elevation={3} sx={{ p: 4, backgroundColor: "#f8f9fa" }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
              What's Next?
            </Typography>
            <Box component="ol" sx={{ pl: 3, "& li": { mb: 2 } }}>
              <li>
                <Typography variant="body1" sx={{ fontWeight: "medium", mb: 0.5 }}>
                  Order Confirmation
                </Typography>
                <Typography variant="body2" sx={{ color: "#666" }}>
                  You'll receive an email confirmation with your order details and receipt.
                </Typography>
              </li>
              <li>
                <Typography variant="body1" sx={{ fontWeight: "medium", mb: 0.5 }}>
                  Seller Processing
                </Typography>
                <Typography variant="body2" sx={{ color: "#666" }}>
                  The seller will be notified and will prepare your items for shipment. 
                  This typically takes 1-3 business days.
                </Typography>
              </li>
              <li>
                <Typography variant="body1" sx={{ fontWeight: "medium", mb: 0.5 }}>
                  Shipping Notification
                </Typography>
                <Typography variant="body2" sx={{ color: "#666" }}>
                  Once your order ships, you'll receive a tracking number via email 
                  and can track your package in the "Your Orders" section.
                </Typography>
              </li>
              <li>
                <Typography variant="body1" sx={{ fontWeight: "medium", mb: 0.5 }}>
                  Delivery
                </Typography>
                <Typography variant="body2" sx={{ color: "#666" }}>
                  Your items will be delivered to the shipping address provided. 
                  Please ensure someone is available to receive the package.
                </Typography>
              </li>
              <li>
                <Typography variant="body1" sx={{ fontWeight: "medium", mb: 0.5 }}>
                  Rate Your Experience
                </Typography>
                <Typography variant="body2" sx={{ color: "#666" }}>
                  After receiving your items, you can rate the seller and leave a review 
                  from the "Your Orders" page. Your feedback helps other buyers!
                </Typography>
              </li>
            </Box>
          </Paper>

          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 4 }}>
            <Button
              variant="contained"
              component={Link}
              to="/orders"
              sx={{ minWidth: "200px" }}
            >
              View My Orders
            </Button>
            <Button
              variant="outlined"
              component={Link}
              to="/search"
              sx={{ minWidth: "200px" }}
            >
              Continue Shopping
            </Button>
          </Box>
        </Box>
      </div>
    </MainLayout>
  );
};

export default PurchaseSuccess;
