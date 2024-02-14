import React, { useState, useEffect } from "react";
import "./App.css"; // Assuming you have a CSS file for styling
import { useAuthState } from "react-firebase-hooks/auth"; // If you're using Firebase
import { auth } from "./firebase-config"; // Adjust the path according to your project structure
import { Carousel } from "../comp/Carousel"; // Adjust the path as necessary
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const App = () => {
  const [user, loading, error] = useAuthState(auth); // This hook comes from react-firebase-hooks

  useEffect(() => {
    // Placeholder for any side effects, including fetching user-specific data if logged in
  }, [user]);

  const carouselItems = user
    ? [
        {
          imageUrl: "path/to/your/image1.jpg",
          name: "Product 1",
          price: "$20",
        },
        {
          imageUrl: "path/to/your/image2.jpg",
          name: "Product 2",
          price: "$30",
        },
      ] // Picks for the user
    : [
        {
          imageUrl: "path/to/your/image1.jpg",
          name: "New Product 1",
          price: "$15",
        },
        {
          imageUrl: "path/to/your/image2.jpg",
          name: "New Product 2",
          price: "$25",
        },
      ]; // New items for non-logged-in users

  return (
    <div className="homepage">
      <div className="slideshow">
        <Slider autoplay autoplaySpeed={3000}>
          <div>
            <img src="placeholder1.jpg" alt="News 1" />
          </div>
          <div>
            <img src="placeholder2.jpg" alt="Event 1" />
          </div>
          <div>
            <img src="placeholder3.jpg" alt="Discount 1" />
          </div>
          {/* Add more slides as needed */}
        </Slider>
      </div>{" "}
      <div className="slideshow">
        {/* Placeholder for slideshow component */}
      </div>
      {/* Image carousel */}
      <Carousel items={carouselItems} />
    </div>
  );
};

export default App;
