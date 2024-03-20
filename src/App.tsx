import React, { useState, useEffect } from "react";
import "./App.css";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "./firebase-config";
import { Carousel } from "./components/Carousel";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ban1 from "./assets/ban1.jpeg";
import ban2 from "./assets/ban2.jpg";
import ban3 from "./assets/ban3.jpg";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

interface Item {
  id: string;
  imageUrl: string;
  name: string;
  price: string;
}

const App = () => {
  const [user, loading, error] = useAuthState(auth); // This hook comes from react-firebase-hooks
  const [watchListItems, setWatchListItems] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchWatchListItems(user.uid);
    }
  }, [user, navigate]);
  const fetchWatchListItems = async (uid: string) => {
    const watchlistRef = collection(db, "users", uid, "watchlist");
    const querySnapshot = await getDocs(watchlistRef);
    const items = (
      await Promise.all(
        querySnapshot.docs.map(async (docSnapshot) => {
          const itemRef = docSnapshot.data().ref;
          if (!itemRef) return null;

          const itemSnapshot = await getDoc(itemRef);
          if (itemSnapshot.exists()) {
            const { id: _, ...rest } = itemSnapshot.data() as Item; // Use _ to ignore the id from data, if it exists
            return {
              id: itemSnapshot.id, // Keep this id
              ...rest, // Spread the rest of the properties excluding the original id
              imageUrl: itemSnapshot.data().photos[0],
            };
          } else {
            return null;
          }
        })
      )
    ).filter((item): item is Item => item !== null);
    setWatchListItems(items);
  };

  const carouselItems = user
    ? [
        {
          imageUrl: "path/to/your/image1.jpg",
          name: "Product 1",
          price: "20",
        },
        {
          imageUrl: "path/to/your/image2.jpg",
          name: "Product 2",
          price: "30",
        },
      ] // Picks for the user
    : [
        {
          imageUrl: "path/to/your/image1.jpg",
          name: "New Product 1",
          price: "15",
        },
        {
          imageUrl: "path/to/your/image2.jpg",
          name: "New Product 2",
          price: "25",
        },
        {
          imageUrl: "path/to/your/image2.jpg",
          name: "New Product 2",
          price: "25",
        },
        {
          imageUrl: "path/to/your/image2.jpg",
          name: "New Product 2",
          price: "25",
        },
        {
          imageUrl: "path/to/your/image2.jpg",
          name: "New Product 2",
          price: "25",
        },
        {
          imageUrl: "path/to/your/image2.jpg",
          name: "New Product 2",
          price: "25",
        },
      ]; // New items for non-logged-in users

  return (
    <div className="background">
      <div className="homepage">
        <div className="slideshow">
          <Slider autoplay autoplaySpeed={3000}>
            <div>
              <img src={ban1} alt="News 1" />
            </div>
            <div>
              <img src={ban2} alt="Event 1" />
            </div>
            <div>
              <img src={ban3} alt="Discount 1" />
            </div>
            {/* Add more slides as needed */}
          </Slider>
        </div>{" "}
        {/* Image carousel */}
        <div className="first-carousel">
          <h2>{user ? "Picks for You" : "Recent Uploads"}</h2>
          <Carousel items={carouselItems} />
        </div>
        <div className="Second-carousel">
          <h2>{user ? "Your Recent Categories" : "Popular Items"}</h2>
          <Carousel items={carouselItems} />
        </div>
        <div className="Liked items">
          {user && watchListItems.length > 0 && (
            <>
              <h2>Saved Items</h2>
              <Carousel items={watchListItems} />
            </>
          )}
        </div>
        <div className="Liked items">
          {user && watchListItems.length > 0 && (
            <>
              <h2>another category????</h2>
              <Carousel items={carouselItems} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
