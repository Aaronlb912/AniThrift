import React, { Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import SearchProvider from "./components/SearchHandler";
import { AuthProvider } from "./components/userAuth";
import { UnreadMessagesProvider } from "./contexts/UnreadMessagesContext";
import CookieConsent from "./components/CookieConsent";

// Lazy load components for code splitting
const App = lazy(() => import("./App"));
const SignInPage = lazy(() => import("./pages/SignInPage"));
const SearchResult = lazy(() => import("./pages/SearchResults"));
const CategoryPreview = lazy(() => import("./pages/CategoryPreview"));
const Profile = lazy(() => import("./pages/Profile"));
const EditProfile = lazy(() => import("./pages/EditProfile"));
const Listing = lazy(() => import("./pages/Listing"));
const Selling = lazy(() => import("./pages/Selling"));
const ItemListing = lazy(() => import("./pages/ItemInfo"));
const Cart = lazy(() => import("./pages/Cart"));
const EditItem = lazy(() => import("./pages/EditItem"));
const PublicProfile = lazy(() => import("./pages/PublicProfile"));
const SellerReviews = lazy(() => import("./pages/SellerReviews"));
const Messages = lazy(() => import("./pages/Messages"));
const Checkout = lazy(() => import("./pages/CheckOut"));
const ProfileSettings = lazy(() => import("./pages/ProfileSettings"));
const PersonalInfoPage = lazy(() => import("./components/PersonalInfo"));
const PurchaseSuccess = lazy(() => import("./components/PurchaseSuccess"));
const StripeOnboardingForm = lazy(
  () => import("./components/StripeOnboardingForm")
);
const Orders = lazy(() => import("./pages/orders"));
const Archives = lazy(() => import("./pages/ArchivedOrders"));
const AboutUsPage = lazy(() => import("./pages/AboutUs"));
const CareersPage = lazy(() => import("./pages/Careers"));
const HelpAndSupportPage = lazy(() => import("./pages/HelpAndSupport"));
const AccountSettings = lazy(() => import("./pages/AccountSettings"));
const FBResults = lazy(() => import("./components/FBResults"));
const FeedbackForm = lazy(() => import("./components/Feedback"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SellerNotFound = lazy(() => import("./pages/SellerNotFound"));
// Footer pages
const Forum = lazy(() => import("./pages/Forum"));
const DatabaseGuidelines = lazy(() => import("./pages/DatabaseGuidelines"));
const Shipping = lazy(() => import("./pages/Shipping"));
const CookieSettings = lazy(() => import("./pages/CookieSettings"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const CaliforniaPrivacyNotice = lazy(
  () => import("./pages/CaliforniaPrivacyNotice")
);
const AccessibilityStatement = lazy(
  () => import("./pages/AccessibilityStatement")
);
// Help pages
const FAQ = lazy(() => import("./pages/FAQ"));
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions"));
// Settings pages
const SettingsRequestData = lazy(() => import("./pages/SettingsRequestData"));
const SettingsStripeAccount = lazy(
  () => import("./pages/SettingsStripeAccount")
);
const SettingsPermissions = lazy(() => import("./pages/SettingsPermissions"));
const SettingsAdPreferences = lazy(
  () => import("./pages/SettingsAdPreferences")
);
const SettingsCommunicationPreferences = lazy(
  () => import("./pages/SettingsCommunicationPreferences")
);
const SettingsCloseAccount = lazy(() => import("./pages/SettingsCloseAccount"));
const SettingsSellerDashboard = lazy(
  () => import("./pages/SettingsSellerDashboard")
);
const SettingsSubscriptions = lazy(
  () => import("./pages/SettingsSubscriptions")
);
const SettingsDonationPreferences = lazy(
  () => import("./pages/SettingsDonationPreferences")
);
const SettingsPendingDonations = lazy(
  () => import("./pages/SettingsPendingDonations")
);
const SettingsInvoicedDonations = lazy(
  () => import("./pages/SettingsInvoicedDonations")
);
const SettingsBlockedUsers = lazy(
  () => import("./pages/SettingsBlockedUsers")
);
const AddressesPage = lazy(() => import("./components/Addresses"));
const SettingsContentPreferences = lazy(
  () => import("./pages/SettingsContentPreferences")
);
// Loading fallback component
const LoadingFallback = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "50vh",
    }}
  >
    <div>Loading...</div>
  </div>
);

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <UnreadMessagesProvider>
        <SearchProvider>
          <BrowserRouter>
          <Header />
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<App />} />
              <Route path="/signin" element={<SignInPage />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/search" element={<SearchResult />} />
              <Route path="/category/:categoryQuery" element={<CategoryPreview />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/edit-profile" element={<EditProfile />} />
              <Route path="/listing" element={<Listing />} />
              <Route path="/sell" element={<Selling />} />
              <Route path="/item/:id" element={<ItemListing />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/edit-item/:id" element={<EditItem />} />
              <Route path="/user/:username" element={<PublicProfile />} />
              <Route path="/user/:username/reviews" element={<SellerReviews />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/messages/:userId" element={<Messages />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/profsettings" element={<ProfileSettings />} />
              <Route
                path="/settings/personal-information"
                element={<PersonalInfoPage />}
              />
              <Route
                path="/settings/account-settings"
                element={<AccountSettings />}
              />
              <Route path="/addresses" element={<AddressesPage />} />
              <Route path="/success" element={<PurchaseSuccess />} />
              <Route path="/purchase-success" element={<PurchaseSuccess />} />
              <Route
                path="/StripeOnboardingForm"
                element={<StripeOnboardingForm />}
              />
              <Route path="/orders" element={<Orders />} />
              <Route path="/archives" element={<Archives />} />
              <Route path="/about-us" element={<AboutUsPage />} />
              <Route path="/careers" element={<CareersPage />} />
              <Route path="/help-support" element={<HelpAndSupportPage />} />
              <Route path="/fbresults" element={<FBResults />} />
              <Route path="/feedback" element={<FeedbackForm />} />
              {/* Footer pages */}
              <Route path="/forum" element={<Forum />} />
              <Route
                path="/database-guidelines"
                element={<DatabaseGuidelines />}
              />
              <Route path="/shipping" element={<Shipping />} />
              <Route path="/cookie-settings" element={<CookieSettings />} />
              <Route path="/cookie-policy" element={<CookiePolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route
                path="/california-privacy-notice"
                element={<CaliforniaPrivacyNotice />}
              />
              <Route
                path="/accessibility-statement"
                element={<AccessibilityStatement />}
              />
              {/* Help pages */}
              <Route path="/faq" element={<FAQ />} />
              <Route
                path="/terms-and-conditions"
                element={<TermsAndConditions />}
              />
              {/* Settings pages */}
              <Route
                path="/settings/request-data"
                element={<SettingsRequestData />}
              />
              <Route
                path="/settings/stripe-account"
                element={<SettingsStripeAccount />}
              />
              <Route
                path="/settings/permissions"
                element={<SettingsPermissions />}
              />
              <Route
                path="/settings/ad-preferences"
                element={<SettingsAdPreferences />}
              />
              <Route
                path="/settings/communication-preferences"
                element={<SettingsCommunicationPreferences />}
              />
              <Route
                path="/settings/close-account"
                element={<SettingsCloseAccount />}
              />
              <Route
                path="/settings/seller-dashboard"
                element={<SettingsSellerDashboard />}
              />
              <Route
                path="/settings/subscriptions"
                element={<SettingsSubscriptions />}
              />
              <Route
                path="/settings/donation-preferences"
                element={<SettingsDonationPreferences />}
              />
              <Route
                path="/settings/pending-donations"
                element={<SettingsPendingDonations />}
              />
              <Route
                path="/settings/invoiced-donations"
                element={<SettingsInvoicedDonations />}
              />
              <Route
                path="/settings/blocked-users"
                element={<SettingsBlockedUsers />}
              />
              <Route
                path="/settings/content-preferences"
                element={<SettingsContentPreferences />}
              />
              <Route path="/seller-not-found" element={<SellerNotFound />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <CookieConsent />
          <Footer />
        </BrowserRouter>
      </SearchProvider>
      </UnreadMessagesProvider>
    </AuthProvider>
  </React.StrictMode>
);
