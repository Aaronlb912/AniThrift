import React, { useState } from "react";
// import AppStore from "../assets/app-store-badge.png";
// import PlayStore from "../assets/google-play-badge.png";
// import Phones from "../assets/phones.png";
import placeholder from "../assets/accout_icon.png";
import { Link } from "@mui/material";

import "../css/Footer.css";

const Footer: React.FC = () => {
  const [email, setEmail] = useState("");
  const currentYear = new Date().getFullYear();

  // Function to handle form submission
  const handleSubscribe = (e: React.FormEvent) => {
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
      {/* <div className="newsletter-section">
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
             <Link href="apple-store-link">
                <img src={AppStore} alt="Download on the App Store" />
              </a>
            </div>
            <div>
             <Link href="google-play-store-link">
                <img src={PlayStore} alt="Get it on Google Play" />
              </a>
            </div>
          </div>
        </div>
      </appAd> */}
      <footer className="footer-layer info-links">
        {/* Information About the Website */}
        <div className="info-section">
          <h2>AniThrift</h2>
          <Link href="/about-us">About Us</Link>
          <Link href="/careers">Careers</Link>
        </div>

        {/* Help/Support */}
        <div className="help-section">
          <h2>Help Is Here</h2>
          <Link href="/help-support">Help & Support</Link>
          <Link href="/feedback">Submit Feedback</Link>
          <Link href="/forum">Forum</Link>
          <Link href="/keyboard-shortcuts">Keyboard Shortcuts</Link>
          <Link href="/database-guidelines">Database Guidelines</Link>
          <Link href="/shipping">AniThrift Shipping</Link>
        </div>

        {/* Social Media Links */}
        {/* <div className="social-media-section">
          <h2>Follow Us</h2>
          <Link href="https://facebook.com/yourpage">Facebook</Link>
          <Link href="https://twitter.com/yourpage">Instagram</Link>
          <Link href="https://twitter.com/yourpage">TikTok</Link>
          <Link href="https://twitter.com/yourpage">LinkedIn</Link>
        </div> */}

        {/* App Store Links */}
        {/* <div className="app-store-section">
          <h2>On The Go</h2>
          <Link href="https://link-to-apple-store">
            <img
              src={AppStore}
              alt="Download on the App Store"
              classname="app-store-icon"
            />
          </Link>
          <Link href="https://link-to-google-play-store">
            <img
              src={PlayStore}
              alt="Get it on Google Play"
              className="app-store-icon"
            />
          </Link>
        </div> */}
      </footer>
      <div className="footer-layer legal-info">
        <div className="footer-copyright">
          <img src={placeholder} alt="AniThrift Logo" className="footer-logo" />
          <span>© {currentYear} AniThrift</span>
        </div>
        <div className="legal-links">
          <Link href="/cookie-settings">Cookie Settings</Link>
          <Link href="/cookie-policy">Cookie Policy</Link>
          <Link href="/terms-of-service">Terms of Service</Link>
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/california-privacy-notice">
            California Privacy Notice
          </Link>
          <Link href="/accessibility-statement">Accessibility Statement</Link>
        </div>
      </div>
    </>
  );
};

export default Footer;
