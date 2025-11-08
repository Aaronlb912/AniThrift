import React, { useEffect, useState } from "react";
import { db } from "../firebase-config";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import "../css/infoPages.css";

const SettingsFavorites: React.FC = () => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const fetchFavorites = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        // Assuming favorites are stored in user's subcollection
        const favoritesRef = collection(db, "users", user.uid, "favorites");
        const querySnapshot = await getDocs(favoritesRef);
        const favoritesList: any[] = [];

        for (const doc of querySnapshot.docs) {
          const favoriteData = doc.data();
          // Fetch item details if needed
          favoritesList.push({
            id: doc.id,
            ...favoriteData,
          });
        }

        setFavorites(favoritesList);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    };

    fetchFavorites();
  }, [auth.currentUser]);

  return (
    <MainLayout>
      <div className="info-page-container">
      <h1>Favorites</h1>
      <div className="info-content">
        {favorites.length === 0 ? (
          <p>You don't have any favorite items yet.</p>
        ) : (
          <div className="favorites-grid">
            {favorites.map((favorite) => (
              <div
                key={favorite.id}
                className="favorite-item"
                onClick={() => navigate(`/item/${favorite.itemId}`)}
              >
                {favorite.imageUrl && (
                  <img src={favorite.imageUrl} alt={favorite.title} />
                )}
                <h3>{favorite.title}</h3>
                <p>${favorite.price}</p>
              </div>
            ))}
          </div>
        )}
        <button
          className="primary-button"
          onClick={() => navigate("/search")}
        >
          Browse Items
        </button>
      </div>
    </div>
    </MainLayout>
  );
};

export default SettingsFavorites;

