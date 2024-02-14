// src/SignInPage.js
import React, { useState } from "react";
import { auth } from "../firebase-config";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import "../css/Signin.css"; // Make sure you have your CSS file at src/signin.css

const SignInPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

    // Additional state for new user registration
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [signUpPromo, setSignUpPromo] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
          await signInWithEmailAndPassword(auth, email, password);
          console.log("User logged in");
          // Navigate to another page or show success message
        } catch (error) {
          console.error("Login error:", error.message);
          // Handle login errors (e.g., show an error message)
        }
      };
    
      const handleRegister = async (e) => {
        e.preventDefault();
        // Simple password match check (implement more comprehensive checks as needed)
        if (newPassword !== confirmPassword) {
          console.error("Passwords do not match");
          return;
        }
        try {
          await createUserWithEmailAndPassword(auth, newEmail, newPassword);
          console.log("User registered");
          // Navigate or show success message
        } catch (error) {
          console.error("Registration error:", error.message);
          // Handle registration errors
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
            <span className="required">*</span> Required
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
            <a href="#" className="forgot-password">
              Forgot password?
            </a>
          </form>
        </div>
        <newUsew className="new-user">
          <h2>New Customer</h2>
          <p>Create an account for free</p>
          <p><span className="required">*</span> Required</p>
          <form onSubmit={handleRegister}>
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name" required />
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" required />
            <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Email Address" required />
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Password" required />
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter Password" required />
            <label>
              <input type="checkbox" checked={signUpPromo} onChange={(e) => setSignUpPromo(e.target.checked)} /> Yes, please sign me up for exclusive offers and promotions
            </label>
            <button type="submit">Create Account</button>
          </form>
        </newUsew>      </div>
    </div>
  );
};

export default SignInPage;
