import React, { useEffect, useState } from "react";
import { db } from "../firebase-config";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import "../css/infoPages.css";
import { Alert, CircularProgress, Box } from "@mui/material";

interface StripeAccountInfo {
  hasAccount: boolean;
  accountId?: string;
  charges_enabled?: boolean;
  payouts_enabled?: boolean;
  details_submitted?: boolean;
  balance?: Array<{ amount: number; currency: string }>;
  transaction_count?: number;
}

const SettingsSellerDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    soldItems: 0,
    totalRevenue: 0,
  });
  const [stripeInfo, setStripeInfo] = useState<StripeAccountInfo | null>(null);
  const [loadingStripe, setLoadingStripe] = useState(true);
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
          if (data.listingStatus === "sold") {
            sold++;
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

    const fetchStripeInfo = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoadingStripe(false);
        return;
      }

      try {
        const response = await fetch(
          `https://us-central1-anithrift-e77a9.cloudfunctions.net/fetchStripeAccountInfo?userId=${user.uid}`
        );

        if (response.ok) {
          const data = await response.json();
          setStripeInfo(data);
        }
      } catch (error) {
        console.error("Error fetching Stripe info:", error);
      } finally {
        setLoadingStripe(false);
      }
    };

    fetchSellerStats();
    fetchStripeInfo();
  }, [auth.currentUser]);

  const calculateBalance = () => {
    if (!stripeInfo?.balance) return 0;
    return stripeInfo.balance.reduce(
      (sum, bal) => sum + (bal.amount || 0),
      0
    ) / 100;
  };

  const isStripeReady = () => {
    return (
      stripeInfo?.hasAccount &&
      stripeInfo?.charges_enabled &&
      stripeInfo?.payouts_enabled &&
      stripeInfo?.details_submitted
    );
  };

  return (
    <MainLayout>
      <div className="info-page-container">
        <h1>Seller Dashboard</h1>
        <div className="info-content">
          {!isStripeReady() && stripeInfo !== null && (
            <Alert
              severity={stripeInfo.hasAccount ? "warning" : "info"}
              sx={{ mb: 2 }}
            >
              {stripeInfo.hasAccount
                ? "Your Stripe account setup is incomplete. Complete onboarding to receive payments."
                : "Connect your Stripe account to receive payments from sales."}
              <br />
              <button
                className="primary-button"
                onClick={() => navigate("/settings/stripe-account")}
                style={{ marginTop: "10px" }}
              >
                {stripeInfo.hasAccount
                  ? "Complete Stripe Setup"
                  : "Connect Stripe Account"}
              </button>
            </Alert>
          )}

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

          {loadingStripe ? (
            <Box display="flex" justifyContent="center" py={2}>
              <CircularProgress size={24} />
            </Box>
          ) : stripeInfo?.hasAccount ? (
            <div
              style={{
                marginTop: "30px",
                padding: "20px",
                backgroundColor: "#f5f5f5",
                borderRadius: "8px",
              }}
            >
              <h2>Stripe Account</h2>
              <div style={{ marginTop: "15px" }}>
                <p>
                  <strong>Account Balance:</strong> ${calculateBalance().toFixed(2)}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  {isStripeReady() ? (
                    <span style={{ color: "green" }}>✓ Ready to receive payments</span>
                  ) : (
                    <span style={{ color: "orange" }}>⚠ Setup incomplete</span>
                  )}
                </p>
                {stripeInfo.transaction_count !== undefined && (
                  <p>
                    <strong>Transactions:</strong> {stripeInfo.transaction_count}
                  </p>
                )}
                <button
                  className="secondary-button"
                  onClick={() => navigate("/settings/stripe-account")}
                  style={{ marginTop: "15px" }}
                >
                  View Stripe Account Details
                </button>
              </div>
            </div>
          ) : (
            <div
              style={{
                marginTop: "30px",
                padding: "20px",
                backgroundColor: "#fff3cd",
                borderRadius: "8px",
                border: "1px solid #ffc107",
              }}
            >
              <h3>Payment Setup Required</h3>
              <p style={{ marginTop: "10px" }}>
                Connect your Stripe account to receive payments from sales. Your
                Stripe account will be created automatically when you list your first
                item, or you can set it up now.
              </p>
              <button
                className="primary-button"
                onClick={() => navigate("/settings/stripe-account")}
                style={{ marginTop: "15px" }}
              >
                Set Up Stripe Account
              </button>
            </div>
          )}

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
            <li>
              <a href="/addresses">Set Shipping Address</a>
            </li>
          </ul>
        </div>
      </div>
    </MainLayout>
  );
};

export default SettingsSellerDashboard;

