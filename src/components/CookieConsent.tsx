import React, { useEffect, useState } from "react";
import "../css/CookieConsent.css";

export const COOKIE_CONSENT_STORAGE_KEY = "anithrift_cookie_consent";
export const COOKIE_PREFERENCES_STORAGE_KEY = "anithrift_cookie_preferences";
export const CONSENT_VERSION = "2024-11-10";

export type CookiePreferences = {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
};

type ConsentState = {
  status: "accepted" | "declined";
  version: string;
  timestamp: number;
};

const CookieConsent: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
      if (!stored) {
        setVisible(true);
        return;
      }

      const parsed: ConsentState | null = JSON.parse(stored);
      if (!parsed || parsed.version !== CONSENT_VERSION) {
        setVisible(true);
      }
    } catch (error) {
      console.error("Error reading cookie consent from storage", error);
      setVisible(true);
    }
  }, []);

  const recordConsent = (status: "accepted" | "declined") => {
    if (typeof window !== "undefined") {
      try {
        const payload: ConsentState = {
          status,
          version: CONSENT_VERSION,
          timestamp: Date.now(),
        };
        window.localStorage.setItem(
          COOKIE_CONSENT_STORAGE_KEY,
          JSON.stringify(payload)
        );
        const preferences: CookiePreferences =
          status === "accepted"
            ? { essential: true, analytics: true, marketing: true, functional: true }
            : { essential: true, analytics: false, marketing: false, functional: false };
        window.localStorage.setItem(
          COOKIE_PREFERENCES_STORAGE_KEY,
          JSON.stringify(preferences)
        );
      } catch (error) {
        console.error("Error saving cookie consent to storage", error);
      }
    }
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <div className="cookie-consent">
      <div className="cookie-consent__content">
        <div>
          <h2>We value your privacy</h2>
          <p>
            AniThrift uses cookies to keep you signed in, remember your preferences,
            and understand how the marketplace is used. You can manage your
            preferences in cookie settings at any time.
          </p>
        </div>
        <div className="cookie-consent__actions">
          <a className="cookie-consent__link" href="/cookie-settings">
            Cookie Settings
          </a>
          <button
            className="cookie-consent__button cookie-consent__button--decline"
            type="button"
            onClick={() => recordConsent("declined")}
          >
            Decline
          </button>
          <button
            className="cookie-consent__button"
            type="button"
            onClick={() => recordConsent("accepted")}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
