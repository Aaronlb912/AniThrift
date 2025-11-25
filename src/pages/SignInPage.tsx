import React, { useState, useEffect, useCallback, useMemo } from "react";
import { auth, db } from "../firebase-config";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { debounce } from "../hooks/useDebounce";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import "../css/Signin.css"; // Ensure the path is correct
import { useNavigate, Link } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import BadWordsNext from "bad-words-next";
const en = require("bad-words-next/data/en.json");

const SignInPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in, navigate them to the home screen
        navigate("/");
      }
      // Otherwise, stay on the sign-in page
    });

    // Clean up the listener when the component unmounts
    return unsubscribe;
  }, [navigate]);

  // States and navigate hook
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState(""); // New state for username
  const [signUpPromo, setSignUpPromo] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [registerError, setRegisterError] = useState(""); // State for registration error
  const [loginError, setLoginError] = useState(""); // State for login error
  const [isUsernameUnique, setIsUniqueUsername] = useState(false);
  const [usernameIsValid, setUsernameIsValid] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [termsModalOpen, setTermsModalOpen] = useState(false);

  const reserveUsername = (user: any, username: string) => {
    const usernameRef = doc(db, "usernames", username.toLowerCase());
    setDoc(usernameRef, { userId: user.uid }); // Reserve username
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("User logged in");
      navigate("/"); // Navigate to the homepage
    } catch (error) {
      console.error("Login error:", error);
      if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        setLoginError("Incorrect email or password. Please try again."); // Set login error
      } else {
        setLoginError("A User with that email or password was not found"); // Set general login error
      }
    }
  };

  const getPasswordValidationErrors = (password: string) => {
    const errors: string[] = [];
    if (password.length < 8) {
      errors.push("Must be at least 8 characters long.");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Must include at least one uppercase letter.");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Must include at least one lowercase letter.");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Must include at least one number.");
    }
    if (!/[!@#$%^&*(),.?":{}|<>_+-=\[\]\/'`~]/.test(password)) {
      errors.push("Must include at least one special character.");
    }
    return errors;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!acceptedTerms) {
      setRegisterError("You must accept the Terms and Conditions to create an account.");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setRegisterError("Passwords do not match.");
      return;
    }

    const validationErrors = getPasswordValidationErrors(newPassword);
    if (validationErrors.length > 0) {
      setPasswordErrors(validationErrors);
      setRegisterError("Please meet all password requirements.");
      return;
    }

    setPasswordErrors([]);

    if (!isValidUsername && !isUsernameUnique) {
      setRegisterError("Username is not valid");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newEmail,
        newPassword
      );
      console.log("User registered", userCredential.user);

      const createdAt = new Date().toISOString();
      const usernameSlug = username.toLowerCase();

      try {
        await updateProfile(userCredential.user, {
          displayName: username,
        });
      } catch (profileError) {
        console.warn("Unable to set auth profile display name:", profileError);
      }

      // Add user details to Firestore with all required fields for selling
      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: newEmail,
        username,
        usernameSlug,
        name: username,
        signUpPromo,
        creationDate: createdAt,
        bio: "",
        photoURL: "",
        rating: 0,
        reviews: 0,
        totalRatings: 0,
        favoriteTags: [],
        links: {
          website: "",
          instagram: "",
          twitter: "",
          tiktok: "",
        },
        profileVisibility: "public",
        lastUpdated: createdAt,
        // Stripe-related fields (initialized but not set until onboarding)
        stripeAccountId: null,
        stripe_account_id: null,
        stripeOnboardingComplete: false,
        // Shipping-related fields (can be set later via Addresses page)
        shipFromAddress: null,
        registrationAddress: null,
        shippingAddress: null,
        // Seller-related fields
        isSeller: false, // Will be set to true when first item is listed
        // Blocking/communication fields
        blockedUsers: [],
        blockedBy: [],
        // Preferences
        allowAdultContent: false,
      });

      reserveUsername({ uid: userCredential.user.uid }, usernameSlug);

      navigate("/"); // This will navigate the user to the homepage after successful registration
    } catch (error) {
      console.error("Registration error:", error);
      if (error.code === "auth/email-already-in-use") {
        setRegisterError("An account with this email already exists.");
      } else {
        setRegisterError(
          "An error occurred during registration. Please try again."
        );
      }
    }
  };

  const getUsernameValidationRules = useCallback((name: string) => {
    const rules = [
      {
        key: "length",
        label: "6-16 characters",
        test: /^[0-9A-Za-z]{6,16}$/.test(name),
      },
      {
        key: "alphanumeric",
        label: "Letters and numbers only",
        test: /^[0-9A-Za-z]*$/.test(name),
      },
      {
        key: "profanity",
        label: "No profanity",
        test: (() => {
          if (!name) return false;
          const badwords = new BadWordsNext({ data: en });
          return !badwords.check(name);
        })(),
      },
    ];
    return rules;
  }, []);

  const isValidUsername = (name: string) => {
    const badwords = new BadWordsNext({ data: en });
    var nameRegex = /^[0-9A-Za-z]{6,16}$/;
    if (!name.match(nameRegex)) {
      setUsernameIsValid(false);
      return false;
    }
    if (badwords.check(name)) {
      return false;
    }

    setUsernameIsValid(true);
    return true;
  };

  const checkUsername = async (name: string) => {
    const usernameRef = doc(db, "usernames", name.toLowerCase());
    const docSnap = await getDoc(usernameRef);
    console.log(name, " exists", docSnap.exists());
    return !docSnap.exists();
  };

  const debouncedCheckUsername = useCallback(
    debounce((newUsername: string) => {
      checkUsername(newUsername).then((isUnique) => {
        if (isUnique) {
          setIsUniqueUsername(true);
        } else {
          setIsUniqueUsername(false);
        }
      });
    }, 500),
    []
  );

  const handleChange = (e: any) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    if (isValidUsername(e.target.value)) {
      debouncedCheckUsername(newUsername);
    } else {
      setIsUniqueUsername(false);
    }
  };

  const handlePasswordChange = (value: string) => {
    setNewPassword(value);
    const errors = getPasswordValidationErrors(value);
    setPasswordErrors(errors);
    if (registerError && errors.length === 0) {
      setRegisterError("");
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (registerError && value === newPassword) {
      setRegisterError("");
    }
  };

  const PASSWORD_SPECIAL_CHAR_REGEX = /[!@#$%^&*(),.?":{}|<>_+\-=\[\]\\/'`~]/;

  return (
    <div className="login-register">
      <div className="login-register-inner">
        <div className="login-register-header">
          <h1>Log In | Register</h1>
          <p>Sign in to continue or create an account to start selling and collecting.</p>
        </div>
        <div className="container">
          <div className="auth-card">
            <h2>Returning Customer</h2>
            <p>Log in to check-in with your existing AniThrift account.</p>
            <form onSubmit={handleLogin}>
              <input
                className="auth-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                required
              />
              <input
                className="auth-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
              <button type="submit" className="auth-button">
                Login
              </button>
              <Link to="/forgot-password" className="forgot-password">
                Forgot password?
              </Link>
            </form>
            {loginError && <p className="error-message">{loginError}</p>}
          </div>

          <div className="auth-card">
            <h2>New Customer</h2>
            <p>Create a free account to list items, message sellers, and track your orders.</p>
            <form onSubmit={handleRegister}>
              <input
                className="auth-input"
                type="text"
                value={username}
                onChange={handleChange}
                placeholder="Username"
                required
              />
              {username && (
                <ul className="validation-list">
                  {getUsernameValidationRules(username).map((rule) => (
                    <li key={rule.key} className={rule.test ? "met" : "unmet"}>
                      {rule.label}
                    </li>
                  ))}
                  <li
                    className={
                      username.length >= 6 && isUsernameUnique ? "met" : "unmet"
                    }
                  >
                    Username is available
                  </li>
                </ul>
              )}
              <input
                className="auth-input"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Email Address"
                required
              />

              <input
                className="auth-input"
                type="password"
                value={newPassword}
                onChange={(e) => handlePasswordChange(e.target.value)}
                placeholder="Password"
                required
              />
              {newPassword && (
                <ul className="validation-list">
                  <li className={newPassword.length >= 8 ? "met" : "unmet"}>
                    At least 8 characters
                  </li>
                  <li className={/[A-Z]/.test(newPassword) ? "met" : "unmet"}>
                    Contains an uppercase letter
                  </li>
                  <li className={/[a-z]/.test(newPassword) ? "met" : "unmet"}>
                    Contains a lowercase letter
                  </li>
                  <li className={/[0-9]/.test(newPassword) ? "met" : "unmet"}>
                    Contains a number
                  </li>
                  <li
                    className={
                      PASSWORD_SPECIAL_CHAR_REGEX.test(newPassword)
                        ? "met"
                        : "unmet"
                    }
                  >
                    Contains a special character
                  </li>
                </ul>
              )}
              <input
                className="auth-input"
                type="password"
                value={confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                placeholder="Re-type Password"
                required
              />
              <label className="auth-checkbox required-checkbox">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => {
                    setAcceptedTerms(e.target.checked);
                    if (e.target.checked && registerError.includes("Terms and Conditions")) {
                      setRegisterError("");
                    }
                  }}
                  required
                />
                <span>
                  I agree to the{" "}
                  <button
                    type="button"
                    className="terms-link"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setTermsModalOpen(true);
                    }}
                  >
                    Terms and Conditions
                  </button>
                </span>
              </label>
              <label className="auth-checkbox">
                <input
                  type="checkbox"
                  checked={signUpPromo}
                  onChange={(e) => setSignUpPromo(e.target.checked)}
                />
                Yes, please sign me up for exclusive offers and promotions
              </label>
              <button
                type="submit"
                className="auth-button"
                disabled={!acceptedTerms}
              >
                Create Account
              </button>
            </form>
            {registerError && <p className="error-message">{registerError}</p>}
          </div>
        </div>
      </div>

      {/* Terms and Conditions Modal */}
      <Dialog
        open={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "24px 24px 16px",
            borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 600 }}>
            Terms and Conditions
          </h2>
          <IconButton
            onClick={() => setTermsModalOpen(false)}
            sx={{
              padding: "4px",
            }}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            padding: "24px",
            overflowY: "auto",
          }}
        >
          <div className="terms-modal-content">
            <p style={{ marginBottom: "24px", color: "#666" }}>
              Last updated: {new Date().toLocaleDateString()}
            </p>
            <h3 style={{ marginTop: "24px", marginBottom: "12px", fontSize: "1.2rem", fontWeight: 600 }}>
              1. Acceptance of Terms
            </h3>
            <p style={{ marginBottom: "20px", lineHeight: 1.6 }}>
              By accessing and using AniThrift, you accept and agree to be bound
              by the terms and provision of this agreement.
            </p>
            <h3 style={{ marginTop: "24px", marginBottom: "12px", fontSize: "1.2rem", fontWeight: 600 }}>
              2. Use License
            </h3>
            <p style={{ marginBottom: "20px", lineHeight: 1.6 }}>
              Permission is granted to temporarily use AniThrift for personal,
              non-commercial transitory viewing only. This is the grant of a
              license, not a transfer of title.
            </p>
            <h3 style={{ marginTop: "24px", marginBottom: "12px", fontSize: "1.2rem", fontWeight: 600 }}>
              3. User Accounts
            </h3>
            <p style={{ marginBottom: "20px", lineHeight: 1.6 }}>
              You are responsible for maintaining the confidentiality of your
              account and password. You agree to accept responsibility for all
              activities that occur under your account.
            </p>
            <h3 style={{ marginTop: "24px", marginBottom: "12px", fontSize: "1.2rem", fontWeight: 600 }}>
              4. Prohibited Uses
            </h3>
            <p style={{ marginBottom: "12px", lineHeight: 1.6 }}>You may not use our service:</p>
            <ul style={{ marginBottom: "20px", paddingLeft: "24px", lineHeight: 1.8 }}>
              <li>For any unlawful purpose</li>
              <li>To violate any laws or regulations</li>
              <li>To infringe upon the rights of others</li>
              <li>To transmit harmful or malicious code</li>
              <li>To spam or harass other users</li>
            </ul>
            <h3 style={{ marginTop: "24px", marginBottom: "12px", fontSize: "1.2rem", fontWeight: 600 }}>
              5. Seller Responsibilities
            </h3>
            <p style={{ marginBottom: "20px", lineHeight: 1.6 }}>
              Sellers are responsible for accurately describing items, shipping
              products as described, and handling customer service inquiries.
            </p>
            <h3 style={{ marginTop: "24px", marginBottom: "12px", fontSize: "1.2rem", fontWeight: 600 }}>
              6. Buyer Responsibilities
            </h3>
            <p style={{ marginBottom: "20px", lineHeight: 1.6 }}>
              Buyers are responsible for reviewing item descriptions, making timely
              payments, and providing accurate shipping information.
            </p>
            <h3 style={{ marginTop: "24px", marginBottom: "12px", fontSize: "1.2rem", fontWeight: 600 }}>
              7. Limitation of Liability
            </h3>
            <p style={{ marginBottom: "20px", lineHeight: 1.6 }}>
              AniThrift shall not be liable for any indirect, incidental, special,
              or consequential damages resulting from the use or inability to use the
              service.
            </p>
            <h3 style={{ marginTop: "24px", marginBottom: "12px", fontSize: "1.2rem", fontWeight: 600 }}>
              8. Changes to Terms
            </h3>
            <p style={{ marginBottom: "20px", lineHeight: 1.6 }}>
              We reserve the right to modify these terms at any time. Your continued
              use of the service constitutes acceptance of any changes.
            </p>
          </div>
        </DialogContent>
        <DialogActions
          sx={{
            padding: "16px 24px",
            borderTop: "1px solid rgba(0, 0, 0, 0.12)",
          }}
        >
          <Button
            onClick={() => setTermsModalOpen(false)}
            variant="contained"
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              padding: "8px 24px",
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SignInPage;
