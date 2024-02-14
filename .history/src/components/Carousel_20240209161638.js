import React, { useState } from "react";
import "../css/Carousel.css"; // Make sure to create this CSS file
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";


function NextArrow(props) {
    const { className, style, onClick } = props;
    return (
      <KeyboardArrowRightIcon
        className={className}
        style={{ ...style, display: "block", color: "black" }}
        onClick={onClick}
      />
    );
  }
  
  function PrevArrow(props) {
    const { className, style, onClick } = props;
    return (
      <KeyboardArrowLeftIcon
        className={className}
        style={{ ...style, display: "block", color: "black" }}
        onClick={onClick}
      />
    );
  }
  
  export const Carousel = ({ items }) => {
    const settings = {
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 5,
      slidesToScroll: 1,
      draggable: true,
      swipeToSlide: true,
      nextArrow: <NextArrow />,
      prevArrow: <PrevArrow />,
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 1,
          },
        },
        {
          breakpoint: 600,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
          },
        },
      ],
    };
  
    return (
      <div className="carousel-container">
        <Slider {...settings}>
          {items.map((item, index) => (
            <div className="carousel-item" key={index}>
              <img src={item.imageUrl} alt={`Item ${index + 1}`} />
              <p>{item.name}</p>
              <p>{item.price}</p>
            </div>
          ))}
        </Slider>
      </div>
    );
  };