import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../css/Carousel.css"; // Make sure to create this CSS file
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

function NextArrow(props:any) {
  const { className, style, onClick } = props;
  return (
    <KeyboardArrowRightIcon
      className={className}
      style={{ ...style, display: "block", color: "black" }}
      onClick={onClick}
    />
  );
}

function PrevArrow(props:any) {
  const { className, style, onClick } = props;
  return (
    <KeyboardArrowLeftIcon
      className={className}
      style={{ ...style, display: "block", color: "black" }}
      onClick={onClick}
    />
  );
}

export const Carousel = ({ items }:{items:any}) => {
  const settings = {
    centerMode: true,
    infinite: true,
    centerPadding: "60px",
    slidesToShow: 3,
    speed: 500,
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
        {items.map((item:any, index:any) => (
          // Key is moved to the outermost element
          <div key={index} className="carousel-item">
            <Link to={`/item/${item?.id}`} className="carousel-item-link">
              <img src={item?.imageUrl} alt={`Item ${index + 1}`} />
              <p>{item?.name}</p>
              <p>${item?.price}</p>
            </Link>
          </div>
        ))}
      </Slider>
    </div>
  );
};
