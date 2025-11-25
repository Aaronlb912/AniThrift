import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { db } from "../firebase-config";
import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  getDocs,
} from "firebase/firestore";
import "../css/Reviews.css";
import StarRating from "../components/StarRating";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface Review {
  id: string;
  raterId: string;
  raterName: string;
  rating: number;
  review?: string;
  itemId?: string;
  itemName?: string;
  orderId?: string;
  timestamp?: any;
}

const SellerReviews: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [sellerName, setSellerName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalReviews, setTotalReviews] = useState<number>(0);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!username) {
        navigate("/not-found");
        return;
      }

      try {
        // Get seller's user ID from username
        const usernameRef = doc(db, "usernames", username);
        const usernameSnap = await getDoc(usernameRef);

        if (!usernameSnap.exists()) {
          navigate("/seller-not-found");
          return;
        }

        const userId = usernameSnap.data().userId;

        // Get seller's profile
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setSellerName(userData.name || userData.username || "Seller");
        }

        // Fetch all reviews
        const reviewsRef = collection(db, "users", userId, "ratings");
        const q = query(reviewsRef, orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);

        const reviewsData: Review[] = [];
        let totalRating = 0;

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          reviewsData.push({
            id: doc.id,
            ...data,
          } as Review);
          totalRating += data.rating || 0;
        });

        setReviews(reviewsData);
        setTotalReviews(reviewsData.length);
        setAverageRating(
          reviewsData.length > 0
            ? Math.round((totalRating / reviewsData.length) * 10) / 10
            : 0
        );
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [username, navigate]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Recently";
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    return "Recently";
  };

  if (isLoading) {
    return (
      <div className="seller-reviews-page">
        <div style={{ textAlign: "center", padding: "40px" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="seller-reviews-page">
      <div className="seller-reviews-header">
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "var(--primary-color)",
            marginBottom: "16px",
            fontSize: "0.9rem",
            fontWeight: 500,
          }}
        >
          <ArrowBackIcon /> Back
        </button>
        <h1>Reviews for {sellerName}</h1>
        <p className="seller-name">@{username}</p>
      </div>

      <div className="seller-reviews-stats">
        <div className="review-stat">
          <span className="review-stat-label">Average Rating</span>
          <span className="review-stat-value">
            {averageRating > 0 ? averageRating.toFixed(1) : "N/A"}
          </span>
        </div>
        <div className="review-stat">
          <span className="review-stat-label">Total Reviews</span>
          <span className="review-stat-value">{totalReviews}</span>
        </div>
        {averageRating > 0 && (
          <div className="review-stat">
            <StarRating rating={averageRating} />
          </div>
        )}
      </div>

      {reviews.length > 0 ? (
        <div className="seller-reviews-list">
          {reviews.map((review) => (
            <div key={review.id} className="review-card-full">
              <div className="review-header">
                <div className="review-rater">
                  <span className="review-rater-name">
                    {review.raterName || "Anonymous"}
                  </span>
                  <StarRating rating={review.rating || 0} />
                </div>
                <span className="review-date">{formatDate(review.timestamp)}</span>
              </div>
              {review.review && (
                <p className="review-text">{review.review}</p>
              )}
              {(review.itemName || review.orderId) && (
                <div className="review-order-info">
                  {review.itemName && (
                    <div>
                      <strong>Item:</strong>{" "}
                      {review.itemId ? (
                        <Link to={`/item/${review.itemId}`}>
                          {review.itemName}
                        </Link>
                      ) : (
                        review.itemName
                      )}
                    </div>
                  )}
                  {review.orderId && (
                    <div style={{ marginTop: "4px" }}>
                      <strong>Order ID:</strong> {review.orderId}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p>This seller hasn't received any reviews yet.</p>
        </div>
      )}
    </div>
  );
};

export default SellerReviews;

