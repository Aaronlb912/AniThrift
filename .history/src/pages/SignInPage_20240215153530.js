import React, { useState } from "react";
import { auth, db } from "../firebase-config";
import { collection, addDoc } from "firebase/firestore";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import "../css/Signin.css";
import { useNavigate } from "react-router-dom";

const SignInPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState(""); // New state for username
  const [signUpPromo, setSignUpPromo] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [loginError, setLoginError] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setRegisterError("Passwords do not match.");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newEmail,
        newPassword
      );
      console.log("User registered", userCredential.user);

      // Optionally, set the displayName for the new user
      await updateProfile(userCredential.user, {
        displayName: firstName,
      });

      // Get the current date as account creation date
      const creationDate = new Date().toISOString();

      // Add user details to Firestore
      await addDoc(collection(db, "users"), {
        uid: userCredential.user.uid,
        email: newEmail,
        firstName: firstName,
        lastName: lastName,
        username: username, // Include username
        signUpPromo: signUpPromo,
        creationDate: creationDate, // Log the account creation date
      });

      navigate("/"); // Navigate to the homepage after successful registration
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

  return (
    <div className="login-register">
      <h1>Log In | Register</h1>
      <div className="container">
        {/* Returning User Form */}
        <newUser className="new-user">
          <h2>New Customer</h2>
          <p>Create an account for free</p>
          {/* Form Inputs */}
          <form onSubmit={handleRegister}>
            {/* Include all your existing form fields */}
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
            />
            {/* Continue with other form fields */}
          </form>
          {/* Display Registration Error */}
        </newUser>{" "}
      </div>
    </div>
  );
};

export default SignInPage;
