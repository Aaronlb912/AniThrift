import React, { useEffect, useState } from "react";
import "../css/infoPages.css";
import {
  COOKIE_PREFERENCES_STORAGE_KEY,
  COOKIE_CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
  CookiePreferences,
} from "../components/CookieConsent";

const defaultPreferences: CookiePreferences = {
  essential: true,
  analytics: false,
  marketing: false,
  functional: false,
};

const CookieSettings: React.FC = () => {
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const storedPreferences = window.localStorage.getItem(
        COOKIE_PREFERENCES_STORAGE_KEY
      );
      if (storedPreferences) {
        const parsed: CookiePreferences | null = JSON.parse(storedPreferences);
        if (parsed) {
          setPreferences({ ...defaultPreferences, ...parsed });
          return;
        }
      }

      const storedConsent = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
      if (storedConsent) {
        const consent = JSON.parse(storedConsent) as {
          status: "accepted" | "declined";
          version: string;
        };
        if (consent.version === CONSENT_VERSION && consent.status === "accepted") {
          setPreferences({ ...defaultPreferences, analytics: true, marketing: true, functional: true });
        }
      }
    } catch (error) {
      console.error("Error reading cookie preferences", error);
    }
  }, []);

  const handleToggle = (key: keyof CookiePreferences) => {
    if (key === "essential") return;
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        COOKIE_PREFERENCES_STORAGE_KEY,
        JSON.stringify(preferences)
      );
      const consentStatus =
        preferences.analytics || preferences.marketing || preferences.functional
          ? "accepted"
          : "declined";
      window.localStorage.setItem(
        COOKIE_CONSENT_STORAGE_KEY,
        JSON.stringify({
          status: consentStatus,
          version: CONSENT_VERSION,
          timestamp: Date.now(),
        })
      );
      setStatusMessage("Your cookie preferences have been saved.");
    } catch (error) {
      console.error("Error saving cookie preferences", error);
      setStatusMessage("We couldn't save your preferences. Please try again.");
    }
  };

  return (
    <div className="info-page-container">
      <h1>Cookie Settings</h1>
      <div className="info-content">
        <p>
          Manage your cookie preferences. You can enable or disable different
          types of cookies below.
        </p>
        <div className="cookie-settings">
          <div className="cookie-setting-item">
            <div>
              <h3>Essential Cookies</h3>
              <p>Required for the website to function properly. Cannot be disabled.</p>
            </div>
            <label className="cookie-toggle">
              <input type="checkbox" checked disabled />
              <span>Always On</span>
            </label>
          </div>
          <div className="cookie-setting-item">
            <div>
              <h3>Analytics Cookies</h3>
              <p>Help us understand how visitors interact with our website.</p>
            </div>
            <label className="cookie-toggle">
              <input
                type="checkbox"
                checked={preferences.analytics}
                onChange={() => handleToggle("analytics")}
              />
              <span>{preferences.analytics ? "On" : "Off"}</span>
            </label>
          </div>
          <div className="cookie-setting-item">
            <div>
              <h3>Marketing Cookies</h3>
              <p>Used to deliver personalized advertisements.</p>
            </div>
            <label className="cookie-toggle">
              <input
                type="checkbox"
                checked={preferences.marketing}
                onChange={() => handleToggle("marketing")}
              />
              <span>{preferences.marketing ? "On" : "Off"}</span>
            </label>
          </div>
          <div className="cookie-setting-item">
            <div>
              <h3>Functional Cookies</h3>
              <p>Enable enhanced functionality and personalization.</p>
            </div>
            <label className="cookie-toggle">
              <input
                type="checkbox"
                checked={preferences.functional}
                onChange={() => handleToggle("functional")}
              />
              <span>{preferences.functional ? "On" : "Off"}</span>
            </label>
          </div>
        </div>
        <div className="cookie-settings-actions">
          <button className="save-cookie-settings" onClick={handleSave}>
            Save Preferences
          </button>
        </div>
        {statusMessage && <p className="faq-footer">{statusMessage}</p>}
      </div>
    </div>
  );
};

export default CookieSettings;

