import React, { useEffect, useState } from "react";
import MainLayout from "../components/MainLayout";
import "../css/infoPages.css";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase-config";

const SettingsContentPreferences: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [allowAdultContent, setAllowAdultContent] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      setSuccessMessage(null);
      setError(null);

      if (currentUser) {
        setUserId(currentUser.uid);
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          const data = userDoc.data();
          const preferenceValue = Boolean(
            data?.preferences?.allowAdultContent
          );
          setAllowAdultContent(preferenceValue);
        } catch (err) {
          console.error("Error loading content preferences:", err);
          setError("We couldn't load your content preferences. Please try again.");
          setAllowAdultContent(false);
        } finally {
          setLoading(false);
        }
      } else {
        setUserId(null);
        setAllowAdultContent(false);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleToggle = async () => {
    if (!userId || saving) return;

    const previousValue = allowAdultContent;
    const newValue = !allowAdultContent;

    setAllowAdultContent(newValue);
    setSaving(true);
    setSuccessMessage(null);
    setError(null);

    try {
      await setDoc(
        doc(db, "users", userId),
        {
          preferences: {
            allowAdultContent: newValue,
          },
        },
        { merge: true }
      );
      setSuccessMessage(
        newValue
          ? "18+ marketplace items are now visible in your search results and carousels."
          : "18+ marketplace items will remain hidden."
      );
    } catch (err) {
      console.error("Error updating content preferences:", err);
      setAllowAdultContent(previousValue);
      setError("We couldn't save your preference. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="info-page-container">
        <h1>Content Preferences</h1>
        <div className="info-content">
          <p>
            Control which marketplace items appear in your AniThrift browsing
            experience. Adult-only listings are hidden by default to keep
            browsing family-friendly.
          </p>

          {loading ? (
            <div className="info-note">Loading your preferences…</div>
          ) : !userId ? (
            <div className="info-note">
              Please sign in to manage your content preferences.
            </div>
          ) : (
            <>
              <div className="permissions-list">
                <div className="permission-item">
                  <div>
                    <h3>Show 18+ Marketplace Items</h3>
                    <p>
                      Allow adult-only listings from AniThrift sellers to appear
                      in your search results, category pages, and homepage
                      carousels. When disabled, these items stay hidden.
                    </p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={allowAdultContent}
                      onChange={handleToggle}
                      disabled={saving}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
              {successMessage && (
                <p className="info-note" style={{ color: "var(--success-color)" }}>
                  {successMessage}
                </p>
              )}
              {error && (
                <p className="info-note" style={{ color: "var(--danger-color)" }}>
                  {error}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default SettingsContentPreferences;

