import React, { useState } from "react";
import { Rating } from "@mui/material";
import { getAuth } from "firebase/auth";
import {
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase-config";
import "../css/Feedback.css";

const FeedbackForm: React.FC = React.memo(() => {
  const auth = getAuth();

  const [rating, setRating] = useState<number | null>(0);
  const [category, setCategory] = useState<string>("general");
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!message.trim()) {
      setStatusMessage("Please share a bit of feedback before submitting.");
      return;
    }

    try {
      setSubmitting(true);
      setStatusMessage(null);
      const currentUser = auth.currentUser;

      const feedbackRef = doc(collection(db, "feedback"));
      await setDoc(feedbackRef, {
        createdAt: serverTimestamp(),
        uid: currentUser?.uid || null,
        email: email.trim() || currentUser?.email || "",
        category,
        message: message.trim(),
        rating: rating || 0,
        source: "public-feedback",
      });

      setMessage("");
      setRating(0);
      setStatusMessage("Thank you! Your feedback has been submitted.");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setStatusMessage(
        "We couldn't submit your feedback right now. Please try again later."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="feedback-page">
      <div className="feedback-card">
        <h1>Share Your Feedback</h1>
        <p>
          Let us know how we’re doing. Your feedback helps us improve the
          AniThrift experience for buyers and sellers alike.
        </p>

        <form className="feedback-form" onSubmit={handleSubmit}>
          <div className="feedback-rating-row">
            <label htmlFor="feedback-rating">Overall experience</label>
            <Rating
              id="feedback-rating"
              name="feedback-rating"
              value={rating}
              precision={0.5}
              onChange={(_event, newValue) => setRating(newValue)}
            />
          </div>

          <div className="feedback-form-row">
            <label htmlFor="feedback-category">What is this about?</label>
            <select
              id="feedback-category"
              className="feedback-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="general">General feedback</option>
              <option value="bug">Bug report</option>
              <option value="feature">Feature request</option>
              <option value="seller-experience">Selling experience</option>
              <option value="buyer-experience">Buying experience</option>
              <option value="shipping">Shipping & fulfillment</option>
            </select>
          </div>

          <div className="feedback-form-row">
            <label htmlFor="feedback-email">Email (optional)</label>
            <input
              id="feedback-email"
              type="email"
              className="feedback-input"
              placeholder="We’ll follow up if you’d like."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="feedback-form-row">
            <label htmlFor="feedback-message">Share your thoughts</label>
            <textarea
              id="feedback-message"
              className="feedback-textarea"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              placeholder="Tell us what you love or what we can do better..."
            />
          </div>

          <button
            type="submit"
            className="feedback-submit-button"
            disabled={submitting}
          >
            {submitting ? "Sending..." : "Submit Feedback"}
          </button>
        </form>

        {statusMessage && (
          <p className="feedback-status-message">{statusMessage}</p>
        )}
      </div>
    </div>
  );
});

FeedbackForm.displayName = "FeedbackForm";

export default FeedbackForm;
