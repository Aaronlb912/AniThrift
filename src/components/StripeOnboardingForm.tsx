import React, { useEffect, useState } from "react";
import { auth } from "../firebase-config";
import { useNavigate } from "react-router-dom";
import { CircularProgress, Box, Typography, Alert } from "@mui/material";
import MainLayout from "./MainLayout";

const StripeOnboardingForm: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // User is signed in, now you can proceed with fetching the onboarding link
        await startOnboarding(user.uid);
      } else {
        // User is signed out
        setError("You must be logged in to set up your Stripe account.");
        setLoading(false);
      }
    });

    return () => unsubscribe(); // Cleanup subscription on component unmount
  }, []);

  const startOnboarding = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      // First, check if user has a Stripe account, if not create one
      const accountCheckResponse = await fetch(
        `https://us-central1-anithrift-e77a9.cloudfunctions.net/fetchStripeAccountInfo?userId=${userId}`
      );

      let stripeAccountId: string | null = null;

      if (accountCheckResponse.ok) {
        const accountData = await accountCheckResponse.json();
        if (accountData.hasAccount && accountData.accountId) {
          stripeAccountId = accountData.accountId;
        }
      }

      // If no account exists, create one first
      if (!stripeAccountId) {
        // Create a placeholder item to trigger account creation
        // The function will create the account and return the onboarding URL
        const createAccountResponse = await fetch(
          "https://us-central1-anithrift-e77a9.cloudfunctions.net/createStripeAccountOnFirstItem",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              item: {
                sellerId: userId,
              },
            }),
          }
        );

        if (!createAccountResponse.ok) {
          const errorData = await createAccountResponse.json();
          throw new Error(
            errorData.message || "Failed to create Stripe account"
          );
        }

        const createAccountData = await createAccountResponse.json();

        // If onboarding URL is provided, use it
        if (createAccountData.onboardingUrl) {
          window.location.href = createAccountData.onboardingUrl;
          return;
        }

        stripeAccountId = createAccountData.stripeAccountId;
      }

      // Get onboarding link for existing account
      const response = await fetch(
        "https://us-central1-anithrift-e77a9.cloudfunctions.net/completeStripeOnboarding",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to start onboarding process"
        );
      }

      const { url } = await response.json();

      if (!url) {
        throw new Error("No onboarding URL received from server");
      }

      // Redirect to the Stripe Account Link URL
      window.location.href = url;
    } catch (err: any) {
      console.error("Failed to start onboarding:", err);
      setError(
        err.message ||
          "Failed to start onboarding process. Please try again later."
      );
      setLoading(false);
    }
  };

  if (error) {
    return (
      <MainLayout>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
          px={2}
        >
          <Alert severity="error" sx={{ mb: 2, maxWidth: "600px" }}>
            {error}
          </Alert>
          <button
            className="primary-button"
            onClick={() => navigate("/settings/stripe-account")}
          >
            Go Back to Stripe Settings
          </button>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Setting up your Stripe account...
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
          You will be redirected to Stripe to complete the setup process.
        </Typography>
      </Box>
    </MainLayout>
  );
};

export default StripeOnboardingForm;
