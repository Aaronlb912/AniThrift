import React from "react";
import { Link } from "react-router-dom";
import "../css/Carousel.css";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

interface CarouselItem {
  id?: string;
  imageUrl?: string;
  title?: string;
  name?: string;
  price?: string | number;
}

interface ArrowProps {
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const NextArrow: React.FC<ArrowProps> = ({ className, style, onClick }) => (
  <KeyboardArrowRightIcon
    className={className}
    style={{ ...style, display: "block", color: "black" }}
    onClick={onClick}
  />
);

const PrevArrow: React.FC<ArrowProps> = ({ className, style, onClick }) => (
  <KeyboardArrowLeftIcon
    className={className}
    style={{ ...style, display: "block", color: "black" }}
    onClick={onClick}
  />
);

interface CarouselProps {
  items: CarouselItem[];
}

export const Carousel: React.FC<CarouselProps> = React.memo(({ items }) => {
  const isMultipleItems = items.length > 1;

  const settings = React.useMemo(
    () => ({
      dots: true,
      centerMode: false,
      infinite: isMultipleItems,
      slidesToShow: Math.min(7, items.length),
      slidesToScroll: Math.min(7, items.length),
      speed: 800,
      cssEase: "ease-in-out",
      swipe: true,
      touchMove: true,
      swipeToSlide: true,
      autoplay: false,
      nextArrow: <NextArrow />,
      prevArrow: <PrevArrow />,
      responsive: [
        {
          breakpoint: 1440,
          settings: {
            slidesToShow: Math.min(5, items.length),
            slidesToScroll: Math.min(5, items.length),
            infinite: items.length > 5,
          },
        },
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: Math.min(4, items.length),
            slidesToScroll: Math.min(4, items.length),
            infinite: items.length > 4,
          },
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: Math.min(3, items.length),
            slidesToScroll: Math.min(3, items.length),
            infinite: items.length > 3,
          },
        },
        {
          breakpoint: 600,
          settings: {
            slidesToShow: Math.min(2, items.length),
            slidesToScroll: Math.min(2, items.length),
            infinite: items.length > 2,
          },
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
            infinite: items.length > 1,
          },
        },
      ],
    }),
    [isMultipleItems, items.length]
  );

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="carousel-container">
      <Slider {...settings}>
        {items.map((item, index) => (
          <div key={item.id || index} className="carousel-item">
            <Link to={`/item/${item.id || index}`} className="carousel-item-link">
              <img src={item.imageUrl} alt={item.title || item.name || `Item ${index + 1}`} />
              <p>{item.title || item.name}</p>
              <p className="carousel-item-price">
                {typeof item.price === "number"
                  ? `$${item.price.toFixed(2)}`
                  : typeof item.price === "string"
                  ? item.price
                  : "$0.00"}
              </p>
            </Link>
          </div>
        ))}
      </Slider>
    </div>
  );
});
