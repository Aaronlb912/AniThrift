import React, { useEffect, useState } from "react";
import { db } from "../firebase-config";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import "../css/infoPages.css";

const SettingsSellerDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    soldItems: 0,
    totalRevenue: 0,
  });
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const fetchSellerStats = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const itemsRef = collection(db, "items");
        const q = query(itemsRef, where("sellerId", "==", user.uid));
        const querySnapshot = await getDocs(q);

        let active = 0;
        let sold = 0;
        let revenue = 0;

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.listingStatus === "selling") {
            active++;
          }
          // Add logic to calculate sold items and revenue if you track that
        });

        setStats({
          totalListings: querySnapshot.size,
          activeListings: active,
          soldItems: sold,
          totalRevenue: revenue,
        });
      } catch (error) {
        console.error("Error fetching seller stats:", error);
      }
    };

    fetchSellerStats();
  }, [auth.currentUser]);

  return (
    <MainLayout>
      <div className="info-page-container">
      <h1>Seller Dashboard</h1>
      <div className="info-content">
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Total Listings</h3>
            <p className="stat-number">{stats.totalListings}</p>
          </div>
          <div className="stat-card">
            <h3>Active Listings</h3>
            <p className="stat-number">{stats.activeListings}</p>
          </div>
          <div className="stat-card">
            <h3>Sold Items</h3>
            <p className="stat-number">{stats.soldItems}</p>
          </div>
          <div className="stat-card">
            <h3>Total Revenue</h3>
            <p className="stat-number">${stats.totalRevenue.toFixed(2)}</p>
          </div>
        </div>
        <div className="dashboard-actions">
          <button
            className="primary-button"
            onClick={() => navigate("/sell")}
          >
            Create New Listing
          </button>
          <button
            className="secondary-button"
            onClick={() => navigate("/profile")}
          >
            View My Listings
          </button>
        </div>
        <h2>Quick Links</h2>
        <ul className="dashboard-links">
          <li>
            <a href="/sell">List a New Item</a>
          </li>
          <li>
            <a href="/orders">View Orders</a>
          </li>
          <li>
            <a href="/messages">Messages</a>
          </li>
          <li>
            <a href="/settings/stripe-account">Payment Setup</a>
          </li>
        </ul>
      </div>
    </div>
    </MainLayout>
  );
};

export default SettingsSellerDashboard;

