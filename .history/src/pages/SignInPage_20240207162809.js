// src/SignInPage.js
import React, { useState } from 'react';
import { auth } from '../firebase-config';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import '../css/Signin.css'; // Make sure you have your CSS file at src/signin.css

const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
    // Similar to handleLogin, use createUserWithEmailAndPassword
    // Remember to validate inputs like matching passwords, valid email format, etc.
  };

  return (
    <div className="login-register">
      <h1>Log In | Register</h1>
      <div className="container">
        <div className="returning-user">
          <h2>Returning Customer</h2>
          <p>Login below to check-in with an existing account</p>
          <p><span className="required">*</span> Required</p>
          <form onSubmit={handleLogin}>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" required />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
            <button type="submit">Login</button>
            <a href="#" className="forgot-password">Forgot password?</a>
          </form>
        </div>
        {/* New user section similar to returning user, use handleRegister for form submission */}
      </div>
    </div>
  );
};

export default SignInPage;
