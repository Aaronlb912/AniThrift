import React from "react";
import "../css/Stars.css";

const StarRating = ({ rating }) => {
  const totalStars = 5; // Maximum number of stars you want to display
  let stars = [];
  
  // Ensure rating is a number and handle decimal ratings
  const numericRating = typeof rating === 'number' ? rating : 0;
  const roundedRating = Math.round(numericRating * 2) / 2; // Round to nearest 0.5

  // Add filled stars based on the rating
  for (let i = 1; i <= totalStars; i++) {
    if (i <= roundedRating) {
      stars.push(<span key={i}>&#x2605;</span>); // Filled star
    } else if (i - 0.5 <= roundedRating) {
      stars.push(<span key={i}>&#x2606;&#x2605;</span>); // Half star (using two characters)
    } else {
      stars.push(<span key={i}>&#x2606;</span>); // Empty star
    }
  }

  return (
    <div className="star-rating">
      {stars}
      {numericRating > 0 && (
        <span className="rating-value">({numericRating.toFixed(1)})</span>
      )}
    </div>
  );
};

export default StarRating;
