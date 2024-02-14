import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import SignInPage from "./pages/SignInPage";
import CartPage from "./pages/CartPage";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Header />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </BrowserRouter>
      </header>
    </div>
  );
}

export default App;
