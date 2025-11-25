import React from "react";
import "../css/infoPages.css";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="info-page-container">
      <h1>Privacy Policy</h1>
      <div className="info-content">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <p>
          At AniThrift ("we", "us", or "our"), we are committed to protecting your privacy. 
          This Privacy Policy explains how we collect, use, disclose, and safeguard your 
          information when you use our online marketplace platform.
        </p>

        <h2>1. Information We Collect</h2>
        
        <h3>1.1 Account Information</h3>
        <p>When you create an account, we collect:</p>
        <ul>
          <li>Email address (used for authentication and communication)</li>
          <li>Username (displayed publicly on your profile)</li>
          <li>Password (encrypted and stored securely)</li>
          <li>Account creation date and last updated timestamp</li>
          <li>Marketing preferences (if you opt-in to promotional communications)</li>
        </ul>

        <h3>1.2 Profile Information</h3>
        <p>You may choose to provide additional profile information:</p>
        <ul>
          <li>Bio or description</li>
          <li>Profile photo</li>
          <li>Social media links (Instagram, Twitter, TikTok, website)</li>
          <li>Profile visibility settings (public or private)</li>
          <li>Content preferences (including adult content viewing settings)</li>
        </ul>

        <h3>1.3 Shipping and Address Information</h3>
        <p>For transaction purposes, we collect:</p>
        <ul>
          <li><strong>Registration Address:</strong> Your primary address (optional)</li>
          <li><strong>Shipping Address:</strong> Address for receiving purchases (optional, collected at checkout)</li>
          <li><strong>Ship From Address:</strong> Required for sellers to list items, used for shipping calculations (stored securely and not visible to other users)</li>
        </ul>
        <p>
          <strong>Important:</strong> Seller "ship from" addresses are stored securely and are 
          never exposed to buyers or other users. Shipping calculations are performed 
          server-side to protect seller privacy and prevent doxxing.
        </p>

        <h3>1.4 Payment Information</h3>
        <p>
          Payment processing is handled by Stripe Connect. We do not store your full payment 
          card information. Stripe collects and processes:
        </p>
        <ul>
          <li>Payment card information (processed securely by Stripe)</li>
          <li>Billing address</li>
          <li>Stripe account information for sellers (for receiving payouts)</li>
          <li>Transaction history and payment records</li>
        </ul>
        <p>
          For sellers, we store your Stripe Connect account ID and onboarding status to 
          facilitate payments, but all payment data is managed by Stripe.
        </p>

        <h3>1.5 Transaction Information</h3>
        <p>When you buy or sell items, we collect:</p>
        <ul>
          <li>Item listings (title, description, photos, price, condition, etc.)</li>
          <li>Purchase history and order details</li>
          <li>Shipping information and tracking numbers</li>
          <li>Transaction amounts and payment status</li>
          <li>Ratings and reviews you give or receive</li>
        </ul>

        <h3>1.6 Communication Data</h3>
        <p>When you use our messaging system, we collect:</p>
        <ul>
          <li>Messages sent between buyers and sellers</li>
          <li>Conversation threads and timestamps</li>
          <li>Read receipts and typing indicators</li>
          <li>Blocked users list (for privacy and safety)</li>
        </ul>

        <h3>1.7 Activity and Usage Data</h3>
        <p>We automatically collect certain information when you use our platform:</p>
        <ul>
          <li>Items you view (for "recently viewed" features)</li>
          <li>Items you add to your watchlist</li>
          <li>Search queries and browsing behavior</li>
          <li>Device information (browser type, operating system, device identifiers)</li>
          <li>IP address and general location data</li>
          <li>Cookies and similar tracking technologies</li>
          <li>Platform usage patterns and feature interactions</li>
        </ul>

        <h3>1.8 Content Preferences</h3>
        <p>We store your content filtering preferences:</p>
        <ul>
          <li>Adult content viewing preferences (to filter 18+ items)</li>
          <li>Communication preferences</li>
          <li>Notification settings</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <p>We use the information we collect for the following purposes:</p>
        
        <h3>2.1 Platform Operations</h3>
        <ul>
          <li>Create and manage your account</li>
          <li>Authenticate your identity and secure your account</li>
          <li>Process transactions and facilitate payments</li>
          <li>Calculate shipping rates using Shippo integration</li>
          <li>Enable communication between buyers and sellers</li>
          <li>Display your listings and profile to other users</li>
          <li>Provide personalized recommendations and search results</li>
        </ul>

        <h3>2.2 Transaction Services</h3>
        <ul>
          <li>Connect buyers and sellers for transactions</li>
          <li>Process payments through Stripe Connect</li>
          <li>Calculate and display shipping rates</li>
          <li>Generate shipping labels through Shippo</li>
          <li>Track orders and provide order history</li>
          <li>Facilitate ratings and reviews</li>
        </ul>

        <h3>2.3 Communication</h3>
        <ul>
          <li>Send transaction-related notifications</li>
          <li>Enable messaging between users</li>
          <li>Send account updates and security alerts</li>
          <li>Provide customer support</li>
          <li>Send promotional communications (only if you opt-in)</li>
        </ul>

        <h3>2.4 Platform Improvement</h3>
        <ul>
          <li>Analyze usage patterns to improve our services</li>
          <li>Develop new features and functionality</li>
          <li>Prevent fraud and ensure platform security</li>
          <li>Enforce our Terms of Service</li>
          <li>Resolve disputes and investigate violations</li>
        </ul>

        <h3>2.5 Legal Compliance</h3>
        <ul>
          <li>Comply with applicable laws and regulations</li>
          <li>Respond to legal requests and court orders</li>
          <li>Protect our rights and the rights of our users</li>
          <li>Prevent illegal activities and fraud</li>
        </ul>

        <h2>3. Information Sharing and Disclosure</h2>
        <p>
          We do not sell your personal information. We may share your information in the 
          following circumstances:
        </p>

        <h3>3.1 Public Information</h3>
        <p>The following information is visible to other users on the platform:</p>
        <ul>
          <li>Your username and profile information (if profile is set to public)</li>
          <li>Items you list for sale</li>
          <li>Public ratings and reviews you receive</li>
          <li>Your seller rating and total number of ratings</li>
        </ul>

        <h3>3.2 Transaction Partners</h3>
        <p>We share necessary information with service providers to facilitate transactions:</p>
        <ul>
          <li><strong>Stripe:</strong> Payment information, transaction details, and seller account information for payment processing</li>
          <li><strong>Shippo:</strong> Shipping addresses (buyer and seller) and package information for shipping rate calculations and label creation</li>
          <li><strong>Shipping Carriers:</strong> Address and package information for shipping services (USPS, UPS, FedEx)</li>
        </ul>

        <h3>3.3 Service Providers</h3>
        <p>We use third-party services that may have access to your information:</p>
        <ul>
          <li><strong>Firebase/Google Cloud:</strong> Hosting, authentication, and database services</li>
          <li><strong>Stripe:</strong> Payment processing and seller payouts</li>
          <li><strong>Shippo:</strong> Shipping rate calculations and label generation</li>
        </ul>
        <p>
          These service providers are contractually obligated to protect your information 
          and use it only for the purposes we specify.
        </p>

        <h3>3.4 Legal Requirements</h3>
        <p>We may disclose your information if required by law or to:</p>
        <ul>
          <li>Comply with legal processes, subpoenas, or court orders</li>
          <li>Respond to government requests</li>
          <li>Enforce our Terms of Service</li>
          <li>Protect the rights, property, or safety of AniThrift, our users, or others</li>
          <li>Prevent fraud or illegal activities</li>
        </ul>

        <h3>3.5 Business Transfers</h3>
        <p>
          In the event of a merger, acquisition, or sale of assets, your information may 
          be transferred to the acquiring entity, subject to the same privacy protections.
        </p>

        <h3>3.6 With Your Consent</h3>
        <p>
          We may share your information in other ways with your explicit consent.
        </p>

        <h2>4. Data Security</h2>
        <p>
          We implement appropriate technical and organizational security measures to protect 
          your personal information:
        </p>
        <ul>
          <li>Encryption of data in transit and at rest</li>
          <li>Secure authentication and password hashing</li>
          <li>Server-side processing for sensitive operations (e.g., shipping address calculations)</li>
          <li>Regular security assessments and updates</li>
          <li>Access controls and authentication requirements</li>
          <li>Secure payment processing through Stripe (we never store full payment card details)</li>
        </ul>
        <p>
          However, no method of transmission over the internet or electronic storage is 100% 
          secure. While we strive to protect your information, we cannot guarantee absolute 
          security. You are responsible for maintaining the confidentiality of your account 
          credentials.
        </p>
        <p>
          <strong>Seller Address Protection:</strong> We take special care to protect seller 
          shipping addresses. These addresses are never exposed to buyers or in client-side 
          code. Shipping calculations are performed server-side through secure Cloud Functions.
        </p>

        <h2>5. Your Rights and Choices</h2>
        <p>You have the following rights regarding your personal information:</p>

        <h3>5.1 Access and Correction</h3>
        <ul>
          <li>Access your personal information through your account settings</li>
          <li>Update or correct inaccurate information</li>
          <li>View your transaction history and order information</li>
        </ul>

        <h3>5.2 Account Controls</h3>
        <ul>
          <li>Control your profile visibility (public or private)</li>
          <li>Manage your content preferences (including adult content filtering)</li>
          <li>Update your communication preferences</li>
          <li>Block or unblock other users</li>
          <li>Delete your account (subject to completing pending transactions)</li>
        </ul>

        <h3>5.3 Data Deletion</h3>
        <p>You can request deletion of your account and associated data by:</p>
        <ul>
          <li>Using the account deletion feature in your account settings</li>
          <li>Contacting us at <a href="mailto:privacy@anithrift.com">privacy@anithrift.com</a></li>
        </ul>
        <p>
          Note: Some information may be retained for legal or business purposes, such as 
          completed transaction records required for tax or legal compliance.
        </p>

        <h3>5.4 Marketing Communications</h3>
        <p>
          You can opt-out of promotional emails by:
        </p>
        <ul>
          <li>Unchecking the promotional communications option during signup</li>
          <li>Updating your preferences in account settings</li>
          <li>Clicking the unsubscribe link in promotional emails</li>
        </ul>
        <p>
          Transaction-related and account security communications cannot be opted out of, 
          as they are necessary for using the platform.
        </p>

        <h3>5.5 Cookies and Tracking</h3>
        <p>
          You can control cookies through your browser settings. However, disabling cookies 
          may limit your ability to use certain features of the platform.
        </p>

        <h2>6. Children's Privacy</h2>
        <p>
          AniThrift is not intended for users under the age of 18. We do not knowingly 
          collect personal information from children under 18. If we become aware that we 
          have collected information from a child under 18, we will take steps to delete 
          that information promptly.
        </p>
        <p>
          Users must be 18 or older to create an account and use our platform. Adult content 
          (18+) is restricted and only visible to users who have explicitly enabled it in 
          their preferences.
        </p>

        <h2>7. International Data Transfers</h2>
        <p>
          Your information may be transferred to and processed in countries other than your 
          country of residence. These countries may have data protection laws that differ 
          from those in your country. By using AniThrift, you consent to the transfer of 
          your information to these countries.
        </p>
        <p>
          We use service providers (Firebase/Google, Stripe, Shippo) that may process data 
          in various locations. These providers are required to comply with applicable data 
          protection laws.
        </p>

        <h2>8. Data Retention</h2>
        <p>We retain your information for as long as necessary to:</p>
        <ul>
          <li>Provide our services to you</li>
          <li>Comply with legal obligations</li>
          <li>Resolve disputes and enforce our agreements</li>
          <li>Maintain transaction records for accounting and legal purposes</li>
        </ul>
        <p>
          When you delete your account, we will delete or anonymize your personal information, 
          except where we are required to retain it for legal or business purposes (such as 
          completed transaction records).
        </p>

        <h2>9. Third-Party Services and Links</h2>
        <p>
          Our platform integrates with third-party services and may contain links to external 
          websites. This Privacy Policy does not apply to third-party services or websites. 
          We encourage you to review the privacy policies of:
        </p>
        <ul>
          <li><strong>Stripe:</strong> <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">https://stripe.com/privacy</a></li>
          <li><strong>Shippo:</strong> <a href="https://goshippo.com/privacy/" target="_blank" rel="noopener noreferrer">https://goshippo.com/privacy/</a></li>
          <li><strong>Firebase/Google:</strong> <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">https://policies.google.com/privacy</a></li>
        </ul>

        <h2>10. California Privacy Rights</h2>
        <p>
          If you are a California resident, you have additional rights under the California 
          Consumer Privacy Act (CCPA). Please see our{" "}
          <a href="/california-privacy-notice">California Privacy Notice</a> for more information.
        </p>

        <h2>11. Changes to This Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any 
          material changes by:
        </p>
        <ul>
          <li>Posting the updated policy on our platform</li>
          <li>Updating the "Last updated" date</li>
          <li>Sending you an email notification for significant changes</li>
        </ul>
        <p>
          Your continued use of AniThrift after changes are posted constitutes acceptance 
          of the updated Privacy Policy.
        </p>

        <h2>12. Contact Us</h2>
        <p>
          If you have questions, concerns, or requests regarding this Privacy Policy or our 
          data practices, please contact us at:
        </p>
        <ul>
          <li>Email: <a href="mailto:privacy@anithrift.com">privacy@anithrift.com</a></li>
          <li>For data access or deletion requests, please use the account settings or contact us directly</li>
        </ul>
        <p>
          We will respond to your inquiries within a reasonable timeframe.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

