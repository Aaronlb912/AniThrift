import React, { useState } from 'react';
import '../css/Carousel.css'; // Make sure to create this CSS file
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

export const Carousel = ({ items }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
  
    const handlePrev = () => {
      setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
    };
  
    const handleNext = () => {
      setCurrentIndex((prevIndex) => (prevIndex < items.length - 1 ? prevIndex + 1 : prevIndex));
    };
  
    return (
      <div className="carousel-container">
        <KeyboardArrowLeftIcon className="arrow left" onClick={handlePrev} />
        <div className="carousel-wrapper">
          <div className="carousel-items" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
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
      </div>
    );
  };