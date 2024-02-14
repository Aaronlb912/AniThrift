import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import SignInPage from "./pages/SignInPage";
import CartPage from "./pages/CartPage";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="app">
      <Header />
      <Routes>
        {/* <Route path="/" element={<HomePage />} /> */}
        <Route path="pages/SignInPage.css" element={<SignInPage />} />
        {/* <Route path="/cart" element={<CartPage />} /> */}
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
