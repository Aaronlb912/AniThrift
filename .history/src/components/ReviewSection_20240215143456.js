import React, { useState } from "react";
import ReviewBox from "./ReviewBox"; // We'll create this next

const ReviewsSection = ({ reviews }) => {
  const [viewType, setViewType] = useState("buyer"); // 'buyer' or 'seller'

  return (
    <div className="re">
      <h2>Reviews ({reviews.length})</h2>
      <div>
        <button onClick={() => setViewType("buyer")}>From Buyers</button>
        <button onClick={() => setViewType("seller")}>From Sellers</button>
      </div>
      {reviews.length ? (
        reviews.map((review) => <ReviewBox key={review.id} review={review} />)
      ) : (
        <div className="no-reviews">No reviews yet</div>
      )}
    </div>
  );
};

export default ReviewsSection;
