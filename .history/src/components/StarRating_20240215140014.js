import React from 'react';
import

const StarRating = ({ rating }) => {
  const totalStars = 5; // Maximum number of stars you want to display
  let stars = [];
  
  // Add filled stars based on the rating
  for (let i = 1; i <= totalStars; i++) {
    if (i <= rating) {
      stars.push(<span key={i}>&#x2605;</span>); // Filled star
    } else {
      stars.push(<span key={i}>&#x2606;</span>); // Empty star
    }
  }
  
  return (
    <div className="star-rating">
      {stars}
    </div>
  );
};

export default StarRating;
