import React from "react";
import "../css/infoPages.css";

const CookiePolicy: React.FC = () => {
  return (
    <div className="info-page-container">
      <h1>Cookie Policy</h1>
      <div className="info-content">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <h2>What Are Cookies?</h2>
        <p>
          Cookies are small text files that are placed on your device when you
          visit our website. They help us provide you with a better experience
          and allow certain features to work properly.
        </p>
        <h2>How We Use Cookies</h2>
        <h3>Essential Cookies</h3>
        <p>
          These cookies are necessary for the website to function and cannot be
          switched off. They are usually set in response to actions made by you.
        </p>
        <h3>Analytics Cookies</h3>
        <p>
          These cookies help us understand how visitors interact with our
          website by collecting and reporting information anonymously.
        </p>
        <h3>Marketing Cookies</h3>
        <p>
          These cookies may be set through our site to build a profile of your
          interests and show you relevant content on other sites.
        </p>
        <h2>Managing Cookies</h2>
        <p>
          You can manage your cookie preferences at any time by visiting our{" "}
          <a href="/cookie-settings">Cookie Settings</a> page.
        </p>
        <h2>Third-Party Cookies</h2>
        <p>
          Some cookies are placed by third-party services that appear on our
          pages. We do not control these cookies, so please check the
          third-party websites for more information about their cookies.
        </p>
      </div>
    </div>
  );
};

export default CookiePolicy;

