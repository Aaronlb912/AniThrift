import React from "react";
import "../css/infoPages.css";

const TermsOfService: React.FC = () => {
  return (
    <div className="info-page-container">
      <h1>Terms of Service</h1>
      <div className="info-content">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using AniThrift ("the Platform", "we", "us", or "our"), 
          you accept and agree to be bound by these Terms of Service and our Privacy Policy. 
          If you do not agree to these terms, you may not use our service.
        </p>
        <p>
          AniThrift is an online marketplace platform that connects buyers and sellers 
          of anime-related collectibles, merchandise, and media. We facilitate transactions 
          but are not a party to the actual sale between buyers and sellers.
        </p>

        <h2>2. Account Registration and Security</h2>
        <p>
          To use certain features of AniThrift, you must create an account. When creating 
          an account, you agree to:
        </p>
        <ul>
          <li>Provide accurate, current, and complete information</li>
          <li>Maintain and update your information to keep it accurate</li>
          <li>Choose a username that is not offensive, profane, or impersonating another person</li>
          <li>Maintain the security of your password and account</li>
          <li>Accept responsibility for all activities that occur under your account</li>
          <li>Notify us immediately of any unauthorized use of your account</li>
        </ul>
        <p>
          You must be at least 18 years old to create an account and use our platform. 
          By creating an account, you represent that you are of legal age to enter into 
          binding contracts in your jurisdiction.
        </p>

        <h2>3. Platform Services</h2>
        <p>AniThrift provides the following services:</p>
        <ul>
          <li><strong>Marketplace Platform:</strong> A platform for listing, browsing, and purchasing anime-related items</li>
          <li><strong>Payment Processing:</strong> Integration with Stripe Connect to facilitate secure payments between buyers and sellers</li>
          <li><strong>Shipping Services:</strong> Integration with Shippo to calculate shipping rates and create shipping labels</li>
          <li><strong>Messaging System:</strong> Communication tools for buyers and sellers to discuss transactions</li>
          <li><strong>Rating and Review System:</strong> Tools for buyers to rate and review sellers after transactions</li>
          <li><strong>Content Filtering:</strong> Options to filter adult content based on user preferences</li>
        </ul>
        <p>
          We act as an intermediary platform and are not responsible for the quality, 
          safety, legality, or accuracy of items listed by sellers.
        </p>

        <h2>4. Seller Responsibilities</h2>
        <p>As a seller on AniThrift, you agree to:</p>
        <ul>
          <li>Accurately describe all items, including condition, packaging, and any defects</li>
          <li>Provide clear, high-quality photos of items you list</li>
          <li>Set up a valid shipping address before listing items (required for shipping calculations)</li>
          <li>Complete Stripe Connect onboarding to receive payments</li>
          <li>Ship items promptly after receiving payment (within the timeframe specified in your listing)</li>
          <li>Package items securely to prevent damage during shipping</li>
          <li>Provide accurate shipping information and tracking numbers when available</li>
          <li>Respond to buyer inquiries in a timely manner</li>
          <li>Honor all transactions and complete sales as agreed</li>
          <li>Mark items containing adult content appropriately using the 18+ content filter</li>
          <li>Comply with all applicable laws and regulations regarding the sale of your items</li>
        </ul>
        <p>
          Sellers are responsible for setting their own prices and determining shipping costs. 
          Shipping rates are calculated using Shippo based on package weight, dimensions, 
          and selected shipping service.
        </p>

        <h2>5. Buyer Responsibilities</h2>
        <p>As a buyer on AniThrift, you agree to:</p>
        <ul>
          <li>Review item descriptions, photos, and seller ratings before purchasing</li>
          <li>Make timely payments through our secure payment system</li>
          <li>Provide accurate shipping address information</li>
          <li>Complete transactions once you commit to a purchase</li>
          <li>Communicate respectfully with sellers</li>
          <li>Leave honest and fair ratings and reviews after transactions</li>
          <li>Report any issues or disputes through appropriate channels</li>
        </ul>
        <p>
          Buyers are responsible for reviewing shipping costs, which may vary based on 
          the seller's location, package weight, and selected shipping service.
        </p>

        <h2>6. Payments and Fees</h2>
        <p>
          All payments are processed through Stripe Connect, which enables direct payments 
          from buyers to sellers. AniThrift facilitates these transactions but does not 
          hold funds as an intermediary.
        </p>
        <ul>
          <li>Buyers pay sellers directly through Stripe</li>
          <li>Shipping costs are calculated using Shippo and included in the total purchase price</li>
          <li>Sellers must complete Stripe Connect onboarding to receive payments</li>
          <li>Payment processing fees are determined by Stripe and are the responsibility of sellers</li>
          <li>All prices are displayed in USD unless otherwise specified</li>
        </ul>
        <p>
          We reserve the right to change our fee structure with reasonable notice. 
          Any changes will be communicated to users in advance.
        </p>

        <h2>7. Shipping and Delivery</h2>
        <p>
          Shipping is handled through Shippo integration, which provides real-time shipping 
          rate calculations from various carriers including USPS, UPS, and FedEx.
        </p>
        <ul>
          <li>Sellers must provide a valid "ship from" address before listing items</li>
          <li>Shipping rates are calculated based on package weight, dimensions, and selected service</li>
          <li>Buyers can select shipping options at checkout</li>
          <li>Sellers are responsible for packaging items securely and shipping within agreed timeframes</li>
          <li>Tracking information is provided when available through the shipping carrier</li>
          <li>AniThrift is not responsible for delays, damage, or loss during shipping</li>
        </ul>
        <p>
          Disputes regarding shipping should be resolved directly between buyers and sellers. 
          We may assist in facilitating communication but are not responsible for shipping issues.
        </p>

        <h2>8. Content and Intellectual Property</h2>
        <p>
          You retain ownership of content you post on AniThrift, including item listings, 
          photos, and reviews. By posting content, you grant us a license to:
        </p>
        <ul>
          <li>Display your content on the platform</li>
          <li>Use your content to promote the platform (with attribution)</li>
          <li>Moderate or remove content that violates these terms</li>
        </ul>
        <p>
          You agree not to post content that:
        </p>
        <ul>
          <li>Infringes on intellectual property rights of others</li>
          <li>Contains false, misleading, or deceptive information</li>
          <li>Is illegal, harmful, or violates any laws</li>
          <li>Contains adult content that is not properly marked with the 18+ filter</li>
          <li>Is spam, harassing, or abusive</li>
        </ul>

        <h2>9. Prohibited Uses</h2>
        <p>You may not use AniThrift:</p>
        <ul>
          <li>For any unlawful purpose or to violate any laws or regulations</li>
          <li>To infringe upon the intellectual property or other rights of others</li>
          <li>To transmit harmful, malicious, or illegal code or content</li>
          <li>To spam, harass, threaten, or abuse other users</li>
          <li>To impersonate another person or entity</li>
          <li>To interfere with or disrupt the platform's operation</li>
          <li>To attempt to gain unauthorized access to any part of the platform</li>
          <li>To use automated systems to scrape data or manipulate the platform</li>
          <li>To sell counterfeit, stolen, or illegal items</li>
          <li>To engage in fraudulent transactions or chargebacks</li>
        </ul>

        <h2>10. Adult Content</h2>
        <p>
          AniThrift allows sellers to mark items as containing adult content (18+). 
          Users can control their viewing preferences in account settings.
        </p>
        <ul>
          <li>Sellers must accurately mark items containing adult content</li>
          <li>Items marked as 18+ will only be visible to users who have enabled adult content viewing</li>
          <li>Users under 18 are not permitted to view or purchase adult content</li>
          <li>We reserve the right to remove content that violates our content policies</li>
        </ul>

        <h2>11. Disputes and Resolution</h2>
        <p>
          Disputes between buyers and sellers should first be resolved through direct 
          communication using our messaging system. If a dispute cannot be resolved:
        </p>
        <ul>
          <li>Buyers and sellers may contact our support team for assistance</li>
          <li>We may facilitate communication but are not obligated to resolve disputes</li>
          <li>We are not responsible for refunds or returns unless required by law</li>
          <li>Chargebacks and payment disputes are handled through Stripe's dispute process</li>
        </ul>
        <p>
          By using AniThrift, you agree to attempt to resolve disputes in good faith 
          before pursuing legal action.
        </p>

        <h2>12. Account Termination</h2>
        <p>
          We reserve the right to suspend or terminate accounts that violate these terms, 
          engage in fraudulent activity, or otherwise harm the platform or its users. 
          You may also delete your account at any time through account settings.
        </p>
        <p>
          Upon account termination:
        </p>
        <ul>
          <li>Your listings will be removed from the platform</li>
          <li>Pending transactions should be completed or cancelled</li>
          <li>Your data will be handled according to our Privacy Policy</li>
        </ul>

        <h2>13. Limitation of Liability</h2>
        <p>
          AniThrift acts as an intermediary platform and is not responsible for:
        </p>
        <ul>
          <li>The quality, safety, or legality of items sold by sellers</li>
          <li>The accuracy of item descriptions or photos provided by sellers</li>
          <li>Shipping delays, damage, or loss during transit</li>
          <li>Payment disputes between buyers and sellers</li>
          <li>Any indirect, incidental, special, or consequential damages</li>
          <li>Loss of profits, data, or business opportunities</li>
        </ul>
        <p>
          Our total liability to you for any claims arising from your use of the platform 
          shall not exceed the amount you paid us in the 12 months preceding the claim.
        </p>

        <h2>14. Third-Party Services</h2>
        <p>
          AniThrift integrates with third-party services:
        </p>
        <ul>
          <li><strong>Stripe:</strong> Payment processing and seller payouts</li>
          <li><strong>Shippo:</strong> Shipping rate calculations and label creation</li>
          <li><strong>Firebase/Google:</strong> Authentication, database, and hosting services</li>
        </ul>
        <p>
          Your use of these services is subject to their respective terms of service and 
          privacy policies. We are not responsible for the actions or policies of these 
          third-party services.
        </p>

        <h2>15. Changes to Terms</h2>
        <p>
          We reserve the right to modify these Terms of Service at any time. Material 
          changes will be communicated to users via email or platform notifications. 
          Your continued use of AniThrift after changes are posted constitutes acceptance 
          of the modified terms.
        </p>
        <p>
          If you do not agree to the modified terms, you must stop using the platform 
          and may delete your account.
        </p>

        <h2>16. Contact Information</h2>
        <p>
          If you have questions about these Terms of Service, please contact us at{" "}
          <a href="mailto:legal@anithrift.com">legal@anithrift.com</a>
        </p>
      </div>
    </div>
  );
};

export default TermsOfService;

