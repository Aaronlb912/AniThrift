import React, { useState } from "react";
import AppStore from "../assets/app-store-badge.png";
import PlayStore from "../assets/google-play-badge.png";
import Phones from "../assets/phones.png";
import placeholder from "../assets/accout_icon.png";

import "../css/Footer.css";

const Footer = () => {
  const [email, setEmail] = useState("");

  // Function to handle form submission
  const handleSubscribe = (e) => {
    e.preventDefault();
    // Here you would integrate with Mailchimp.
    // For direct API integration, you would send the email to Mailchimp's API.
    // For simplicity, you might just redirect to a Mailchimp signup form with the email pre-filled (if supported by Mailchimp).
    window.location.href = `YourMailchimpFormURL?email=${encodeURIComponent(
      email
    )}`;
  };

  return (
    <>
      {/* Newsletter subscription section */}
      <div className="newsletter-section">
        <h3>Join Our Newsletter</h3>
        <p>Sign up to receive updates and offers directly in your inbox.</p>
        <form onSubmit={handleSubscribe}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            required
          />
          <button type="submit">Subscribe</button>
        </form>
      </div>
      <appAd className="app-promotion-layer">
        <div className="app-image">
          <img src={Phones} alt="App on Phone" />
        </div>
        <div>
          <div className="app-ad-text">
            <h2>Discover a World of Anime Merchandise</h2>
            <h3>Anytime, Anywhere.</h3>
            <h3>Get the official app now!</h3>
            <br />
          </div>
          <div className="app-store-links">
            <div>
              <a href="apple-store-link">
                <img src={AppStore} alt="Download on the App Store" />
              </a>
            </div>
            <div>
              <a href="google-play-store-link">
                <img src={PlayStore} alt="Get it on Google Play" />
              </a>
            </div>
          </div>
        </div>
      </appAd>
      <footer className="footer-layer info-links">
        {/* Information About the Website */}
        <div className="info-section">
          <h2>AniThrift</h2>
          <a href="/about-us">About Us</a>
          <a href="/careers">Careers</a>
          <a href="/api">API</a>
        </div>

        {/* Help/Support */}
        <div className="help-section">
          <h2>Help Is Here</h2>
          <a href="/help-support">Help & Support</a>
          <a href="/feedback">Submit Feedback</a>
          <a href="/forum">Forum</a>
          <a href="/keyboard-shortcuts">Keyboard Shortcuts</a>
          <a href="/database-guidelines">Database Guidelines</a>
          <a href="/shipping">AniThrift Shipping</a>
        </div>

        {/* How to Become a Seller, etc. */}
        <div className="join-section">
          <h2>Join In</h2>
          <a href="/get-started">Get Started</a>
          <a href="/sign-up">Sign Up</a>
          <a href="/add-release">Add Release</a>
        </div>

        {/* Social Media Links */}
        <div className="social-media-section">
          <h2>Follow Us</h2>
          {/* Link and images for social media */}
          <a href="https://facebook.com/yourpage">
            <img src={placeholder} alt="Facebook" />
            <p>Facebook</p>
          </a>
          <a href="https://twitter.com/yourpage">
            <img src={placeholder} alt="Twitter" />
            <p>Twitter</p>
          </a>
          {/* Add more social media links */}
        </div>

        {/* App Store Links */}
        <div className="app-store-section">
          <h2>On The Go</h2>
          <a href="https://link-to-apple-store">
            <img
              src={AppStore}
              alt="Download on the App Store"
              classname="app-store-icon"
            />
          </a>
          <a href="https://link-to-google-play-store">
            <img
              src={PlayStore}
              alt="Get it on Google Play"
              className="app-store-icon"
            />
          </a>
        </div>
      </footer>
      <legal className="footer-layer legal-info">
        <img src={placeholder} alt="AniThrift Logo" className="footer-logo" />©
        2024 AniThrift
        <div className="legal-links">
          <a href="/cookie-settings">Cookie Settings</a>
          <a href="/cookie-policy">Cookie Policy</a>
          <a href="/terms-of-service">Terms of Service</a>
          <a href="/privacy-policy">Privacy Policy</a>
          <a href="/california-privacy-notice">California Privacy Notice</a>
          <a href="/accessibility-statement">Accessibility Statement</a>
        </div>
      </legal>
    </>
  );
};

export default Footer;
