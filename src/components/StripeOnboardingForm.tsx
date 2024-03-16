import React, { useEffect } from "react";
import { auth } from "../firebase-config"; // Make sure this path matches your Firebase config file

const StripeOnboardingForm: React.FC = () => {
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in, now you can proceed with fetching the onboarding link
        startOnboarding(user.uid);
      } else {
        // User is signed out
        console.log("User not signed in");
      }
    });

    return () => unsubscribe(); // Cleanup subscription on component unmount
  }, []);

  const startOnboarding = async (userId: string) => {
    try {
      const response = await fetch(
        "https://us-central1-anithrift-e77a9.cloudfunctions.net/completeStripeOnboarding", // Adjust with your Cloud Function's URL
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        }
      );

      const { url } = await response.json();

      // Redirect to the Stripe Account Link URL
      window.location.href = url;
    } catch (error) {
      console.error("Failed to start onboarding:", error);
      alert("Failed to start onboarding process. Please try again later.");
    }
  };

  // The component merely serves as a trigger for the onboarding process.
  return <div>Loading onboarding...</div>;
};

export default StripeOnboardingForm;
