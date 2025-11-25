import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
} from "@mui/material";
import axios from "axios";
import "../css/Checkout.css";
import { getAuth } from "firebase/auth";
import { db } from "../firebase-config";
import { doc, getDoc } from "firebase/firestore";
// SECURITY: Seller addresses are fetched server-side via Cloud Function to prevent doxxing
// Removed direct Firestore access - seller addresses are never exposed to client
import {
  getParcelDimensions,
  ShippingAddress,
  ShippoRate,
} from "../services/shippoService";
import { shippingWeightTiers } from "../data/shippingOptions";

interface CartItem {
  itemId: string;
  title: string;
  imageUrl: string;
  price: number;
  quantity: number;
  sellerId: string;
  sellerName: string;
  shippingSummary?: {
    payer: string;
    weightTierId: string;
    serviceId: string;
  };
}

const CheckoutPage = () => {
  const location = useLocation();
  const { cartItems } = location.state || { cartItems: [] };
  const auth = getAuth();
  const user = auth.currentUser;

  const [isLoading, setIsLoading] = useState(false);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: "",
    street1: "",
    street2: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
    phone: "",
    email: user?.email || "",
  });
  const [selectedShippingRates, setSelectedShippingRates] = useState<
    Record<string, ShippoRate>
  >({});
  const [shippingRates, setShippingRates] = useState<
    Record<string, ShippoRate[]>
  >({});
  const [shippingErrors, setShippingErrors] = useState<
    Record<string, string>
  >({});
  const [showShippingForm, setShowShippingForm] = useState(false);

  // Fetch user's saved shipping address
  useEffect(() => {
    const fetchUserAddress = async () => {
      if (!user) return;
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.shippingAddress) {
            // Parse shipping address if stored as string or object
            const address = typeof data.shippingAddress === "string"
              ? JSON.parse(data.shippingAddress)
              : data.shippingAddress;
            setShippingAddress((prev) => ({
              ...prev,
              ...address,
              email: user.email || prev.email,
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching user address:", error);
      }
    };
    fetchUserAddress();
  }, [user]);

  // Calculate shipping rates for all sellers (server-side to protect seller addresses)
  const calculateAllShippingRates = async () => {
    if (!shippingAddress.street1 || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zip) {
      alert("Please complete your shipping address first.");
      return;
    }

    setIsCalculatingShipping(true);
    setShippingErrors({});

    try {
      // Group items by seller
      const itemsBySeller: Record<string, CartItem[]> = {};
      cartItems.forEach((item: CartItem) => {
        if (!itemsBySeller[item.sellerId]) {
          itemsBySeller[item.sellerId] = [];
        }
        itemsBySeller[item.sellerId].push(item);
      });

      // Calculate rates for each seller via Cloud Function (seller address stays server-side)
      const ratesBySeller: Record<string, ShippoRate[]> = {};
      const errorsBySeller: Record<string, string> = {};

      for (const [sellerId, items] of Object.entries(itemsBySeller)) {
        try {
          // Calculate total weight and dimensions for all items from this seller
          const weightTierIds = items
            .map((item) => item.shippingSummary?.weightTierId)
            .filter(Boolean) as string[];

          if (weightTierIds.length === 0) {
            errorsBySeller[sellerId] = "Item weight information missing";
            continue;
          }

          // Use the largest weight tier
          const maxTier = weightTierIds.reduce((max, tierId) => {
            const tier = shippingWeightTiers.find((t) => t.id === tierId);
            const maxTierObj = shippingWeightTiers.find((t) => t.id === max);
            return tier && maxTierObj && tier.maxWeightOz > maxTierObj.maxWeightOz
              ? tierId
              : max;
          }, weightTierIds[0]);

          const parcel = getParcelDimensions(maxTier);
          const totalWeight = parcel.weight * items.reduce((sum, item) => sum + item.quantity, 0);

          // Call Cloud Function to calculate rates (seller address fetched server-side)
          const response = await axios.post(
            "https://us-central1-anithrift-e77a9.cloudfunctions.net/calculateShippoRatesForSeller",
            {
              sellerId,
              toAddress: shippingAddress,
              parcel: {
                ...parcel,
                weight: totalWeight,
              },
            }
          );

          if (response.data.error) {
            errorsBySeller[sellerId] = response.data.error;
            continue;
          }

          const rates = response.data.rates || [];
          ratesBySeller[sellerId] = rates;
          
          // Auto-select the cheapest rate
          if (rates.length > 0) {
            const cheapestRate = rates.reduce((min, rate) =>
              parseFloat(rate.amount) < parseFloat(min.amount) ? rate : min
            );
            setSelectedShippingRates((prev) => ({
              ...prev,
              [sellerId]: cheapestRate,
            }));
          }
        } catch (error: any) {
          console.error(`Error calculating rates for seller ${sellerId}:`, error);
          errorsBySeller[sellerId] = error.response?.data?.error || error.message || "Failed to calculate shipping rates";
        }
      }

      setShippingRates(ratesBySeller);
      setShippingErrors(errorsBySeller);
    } catch (error) {
      console.error("Error calculating shipping rates:", error);
      alert("Failed to calculate shipping rates. Please try again.");
    } finally {
      setIsCalculatingShipping(false);
    }
  };

  const handlePayment = async () => {
    // Validate shipping address
    if (!shippingAddress.street1 || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zip) {
      alert("Please complete your shipping address.");
      return;
    }

    // Group items by seller
    const itemsBySeller: Record<string, CartItem[]> = {};
    cartItems.forEach((item: CartItem) => {
      if (!itemsBySeller[item.sellerId]) {
        itemsBySeller[item.sellerId] = [];
      }
      itemsBySeller[item.sellerId].push(item);
    });

    // Validate shipping rates are selected for all sellers
    const missingRates = Object.keys(itemsBySeller).filter(
      (sellerId) => !selectedShippingRates[sellerId] && !shippingErrors[sellerId]
    );

    if (missingRates.length > 0) {
      alert("Please calculate and select shipping rates for all sellers.");
      return;
    }

    setIsLoading(true);
    try {
      // Create separate checkout sessions for each seller
      const checkoutSessions: string[] = [];

      for (const [sellerId, sellerItems] of Object.entries(itemsBySeller)) {
        // Calculate shipping cost for this seller
        const sellerShippingCost = selectedShippingRates[sellerId]
          ? parseFloat(selectedShippingRates[sellerId].amount)
          : 0;

        // Calculate item total for this seller
        const sellerItemTotal = sellerItems.reduce(
          (total: number, item: CartItem) => total + Number(item.price) * item.quantity,
          0
        );

        // Create seller-specific shipping rates object
        const sellerShippingRates: Record<string, ShippoRate> = {
          [sellerId]: selectedShippingRates[sellerId],
        };

        // Create checkout session for this seller's items
        const response = await axios.post(
          "https://us-central1-anithrift-e77a9.cloudfunctions.net/createCheckoutSession",
          {
            cartItems: sellerItems, // Only items from this seller
            buyerId: user?.uid,
            sellerId: sellerId, // Include seller ID for proper payout
            shippingAddress,
            shippingRates: sellerShippingRates,
            shippingCost: sellerShippingCost,
            itemTotal: sellerItemTotal,
          }
        );

        checkoutSessions.push(response.data.url);
      }

      // If only one seller, redirect directly
      if (checkoutSessions.length === 1) {
        window.location.href = checkoutSessions[0];
      } else {
        // Multiple sellers - process sequentially
        // Store remaining sessions in sessionStorage to process after first payment
        const remainingSessions = checkoutSessions.slice(1);
        sessionStorage.setItem('pendingCheckoutSessions', JSON.stringify(remainingSessions));
        sessionStorage.setItem('totalCheckoutSessions', checkoutSessions.length.toString());
        sessionStorage.setItem('currentCheckoutIndex', '1');
        
        alert(`You have items from ${checkoutSessions.length} different sellers. You'll complete checkout for each seller separately. Starting with the first seller...`);
        window.location.href = checkoutSessions[0];
      }
    } catch (error: any) {
      console.error("Failed to start the payment process:", error);
      console.error("Full error object:", JSON.stringify(error, null, 2));
      
      let errorMessage = "Payment process failed.";
      
      if (error.response) {
        // Server responded with error
        const errorData = error.response.data;
        console.error("Server error response:", errorData);
        console.error("Status code:", error.response.status);
        
        // Try multiple possible error message fields
        errorMessage = 
          errorData?.error || 
          errorData?.message || 
          errorData?.details ||
          error.response.statusText ||
          `Server error (${error.response.status})` ||
          errorMessage;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = "Unable to connect to payment server. Please check your internet connection.";
        console.error("Network error - no response:", error.request);
      } else {
        // Something else happened
        errorMessage = error.message || errorMessage;
        console.error("Client-side error:", error.message);
      }
      
      // Show detailed error in alert
      alert(`Payment process failed: ${errorMessage}\n\nCheck the browser console for more details.`);
    } finally {
      setIsLoading(false);
    }
  };

  const itemTotal = cartItems.reduce(
    (total: number, item: CartItem) => total + Number(item.price) * item.quantity,
    0
  );

  const shippingTotal = Object.values(selectedShippingRates).reduce(
    (sum, rate) => sum + parseFloat(rate.amount),
    0
  );

  const totalPrice = (itemTotal + shippingTotal).toFixed(2);

  // Group items by seller
  const itemsBySeller: Record<string, CartItem[]> = {};
  cartItems.forEach((item: CartItem) => {
    if (!itemsBySeller[item.sellerId]) {
      itemsBySeller[item.sellerId] = [];
    }
    itemsBySeller[item.sellerId].push(item);
  });

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>

      {/* Shipping Address Form */}
      <Box sx={{ mb: 3, p: 2, border: "1px solid #e0e0e0", borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Shipping Address
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Full Name"
            value={shippingAddress.name}
            onChange={(e) =>
              setShippingAddress({ ...shippingAddress, name: e.target.value })
            }
            required
            fullWidth
          />
          <TextField
            label="Street Address"
            value={shippingAddress.street1}
            onChange={(e) =>
              setShippingAddress({ ...shippingAddress, street1: e.target.value })
            }
            required
            fullWidth
          />
          <TextField
            label="Apartment, suite, etc. (optional)"
            value={shippingAddress.street2 || ""}
            onChange={(e) =>
              setShippingAddress({ ...shippingAddress, street2: e.target.value })
            }
            fullWidth
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="City"
              value={shippingAddress.city}
              onChange={(e) =>
                setShippingAddress({ ...shippingAddress, city: e.target.value })
              }
              required
              fullWidth
            />
            <TextField
              label="State"
              value={shippingAddress.state}
              onChange={(e) =>
                setShippingAddress({ ...shippingAddress, state: e.target.value })
              }
              required
              fullWidth
            />
            <TextField
              label="ZIP Code"
              value={shippingAddress.zip}
              onChange={(e) =>
                setShippingAddress({ ...shippingAddress, zip: e.target.value })
              }
              required
              fullWidth
            />
          </Box>
          <TextField
            label="Phone (optional)"
            value={shippingAddress.phone || ""}
            onChange={(e) =>
              setShippingAddress({ ...shippingAddress, phone: e.target.value })
            }
            fullWidth
          />
          <Button
            variant="outlined"
            onClick={calculateAllShippingRates}
            disabled={isCalculatingShipping}
            sx={{ alignSelf: "flex-start" }}
          >
            {isCalculatingShipping ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Calculating Rates...
              </>
            ) : (
              "Calculate Shipping Rates"
            )}
          </Button>
        </Box>
      </Box>

      {/* Items by Seller */}
      {Object.entries(itemsBySeller).map(([sellerId, items]) => (
        <Box key={sellerId} sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Seller: {items[0].sellerName}
          </Typography>
          {items.map((item, index) => (
            <div key={index} className="checkout-item">
              <img src={item.imageUrl} alt={item.title} className="item-image" />
              <div className="item-info">
                <p className="item-title">{item.title}</p>
                <p className="item-quantity">Quantity: {item.quantity}</p>
                <p className="item-price">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}

          {/* Shipping Rate Selection */}
          {shippingErrors[sellerId] && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {shippingErrors[sellerId]}
            </Alert>
          )}

          {shippingRates[sellerId] && shippingRates[sellerId].length > 0 && (
            <Box sx={{ mt: 2, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Select Shipping Method:
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={selectedShippingRates[sellerId]?.object_id || ""}
                  onChange={(e) => {
                    const rate = shippingRates[sellerId].find(
                      (r) => r.object_id === e.target.value
                    );
                    if (rate) {
                      setSelectedShippingRates((prev) => ({
                        ...prev,
                        [sellerId]: rate,
                      }));
                    }
                  }}
                >
                  {shippingRates[sellerId].map((rate) => (
                    <MenuItem key={rate.object_id} value={rate.object_id}>
                      {rate.servicelevel.name} ({rate.provider}) - $
                      {parseFloat(rate.amount).toFixed(2)} (
                      {rate.estimated_days} days)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {selectedShippingRates[sellerId] && (
                <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
                  Selected: {selectedShippingRates[sellerId].servicelevel.name} - $
                  {parseFloat(selectedShippingRates[sellerId].amount).toFixed(2)}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      ))}

      {/* Order Summary */}
      <Box sx={{ mt: 3, p: 2, bgcolor: "#f9f9f9", borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          Order Summary
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography>Items:</Typography>
          <Typography>${itemTotal.toFixed(2)}</Typography>
        </Box>
        {shippingTotal > 0 && (
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography>Shipping:</Typography>
            <Typography>${shippingTotal.toFixed(2)}</Typography>
          </Box>
        )}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 2,
            pt: 2,
            borderTop: "1px solid #e0e0e0",
          }}
        >
          <Typography variant="h6">Total:</Typography>
          <Typography variant="h6">${totalPrice}</Typography>
        </Box>
      </Box>
      <div className="buttons">
        <Button
          onClick={handlePayment}
          variant="contained"
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : "Pay Now"}
        </Button>
        <Button component={Link} to="/cart" variant="outlined">
          Back to Cart
        </Button>
      </div>
      {/* Loading dialog */}
      <Dialog open={isLoading}>
        <DialogTitle>Loading</DialogTitle>
        <DialogContent>
          <CircularProgress />
          <p>Processing payment...</p>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CheckoutPage;
