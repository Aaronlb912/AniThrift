import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@mui/material";
import axios from "axios";
import "../css/Checkout.css";
import { getAuth } from "firebase/auth";

const CheckoutPage = () => {
  const location = useLocation();
  const { cartItems } = location.state || { cartItems: [] };
  const auth = getAuth(); // Initialize Firebase Auth
  const user = auth.currentUser; // Get the currently logged-in user

  const handlePayment = async () => {
    try {
      // Call your backend to create a checkout session
      const response = await axios.post(
        "https://us-central1-anithrift-e77a9.cloudfunctions.net/createCheckoutSession",
        {
          cartItems,
          buyerId: user.uid, // Include the buyer's Firebase user ID
        }
      );
      // Redirect to Stripe's hosted checkout page

      window.location.href = response.data.url;
    } catch (error) {
      console.error("Failed to start the payment process:", error);
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
        <Button onClick={handlePayment} variant="contained">
          Pay Now
        </Button>
        <Button component={Link} to="/cart" variant="outlined">
          Back to Cart
        </Button>
      </div>
    </div>
  );
};

export default CheckoutPage;
