import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import SignInPage from "./pages/SignInPage";
import CartPage from "./pages/CartPage";
import Footer from "./components/Footer";

function App() {
  return (
    <Router>
      <Header />

        {/* <Route path="/" element={<HomePage />} /> */}
        <Route path="/signin" element={<SignInPage />} />
        {/* <Route path="/cart" element={<CartPage />} /> */}
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
