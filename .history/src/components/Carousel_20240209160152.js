import React, { useState } from "react";
import "../css/Carousel.css"; // Make sure to create this CSS file
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

export const Carousel = ({ items }) => {
  const settings = {
    dots: true, // Shows dot indicators at the bottom of the carousel
    infinite: true, // Infinite looping
    speed: 500, // Animation speed
    slidesToShow: 3, // Number of items to show at once
    slidesToScroll: 1, // Number of items to scroll
    draggable: true, // Allows dragging on desktop
    swipeToSlide: true, // Allows sliding to the next/prev item on touch devices
    responsive: [
      // Adjust the number of items shown at different screen widths
      {
        breakpoint: 1024, // For devices with a width of up to 1024px
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 600, // For devices with a width of up to 600px
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex < items.length - 1 ? prevIndex + 1 : prevIndex
    );
  };

  return (
    <div className="carousel-container">
      <Slider {...settings}>
        <KeyboardArrowLeftIcon className="arrow left" onClick={handlePrev} />
        <div className="carousel-wrapper">
          <div
            className="carousel-items"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {items.map((item, index) => (
              <div className="carousel-item" key={index}>
                <img src={item.imageUrl} alt={`Item ${index + 1}`} />
                <p>{item.name}</p>
                <p>{item.price}</p>
              </div>
            ))}
          </div>
        </div>
        <KeyboardArrowRightIcon className="arrow right" onClick={handleNext} />
      </Slider>
    </div>
  );
};
