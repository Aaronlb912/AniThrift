import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { db } from "../firebase-config";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import "../css/Profile.css";
import "../css/Reviews.css";
import StarRating from "../components/StarRating";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const PublicProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userItems, setUserItems] = useState<any[]>([]);
  const [soldItems, setSoldItems] = useState<any[]>([]);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setCurrentUserId(authUser ? authUser.uid : null);
    });

    return () => unsubscribe();
  }, []);

  const fetchUserProfile = useCallback(
    async (username: string) => {
      try {
        const usernameRef = doc(db, "usernames", username);
        const usernameSnap = await getDoc(usernameRef);

        if (!usernameSnap.exists()) {
          navigate("/seller-not-found", { replace: true });
          return;
        }

        const userId = usernameSnap.data().userId;
        setProfileUserId(userId); // Store the userId for messaging

        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          navigate("/seller-not-found", { replace: true });
          return;
        }

        const userData = userSnap.data();
        const rating =
          typeof userData.rating === "number" ? userData.rating : 0;

        if (
          currentUserId &&
          currentUserId !== userId &&
          Array.isArray(userData.blockedUsers) &&
          userData.blockedUsers.includes(currentUserId)
        ) {
          setIsLoading(false);
          navigate("/seller-not-found", { replace: true });
          return;
        }

        setUserProfile({
          ...userData,
          rating,
        });

        await fetchUserItems(userId);
        await fetchSoldItems(userId);
        await fetchRecentReviews(userId);
      } catch (error) {
        console.error("Error loading seller profile:", error);
        navigate("/seller-not-found", { replace: true });
      } finally {
        setIsLoading(false);
      }
    },
    [currentUserId, navigate]
  );

  useEffect(() => {
    if (username) {
      setIsLoading(true);
      setUserProfile(null);
      setUserItems([]);
      setSoldItems([]);
      fetchUserProfile(username);
    }
  }, [username, fetchUserProfile]);

  const fetchUserItems = async (uid: string) => {
    const q = query(collection(db, "items"), where("sellerId", "==", uid));
    const querySnapshot = await getDocs(q);
    const items = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...doc.data(),
        imageUrl:
          Array.isArray(data.photos) && data.photos.length > 0
            ? data.photos[0]
            : "",
        name: data.title,
      };
    });
    setUserItems(items);

    // Update the activeListings count in the sellingInfo state
  };

  const fetchSoldItems = async (uid: string) => {
    // Placeholder for sold items fetch
    setSoldItems([]);
  };

  const fetchRecentReviews = async (uid: string) => {
    try {
      const reviewsRef = collection(db, "users", uid, "ratings");
      const q = query(reviewsRef, orderBy("timestamp", "desc"), limit(3));
      const querySnapshot = await getDocs(q);

      const reviews = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Get total count
      const allReviewsSnapshot = await getDocs(
        collection(db, "users", uid, "ratings")
      );
      setTotalReviews(allReviewsSnapshot.size);

      setRecentReviews(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setRecentReviews([]);
      setTotalReviews(0);
    }
  };

  if (isLoading) {
    return <div className="profile-loading">Loading...</div>;
  }

  if (!userProfile) {
    return null;
  }

  const FALLBACK_IMAGE =
    "https://via.placeholder.com/400x400.png?text=No+Image";

  const formatPrice = (price?: number | string) => {
    if (price === undefined || price === null) return "Price unavailable";
    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice)) {
      return "Price unavailable";
    }
    return `$${numericPrice.toFixed(2)}`;
  };

  const formatDate = (value?: string) => {
    if (!value) return "Unknown";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }
    return parsed.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
    });
  };

  const safeBio = userProfile.bio?.trim()
    ? userProfile.bio
    : "This seller hasn’t added a bio yet.";

  const renderItemSection = (
    title: string,
    items: any[],
    emptyMessage: string
  ) => (
    <section className="profile-section">
      <div className="profile-section-header">
        <h2>{title}</h2>
        {title === "Items for sale" && items.length > 0 && (
          <span className="profile-section-note">
            {items.length} listing{items.length === 1 ? "" : "s"}
          </span>
        )}
      </div>
      {items.length > 0 ? (
        <div className="profile-item-grid">
          {items.map((item) => (
            <Link
              key={item.id}
              to={`/item/${item.id}`}
              className="profile-item-card"
            >
              <div className="profile-item-image">
                <img
                  src={item.imageUrl || FALLBACK_IMAGE}
                  alt={item.name || "Item"}
                />
              </div>
              <div className="profile-item-body">
                <h3 title={item.name || "Untitled"}>
                  {item.name || "Untitled"}
                </h3>
                <p>{formatPrice(item.price)}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="profile-empty-state">{emptyMessage}</p>
      )}
    </section>
  );

  return (
    <div className="profile-page">
      <section className="profile-hero">
        <div className="profile-hero-media">
          {userProfile.photoURL ? (
            <img src={userProfile.photoURL} alt={userProfile.username} />
          ) : (
            <div className="profile-hero-placeholder">
              <AccountCircleIcon />
            </div>
          )}
        </div>
        <div className="profile-hero-content">
          <div className="profile-hero-top">
            <div>
              <p className="profile-hero-eyebrow">Seller Profile</p>
              <h1>{userProfile.name || userProfile.username}</h1>
              {userProfile.username && (
                <p className="profile-username">@{userProfile.username}</p>
              )}
            </div>
            {profileUserId && (
              <button
                className="profile-secondary-btn"
                onClick={() => {
                  if (!currentUserId) {
                    navigate("/signin", {
                      state: { redirectTo: `/messages/${profileUserId}` },
                    });
                    return;
                  }
                  navigate(`/messages/${profileUserId}`);
                }}
              >
                Message seller
              </button>
            )}
          </div>
          <div className="profile-meta-row">
            <div className="profile-rating">
              <StarRating rating={userProfile.rating || 0} />
              <span className="profile-rating-value">
                {userProfile.rating ? userProfile.rating.toFixed(1) : "New"}
              </span>
              <span className="profile-rating-count">
                {userProfile.reviews || 0} review
                {userProfile.reviews === 1 ? "" : "s"}
              </span>
            </div>
            {userProfile.creationDate && (
              <span className="profile-join-date">
                Member since {formatDate(userProfile.creationDate)}
              </span>
            )}
          </div>
          <div className="profile-bio-card">
            <h3>About this seller</h3>
            <p>{safeBio}</p>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="profile-section">
        <div className="profile-section-header">
          <h2>Reviews</h2>
          {totalReviews > 0 && (
            <span className="profile-section-note">
              {totalReviews} review{totalReviews === 1 ? "" : "s"}
            </span>
          )}
        </div>
        {recentReviews.length > 0 ? (
          <div className="reviews-container">
            {recentReviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <div className="review-rater">
                    <span className="review-rater-name">
                      {review.raterName || "Anonymous"}
                    </span>
                    <StarRating rating={review.rating || 0} />
                  </div>
                  <span className="review-date">
                    {review.timestamp?.toDate
                      ? review.timestamp.toDate().toLocaleDateString()
                      : "Recently"}
                  </span>
                </div>
                {review.review && (
                  <p className="review-text">{review.review}</p>
                )}
                {review.itemName && (
                  <p className="review-item">
                    For:{" "}
                    <Link to={`/item/${review.itemId}`}>{review.itemName}</Link>
                  </p>
                )}
              </div>
            ))}
            {totalReviews > 3 && (
              <div className="reviews-footer">
                <button
                  className="view-all-reviews-btn"
                  onClick={() => navigate(`/user/${username}/reviews`)}
                >
                  View All Reviews ({totalReviews})
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="profile-empty-state">
            This seller hasn't received any reviews yet.
          </p>
        )}
      </section>

      {renderItemSection(
        "Items for sale",
        userItems,
        "This seller hasn't listed any items yet."
      )}

      {renderItemSection(
        "Recently sold",
        soldItems,
        "This seller hasn't sold any items yet."
      )}
    </div>
  );
};

export default PublicProfile;
