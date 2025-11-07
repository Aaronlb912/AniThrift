import React, { useState, useEffect, useMemo, useCallback } from "react";
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
import { collection, getDocs, doc, getDoc, DocumentReference } from "firebase/firestore";

interface Item {
  id: string;
  imageUrl: string;
  name: string;
  price: string;
}

const App: React.FC = () => {
  const [user] = useAuthState(auth);
  const [watchListItems, setWatchListItems] = useState<Item[]>([]);

  const fetchWatchListItems = useCallback(async (uid: string) => {
    try {
      const watchlistRef = collection(db, "users", uid, "watchlist");
      const querySnapshot = await getDocs(watchlistRef);
      const items = (
        await Promise.all(
          querySnapshot.docs.map(async (docSnapshot) => {
            const itemRef = docSnapshot.data().ref as DocumentReference | undefined;
            if (!itemRef) return null;

            const itemSnapshot = await getDoc(itemRef);
            if (itemSnapshot.exists()) {
              const data = itemSnapshot.data();
              return {
                id: itemSnapshot.id,
                name: data.name || "",
                price: data.price || "",
                imageUrl: Array.isArray(data.photos) && data.photos.length > 0 
                  ? data.photos[0] 
                  : "",
              } as Item;
            }
            return null;
          })
        )
      ).filter((item): item is Item => item !== null);
      setWatchListItems(items);
    } catch (error) {
      console.error("Error fetching watchlist items:", error);
      setWatchListItems([]);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchWatchListItems(user.uid);
    }
  }, [user, fetchWatchListItems]);

  const defaultCarouselItems = useMemo(
    () => [
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
    ],
    []
  );

  const userCarouselItems = useMemo(
    () => [
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
    ],
    []
  );

  const carouselItems = user ? userCarouselItems : defaultCarouselItems;

  return (
    <div className="background">
      <div className="homepage">
        <div className="slideshow">
          <Slider autoplay autoplaySpeed={5000} speed={1000}>
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
        </div>
        <div className="first-carousel">
          <h2>{user ? "Picks for You" : "Recent Uploads"}</h2>
          <Carousel items={carouselItems} />
        </div>
        <div className="Second-carousel">
          <h2>{user ? "Your Recent Categories" : "Popular Items"}</h2>
          <Carousel items={carouselItems} />
        </div>
        {user && watchListItems.length > 0 && (
          <div className="Liked items">
            <h2>Saved Items</h2>
            <Carousel items={watchListItems} />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
