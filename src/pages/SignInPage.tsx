import React, { useState, useEffect, useCallback } from "react";
import { auth, db } from "../firebase-config";
import { doc, setDoc, getDoc } from "firebase/firestore";
import moment from "moment/moment";
import { debounce } from 'lodash';

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import "../css/Signin.css"; // Ensure the path is correct
import { useNavigate } from "react-router-dom";

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
  const [registerError, setRegisterError] = useState(""); // State for registration error
  const [loginError, setLoginError] = useState(""); // State for login error
  const [isUsernameUnique, setIsUniqueUsername] = useState(false)
  const [usernameIsValid, setUsernameIsValid] = useState(false)

  const reserveUsername = (user: any, username: string) => {
    const usernameRef = doc(db, "usernames", username.toLowerCase());
    const userRef = doc(db, "users", user.uid);
  }

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setRegisterError("Passwords do not match.");
      return;
    }
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

      // const creationDate = new Date().toISOString();

      // Add user details to Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid, // Unique identifier for the user
        email: newEmail,
        username: username, // Include username
        signUpPromo: signUpPromo,
        creationDate: moment().format("MMM Do YY"), // Log the account creation date
      });

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

  const renderUsernameExists = () => {
    return (
      <p>Username is taken</p>
    )
  }

  const renderUsernameValid = () => {
    return (
      <p>Username is valid</p>
    )
  }

  const renderUsernameNotValid = () => {
    return (
      <p>Username is not valid</p>
    )
  }

  const isValidUsername = (name: string) => {
    var nameRegex = /^[0-9A-Za-z]{6,16}$/;
    if (name.match(nameRegex)) {
      setUsernameIsValid(true)
      return true
    }
    setUsernameIsValid(false)
    return false
  }

  const checkUsername = async (name: string) => {
    const usernameRef = doc(db, "usernames", name.toLowerCase());
    const docSnap = await getDoc(usernameRef);
    console.log(name, ' exists', docSnap.exists());
    return !docSnap.exists();
  }

  const debouncedCheckUsername = useCallback(debounce((newUsername: string) => {
    checkUsername(newUsername).then(isUnique => {
      if (isUnique) {
        setIsUniqueUsername(true);
      } else {
        setIsUniqueUsername(false);
      }
    });
  }, 500), []);

  const handleChange = (e: any) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    if (isValidUsername(e.target.value)) {
      debouncedCheckUsername(newUsername);
    }
  };

  return (
    <div className="login-register">
      <h1>Log In | Register</h1>
      <div className="container">
        <div className="returning-user">
          <h2>Returning Customer</h2>
          <p>Login below to check-in with an existing account</p>
          <p>
            Required <span className="required">*</span>
          </p>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
            <button type="submit">Login</button>
            <a> </a>
            <a href="#" className="forgot-password">
              Forgot password?
            </a>
          </form>
          {loginError && <p className="error-message">{loginError}</p>}{" "}
          {/* Display login error */}
        </div>
        <div className="new-user">
          <h2>New Customer</h2>
          <p>Create an account for free</p>
          <p>
            Required <span className="required">*</span>
          </p>
          <form onSubmit={handleRegister}>
            <input
              type="text"
              value={username}
              onChange={handleChange}
              placeholder="Username"
              required
            />
            {isUsernameUnique && usernameIsValid && username.length > 5 ? renderUsernameValid() : null}
            {!isUsernameUnique && username.length > 5 ? renderUsernameExists() : null}
            {!usernameIsValid && username.length > 1 ? renderUsernameNotValid() : null}
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Email Address"
              required
            />

            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Password"
              required
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter Password"
              required
            />
            <label>
              <input
                type="checkbox"
                checked={signUpPromo}
                onChange={(e) => setSignUpPromo(e.target.checked)}
              />{" "}
              Yes, please sign me up for exclusive offers and promotions
            </label>
            <button type="submit">Create Account</button>
          </form>
          {registerError && <p className="error-message">{registerError}</p>}{" "}
          {/* Display registration error */}
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
