import React, { useState } from "react";
import "../css/ReviewBox.css";

const ReviewBox = ({ review }) => {
  const [isOpen, setIsOpen] = useState(false); // To toggle lightbox view

  return (
    <div onClick={() => setIsOpen(true)}>
      <p>{review.reviewerName}</p>
      <StarRating rating={review.rating} />
      <p>{review.subject}</p>
      {isOpen && (
        <div className="lightbox">
          <p>{review.fullReview}</p>
          <button onClick={() => setIsOpen(false)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default ReviewBox;
