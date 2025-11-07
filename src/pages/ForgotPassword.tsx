import React, { useState } from "react";
import { auth } from "../firebase-config";
import { sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "../css/Signin.css";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    if (!email.trim()) {
      setError("Please enter your email address.");
      setLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSuccess(true);
      setEmail("");
    } catch (error: any) {
      console.error("Password reset error:", error);
      if (error.code === "auth/user-not-found") {
        setError("No account found with this email address.");
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError("An error occurred. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-register">
      <h1>Reset Password</h1>
      <div className="container">
        <div className="returning-user" style={{ maxWidth: "500px", margin: "0 auto" }}>
          <h2>Forgot Your Password?</h2>
          <p>
            Enter your email address and we'll send you a link to reset your password.
          </p>
          {success ? (
            <div style={{ marginTop: "20px" }}>
              <p style={{ color: "#4caf50", fontWeight: "bold" }}>
                Password reset email sent!
              </p>
              <p style={{ marginTop: "10px" }}>
                Please check your email inbox and follow the instructions to reset your password.
              </p>
              <button
                onClick={() => navigate("/signin")}
                style={{ marginTop: "20px" }}
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                required
                disabled={loading}
              />
              <button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
              {error && <p className="error-message">{error}</p>}
              <div style={{ marginTop: "20px", textAlign: "center" }}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/signin");
                  }}
                  className="forgot-password"
                >
                  Back to Sign In
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

