import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getAuth } from "firebase/auth";
import MainLayout from "../components/MainLayout";
import "../css/infoPages.css";
import { Alert, CircularProgress, Box, Typography } from "@mui/material";

interface StripeAccountInfo {
  hasAccount: boolean;
  accountId?: string;
  charges_enabled?: boolean;
  payouts_enabled?: boolean;
  details_submitted?: boolean;
  balance?: Array<{ amount: number; currency: string }>;
  transaction_count?: number;
  message?: string;
}

const SettingsStripeAccount: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const auth = getAuth();
  const [accountInfo, setAccountInfo] = useState<StripeAccountInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccountInfo = async () => {
      const user = auth.currentUser;
      if (!user) {
        setError("You must be logged in to view your Stripe account.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://us-central1-anithrift-e77a9.cloudfunctions.net/fetchStripeAccountInfo?userId=${user.uid}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch Stripe account info");
        }

        const data = await response.json();
        setAccountInfo(data);
      } catch (err: any) {
        console.error("Error fetching Stripe account info:", err);
        setError(err.message || "Failed to load Stripe account information");
      } finally {
        setLoading(false);
      }
    };

    fetchAccountInfo();

    // Check for success/refresh params from Stripe redirect
    if (searchParams.get("success") === "true") {
      // Refresh account info after successful onboarding
      setTimeout(() => {
        fetchAccountInfo();
      }, 2000);
    }
  }, [auth.currentUser, searchParams]);

  const handleConnectAccount = () => {
    navigate("/StripeOnboardingForm");
  };

  const handleCompleteOnboarding = () => {
    navigate("/StripeOnboardingForm");
  };

  const getStripeDashboardUrl = (accountId: string) => {
    return `https://dashboard.stripe.com/connect/accounts/${accountId}`;
  };

  const calculateBalance = () => {
    if (!accountInfo?.balance) return 0;
    return accountInfo.balance.reduce(
      (sum, bal) => sum + (bal.amount || 0),
      0
    ) / 100;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="info-page-container">
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
            <CircularProgress />
          </Box>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="info-page-container">
        <h1>Stripe Account</h1>
        <div className="info-content">
          {searchParams.get("success") === "true" && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Stripe account onboarding completed successfully!
            </Alert>
          )}

          {searchParams.get("refresh") === "true" && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Please complete your Stripe account setup to receive payments.
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {!accountInfo?.hasAccount ? (
            <>
              <p>
                Connect your Stripe account to receive payments from sales on
                AniThrift.
              </p>
              <h2>Why Connect Stripe?</h2>
              <ul>
                <li>Receive payments directly to your bank account</li>
                <li>Secure payment processing</li>
                <li>Fast and reliable transfers</li>
                <li>Automatic payouts after each sale</li>
              </ul>
              <button
                className="primary-button"
                onClick={handleConnectAccount}
                style={{ marginTop: "20px" }}
              >
                Connect Stripe Account
              </button>
              <p style={{ marginTop: "20px", fontSize: "14px", color: "#666" }}>
                Your Stripe account will be created automatically when you list your first item.
                You can also connect it now to be ready to receive payments.
              </p>
            </>
          ) : (
            <>
              <div style={{ marginBottom: "30px" }}>
                <h2>Account Status</h2>
                <div style={{ marginTop: "15px" }}>
                  <Typography variant="body1" style={{ marginBottom: "10px" }}>
                    <strong>Account ID:</strong> {accountInfo.accountId}
                  </Typography>
                  <Typography variant="body1" style={{ marginBottom: "10px" }}>
                    <strong>Charges Enabled:</strong>{" "}
                    {accountInfo.charges_enabled ? (
                      <span style={{ color: "green" }}>✓ Yes</span>
                    ) : (
                      <span style={{ color: "red" }}>✗ No</span>
                    )}
                  </Typography>
                  <Typography variant="body1" style={{ marginBottom: "10px" }}>
                    <strong>Payouts Enabled:</strong>{" "}
                    {accountInfo.payouts_enabled ? (
                      <span style={{ color: "green" }}>✓ Yes</span>
                    ) : (
                      <span style={{ color: "red" }}>✗ No</span>
                    )}
                  </Typography>
                  <Typography variant="body1" style={{ marginBottom: "10px" }}>
                    <strong>Details Submitted:</strong>{" "}
                    {accountInfo.details_submitted ? (
                      <span style={{ color: "green" }}>✓ Yes</span>
                    ) : (
                      <span style={{ color: "orange" }}>⚠ Incomplete</span>
                    )}
                  </Typography>
                </div>
              </div>

              {accountInfo.balance && (
                <div style={{ marginBottom: "30px" }}>
                  <h2>Account Balance</h2>
                  <Typography variant="h4" style={{ marginTop: "10px", color: "#1976d2" }}>
                    ${calculateBalance().toFixed(2)}
                  </Typography>
                  <Typography variant="body2" style={{ marginTop: "5px", color: "#666" }}>
                    Available balance in your Stripe account
                  </Typography>
                </div>
              )}

              {accountInfo.transaction_count !== undefined && (
                <div style={{ marginBottom: "30px" }}>
                  <h2>Transaction History</h2>
                  <Typography variant="body1" style={{ marginTop: "10px" }}>
                    <strong>Total Transactions:</strong> {accountInfo.transaction_count}
                  </Typography>
                </div>
              )}

              {!accountInfo.details_submitted || !accountInfo.payouts_enabled ? (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Your Stripe account setup is incomplete. Please complete onboarding to
                  receive payments.
                  <br />
                  <button
                    className="primary-button"
                    onClick={handleCompleteOnboarding}
                    style={{ marginTop: "10px" }}
                  >
                    Complete Onboarding
                  </button>
                </Alert>
              ) : (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Your Stripe account is fully set up and ready to receive payments!
                </Alert>
              )}

              <div style={{ marginTop: "30px" }}>
                <h2>Manage Your Account</h2>
                <p>
                  You can manage your Stripe account settings, view detailed transaction
                  history, and configure payout schedules through the Stripe dashboard.
                </p>
                {accountInfo.accountId && (
                  <a
                    href={getStripeDashboardUrl(accountInfo.accountId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="primary-button"
                    style={{
                      display: "inline-block",
                      marginTop: "15px",
                      textDecoration: "none",
                    }}
                  >
                    Open Stripe Dashboard
                  </a>
                )}
              </div>

              <div style={{ marginTop: "30px", padding: "15px", backgroundColor: "#f5f5f5", borderRadius: "5px" }}>
                <h3>Payment Information</h3>
                <p style={{ fontSize: "14px", marginTop: "10px" }}>
                  When a buyer purchases your items, payments are processed through Stripe.
                  The platform takes a 10% commission (minimum $1.00) and the remaining
                  amount is automatically transferred to your Stripe account.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default SettingsStripeAccount;

