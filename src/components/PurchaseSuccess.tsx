import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../css/PurchaseSuccess";

const PurchaseSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check if there are pending checkout sessions
    const pendingSessions = sessionStorage.getItem('pendingCheckoutSessions');
    const currentIndex = parseInt(sessionStorage.getItem('currentCheckoutIndex') || '0');
    const totalSessions = parseInt(sessionStorage.getItem('totalCheckoutSessions') || '1');

    if (pendingSessions) {
      try {
        const sessions: string[] = JSON.parse(pendingSessions);
        
        if (sessions.length > 0) {
          // Update index and remove first session
          const nextIndex = currentIndex + 1;
          const remainingSessions = sessions.slice(1);
          
          if (remainingSessions.length > 0) {
            sessionStorage.setItem('pendingCheckoutSessions', JSON.stringify(remainingSessions));
            sessionStorage.setItem('currentCheckoutIndex', nextIndex.toString());
            
            // Redirect to next checkout session
            setTimeout(() => {
              window.location.href = sessions[0];
            }, 2000);
            
            return;
          } else {
            // All sessions completed
            sessionStorage.removeItem('pendingCheckoutSessions');
            sessionStorage.removeItem('currentCheckoutIndex');
            sessionStorage.removeItem('totalCheckoutSessions');
          }
        }
      } catch (error) {
        console.error("Error processing pending sessions:", error);
        sessionStorage.removeItem('pendingCheckoutSessions');
        sessionStorage.removeItem('currentCheckoutIndex');
        sessionStorage.removeItem('totalCheckoutSessions');
      }
    }

    // If no pending sessions, redirect to orders after a delay
    setTimeout(() => {
      navigate("/orders");
    }, 3000);
  }, [navigate]);

  const pendingSessions = sessionStorage.getItem('pendingCheckoutSessions');
  const currentIndex = parseInt(sessionStorage.getItem('currentCheckoutIndex') || '0');
  const totalSessions = parseInt(sessionStorage.getItem('totalCheckoutSessions') || '1');
  const hasMoreSessions = pendingSessions && JSON.parse(pendingSessions).length > 0;

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>Payment Successful!</h1>
      {hasMoreSessions && (
        <div style={{ marginTop: "20px" }}>
          <p>
            Processing checkout {currentIndex + 1} of {totalSessions}...
          </p>
          <p>Redirecting to next seller's checkout...</p>
        </div>
      )}
      {!hasMoreSessions && (
        <div style={{ marginTop: "20px" }}>
          <p>Your order has been processed successfully!</p>
          <p>Redirecting to your orders...</p>
        </div>
      )}
    </div>
  );
};

export default PurchaseSuccess;
