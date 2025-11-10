import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { db } from "../firebase-config";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import "../css/Profile.css"; // You might want to reuse or create a new stylesheet
import StarRating from "../components/StarRating";
import { Carousel } from "../components/Carousel";
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
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setCurrentUserId(authUser ? authUser.uid : null);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (username) {
      setIsLoading(true);
      setUserProfile(null);
      fetchUserProfile(username);
    }
  }, [username, currentUserId]);

  const fetchUserProfile = async (username: string) => {
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
      const rating = typeof userData.rating === "number" ? userData.rating : 0;

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
    } catch (error) {
      console.error("Error loading seller profile:", error);
      navigate("/seller-not-found", { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

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
              <Link
                to={`/messages/${profileUserId}`}
                className="profile-secondary-btn"
              >
                Message seller
              </Link>
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

      {renderItemSection(
        "Items for sale",
        userItems,
        "This seller hasn’t listed any items yet."
      )}

      {renderItemSection(
        "Recently sold",
        soldItems,
        "This seller hasn’t sold any items yet."
      )}
    </div>
  );
};

export default PublicProfile;
