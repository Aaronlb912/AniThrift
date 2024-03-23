import React, { useState } from "react"; // Add useState for managing state
import { Link, useLocation } from "react-router-dom";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material"; // Import CircularProgress for loading indicator, Dialog components for modal
import axios from "axios";
import "../css/Checkout.css";
import { getAuth } from "firebase/auth";

const CheckoutPage = () => {
  const location = useLocation();
  const { cartItems } = location.state || { cartItems: [] };
  const auth = getAuth();
  const user = auth.currentUser;

  const [isLoading, setIsLoading] = useState(false); // State to track loading status

  const handlePayment = async () => {
    setIsLoading(true); // Set loading to true when starting the payment process
    try {
      const response = await axios.post(
        "https://us-central1-anithrift-e77a9.cloudfunctions.net/createCheckoutSession",
        {
          cartItems,
          buyerId: user.uid,
        }
      );
      window.location.href = response.data.url;
    } catch (error) {
      console.error("Failed to start the payment process:", error);
      alert("Payment process failed."); // Notify user about the error
    } finally {
      setIsLoading(false); // Reset loading state regardless of the outcome
    }
  };

  const totalPrice = cartItems
    .reduce((total, item) => total + Number(item.price) * item.quantity, 0)
    .toFixed(2);

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>
      {cartItems.map((item, index) => (
        <div key={index} className="checkout-item">
          <img src={item.imageUrl} alt={item.title} className="item-image" />
          <div className="item-info">
            <p className="item-title">{item.title}</p>
            <p className="item-quantity">Quantity: {item.quantity}</p>{" "}
            {/* Added quantity */}
            <p className="item-price">
              ${(item.price * item.quantity).toFixed(2)}
            </p>{" "}
            {/* Updated price based on quantity */}
          </div>
        </div>
      ))}
      <p className="total-price">Total: ${totalPrice}</p>
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
