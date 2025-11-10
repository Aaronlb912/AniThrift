import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { db } from "../firebase-config";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import "../css/Profile.css";
import StarRating from "../components/StarRating";
import ReviewsSection from "../components/ReviewSection";
import { Carousel } from "../components/Carousel"; // Adjust the path as necessary
import { getAuth, onAuthStateChanged } from "firebase/auth";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

interface UserProfile {
  name: string;
  username: string;
  uid: string;
  photoURL: string;
  rating: number;
  reviews: number;
  creationDate: string;
  bio: string;
}

interface SellingInfo {
  activeListings: number;
  sales: number;
  accountBalance: number;
}

const Profile: React.FC = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userItems, setUserItems] = useState<any[]>([]);
  const [watchListItems, setWatchListItems] = useState<any[]>([]);
  const [recentlyViewedItems, setRecentlyViewedItems] = useState<any[]>([]);
  const [draftItems, setDraftItems] = useState<any[]>([]);
  const [soldItems, setSoldItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [sellingInfo, setSellingInfo] = useState<SellingInfo>({
    activeListings: 0,
    sales: 0,
    accountBalance: 0,
  });

  const fetchStripeInfo = async (userId: string) => {
    const stripeInfoUrl = `https://us-central1-anithrift-e77a9.cloudfunctions.net/fetchStripeAccountInfo?userId=${userId}`;
    try {
      const response = await fetch(stripeInfoUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch Stripe account info");
      }
      const data = await response.json();
      setSellingInfo((prevInfo) => ({
        ...prevInfo,
        sales: data.transaction_count || 0,
        accountBalance:
          Array.isArray(data.balance)
            ? data.balance.reduce(
                (acc: number, curr: { amount: number }) => acc + (curr?.amount || 0),
                0
              ) / 100
            : 0,
      }));
    } catch (error) {
      console.error("Error fetching Stripe info:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoading(true);
        try {
          await Promise.all([
            fetchUserProfile(user.uid),
            fetchUserItems(user.uid),
            fetchWatchListItems(user.uid),
            fetchDraftItems(user.uid),
            fetchSoldItems(user.uid),
            fetchRecentlyViewedItems(user.uid),
          ]);
          await fetchStripeInfo(user.uid);
        } catch (error) {
          console.error("Error loading profile data:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        navigate("/signin");
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchUserProfile = async (uid: string) => {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setUserProfile(docSnap.data() as UserProfile);
    } else {
      console.error("No such document!");
    }
  };

  const fetchUserItems = async (uid: string) => {
    const q = query(collection(db, "users", uid, "items"));

    const querySnapshot = await getDocs(q);
    const itemsPromises = querySnapshot.docs.map(async (docSnapshot) => {
      // Assuming itemRef is directly a Firestore DocumentReference
      const itemRef = docSnapshot.data().ref; // This should be a DocumentReference if not a string
      if (!itemRef) return null; // Guard against missing or incorrect refs

      // Directly use the DocumentReference to fetch the document
      const itemSnapshot = await getDoc(itemRef);

      if (
        itemSnapshot.exists() &&
        itemSnapshot.data().listingStatus === "selling"
      ) {
        const data = itemSnapshot.data();
        return {
          id: itemSnapshot.id,
          ...data,
          imageUrl: data.photos && data.photos.length > 0 ? data.photos[0] : "", // Fallback to empty string if no photos
          name: data.title,
          // Add more fields as needed
        };
      } else {
        console.error("No such item for ref:", itemRef);
        return null;
      }
    });

    const resolvedItems = (await Promise.all(itemsPromises)).filter(
      (item) => item !== null
    );
    setUserItems(resolvedItems);

    // Update the state as necessary
    setSellingInfo((prevInfo) => ({
      ...prevInfo,
      activeListings: resolvedItems.length,
    }));
  };

  const fetchDraftItems = async (uid: string) => {
    const q = query(collection(db, "users", uid, "items"));

    const querySnapshot = await getDocs(q);
    const itemsPromises = querySnapshot.docs.map(async (docSnapshot) => {
      // Assuming itemRef is directly a Firestore DocumentReference
      const itemRef = docSnapshot.data().ref; // This should be a DocumentReference if not a string
      if (!itemRef) return null; // Guard against missing or incorrect refs

      // Directly use the DocumentReference to fetch the document
      const itemSnapshot = await getDoc(itemRef);

      if (
        itemSnapshot.exists() &&
        itemSnapshot.data().listingStatus === "draft"
      ) {
        const data = itemSnapshot.data();
        return {
          id: itemSnapshot.id,
          ...data,
          imageUrl: data.photos && data.photos.length > 0 ? data.photos[0] : "", // Fallback to empty string if no photos
          name: data.title,
          // Add more fields as needed
        };
      } else {
        console.error("No such item for ref:", itemRef);
        return null;
      }
    });

    const resolvedItems = (await Promise.all(itemsPromises)).filter(
      (item) => item !== null
    );
    setDraftItems(resolvedItems);
  };

  const fetchSoldItems = async (uid: string) => {
    const q = query(collection(db, "users", uid, "items"));

    const querySnapshot = await getDocs(q);
    const itemsPromises = querySnapshot.docs.map(async (docSnapshot) => {
      // Assuming itemRef is directly a Firestore DocumentReference
      const itemRef = docSnapshot.data().ref; // This should be a DocumentReference if not a string
      if (!itemRef) return null; // Guard against missing or incorrect refs

      // Directly use the DocumentReference to fetch the document
      const itemSnapshot = await getDoc(itemRef);

      if (
        itemSnapshot.exists() &&
        itemSnapshot.data().listingStatus === "sold"
      ) {
        const data = itemSnapshot.data();
        return {
          id: itemSnapshot.id,
          ...data,
          imageUrl: data.photos && data.photos.length > 0 ? data.photos[0] : "", // Fallback to empty string if no photos
          name: data.title,
          // Add more fields as needed
        };
      } else {
        console.error("No such item for ref:", itemRef);
        return null;
      }
    });

    const resolvedItems = (await Promise.all(itemsPromises)).filter(
      (item) => item !== null
    );
    setSoldItems(resolvedItems);
  };

  const fetchRecentlyViewedItems = async (uid: string) => {
    // Reference to the user's recently viewed items collection
    const recentlyViewedRef = collection(db, "users", uid, "recentlyViewed");

    // Fetch all documents from the recently viewed collection
    const querySnapshot = await getDocs(recentlyViewedRef);

    // Map over each document to fetch the referenced item details
    const itemsPromises = querySnapshot.docs.map(async (docSnapshot) => {
      // Get the reference to the item
      const itemRef = docSnapshot.data().ref;

      // Guard against missing or incorrect refs
      if (!itemRef) {
        console.error(
          "Missing or incorrect reference in recently viewed:",
          docSnapshot.id
        );
        return null;
      }

      // Use the item reference to fetch the item document
      const itemSnapshot = await getDoc(itemRef);

      if (itemSnapshot.exists()) {
        const data = itemSnapshot.data();
        return {
          id: itemSnapshot.id,
          ...data,
          imageUrl: data.photos && data.photos.length > 0 ? data.photos[0] : "", // Use the first photo as the image URL
          name: data.title,
          // Include any additional fields you need
        };
      } else {
        console.error("No such item for ref:", itemRef.path);
        return null;
      }
    });

    // Resolve the promises and filter out any null values
    const resolvedItems = (await Promise.all(itemsPromises)).filter(
      (item) => item !== null
    );

    // Update your state with the fetched items
    setRecentlyViewedItems(resolvedItems);
  };

  const fetchWatchListItems = async (uid: string) => {
    const watchlistRef = collection(db, "users", uid, "watchlist");
    const querySnapshot = await getDocs(watchlistRef);

    // Map over each document in the watchlist collection
    const itemsPromises = querySnapshot.docs.map(async (docSnapshot) => {
      // Retrieve the reference to the item from the watchlist document
      const itemRef = docSnapshot.data().ref;

      // Guard against missing or incorrect refs
      if (!itemRef) {
        console.error(
          "Missing or incorrect reference in watchlist:",
          docSnapshot.id
        );
        return null;
      }

      // Use the item reference to fetch the item document
      const itemSnapshot = await getDoc(itemRef);

      if (itemSnapshot.exists()) {
        const data = itemSnapshot.data();
        return {
          id: itemSnapshot.id,
          ...data,
          imageUrl: data.photos && data.photos.length > 0 ? data.photos[0] : "", // Use the first photo as the image URL
          name: data.title,
          // Include any additional fields you need
        };
      } else {
        console.error("No such item for ref:", itemRef.path);
        return null;
      }
    });

    // Await all promises and filter out any null values
    const resolvedItems = (await Promise.all(itemsPromises)).filter(
      (item) => item !== null
    );

    // Now resolvedItems contains all items from the user's watchlist
    // Here you would update your state or context with these items
    setWatchListItems(resolvedItems);
  };

  const FALLBACK_IMAGE = "https://via.placeholder.com/400x400.png?text=No+Image";

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

  const renderItemSection = (
    title: string,
    items: any[],
    emptyMessage: string
  ) => (
    <section className="profile-section">
      <div className="profile-section-header">
        <h2>{title}</h2>
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

  if (isLoading && !userProfile) {
    return <div className="profile-loading">Loading...</div>;
  }

  if (!userProfile) {
    return <div className="profile-loading">We couldn't load your profile.</div>;
  }

  const safeBio = userProfile.bio?.trim()
    ? userProfile.bio
    : "You haven’t added a bio yet. Share a little about your interests and what you love to collect!";

  return (
    <div className="profile-page">
      <section className="profile-hero">
        <div className="profile-hero-media">
          {userProfile.photoURL ? (
            <img src={userProfile.photoURL} alt="Profile" />
          ) : (
            <div className="profile-hero-placeholder">
              <AccountCircleIcon />
            </div>
          )}
        </div>
        <div className="profile-hero-content">
          <div className="profile-hero-top">
            <div>
              <p className="profile-hero-eyebrow">My Profile</p>
              <h1>{userProfile.name || "Welcome"}</h1>
              {userProfile.username && (
                <p className="profile-username">@{userProfile.username}</p>
              )}
            </div>
            <button
              className="profile-edit-btn"
              onClick={() => navigate("/edit-profile")}
            >
              Edit Profile
            </button>
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
            <span className="profile-join-date">
              Member since {formatDate(userProfile.creationDate)}
            </span>
          </div>
          <div className="profile-bio-card">
            <h3>About me</h3>
            <p>{safeBio}</p>
          </div>
        </div>
      </section>

      <section className="profile-stats">
        <div className="profile-stat-card">
          <p className="profile-stat-label">Active Listings</p>
          <p className="profile-stat-value">{sellingInfo.activeListings}</p>
        </div>
        <div className="profile-stat-card">
          <p className="profile-stat-label">Sales</p>
          <p className="profile-stat-value">{sellingInfo.sales}</p>
        </div>
        <div className="profile-stat-card">
          <p className="profile-stat-label">Account Balance</p>
          <p className="profile-stat-value">
            ${sellingInfo.accountBalance.toFixed(2)}
          </p>
        </div>
      </section>

      <section className="profile-section">
        <div className="profile-section-header">
          <h2>Recently viewed</h2>
          {recentlyViewedItems.length > 0 && (
            <Link to="/search" className="profile-link">
              Explore more items
            </Link>
          )}
        </div>
        {recentlyViewedItems.length > 0 ? (
          <div className="profile-carousel">
            <Carousel items={recentlyViewedItems} />
          </div>
        ) : (
          <p className="profile-empty-state">
            Browse the marketplace to discover pieces tailored to your fandoms.
          </p>
        )}
      </section>

      {renderItemSection(
        "Items I'm selling",
        userItems,
        "You do not have any items listed yet. List an item to start selling."
      )}

      {renderItemSection(
        "Watchlist",
        watchListItems,
        "You are not currently watching any items. Tap the heart on listings you love."
      )}

      {renderItemSection(
        "Draft listings",
        draftItems,
        "You do not have any items saved as drafts."
      )}

      {renderItemSection(
        "Recently sold",
        soldItems,
        "You haven’t sold any items yet."
      )}
    </div>
  );
};

export default Profile;
