import React, { useState } from 'react';
import './Carousel.css'; // Make sure to create this CSS file
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const Carousel = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex < items.length - 1 ? prevIndex + 1 : prevIndex));
  };

  return (
    <div className="carousel-container">
      <KeyboardArrowUpIcon className="arrow" onClick={handlePrev} />
      <div className="carousel-items">
        {items.map((item, index) => (
          <div className="carousel-item" key={index} style={{ transform: `translateY(-${currentIndex * 100}%)` }}>
            <img src={item.imageUrl} alt={`Item ${index + 1}`} />
            <p>{item.name}</p>
            <p>{item.price}</p>
          </div>
        ))}
      </div>
      <KeyboardArrowDownIcon className="arrow" onClick={handleNext} />
    </div>
  );
};
