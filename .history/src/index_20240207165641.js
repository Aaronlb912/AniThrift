import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignInPage from "./pages/SignInPage";
import Header from "./components/Header";

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
    <Header />
      <Routes>
        <Route path="/" element={<App />}></Route>
        <Route path="/signin" element={<SignInPage />} />
      </Routes>
      <
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);
