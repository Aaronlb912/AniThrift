import "./App.css";
import { Routes, Route } from 'react-router-dom';
import Header from "./components/Header";
import HomePage from './pages/HomePage';
import SignInPage from './pages/SignInPage';
import CartPage from './pages/CartPage';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Header />
        <Routes>
          <Switch>
            <Route path="/" element={<HomePage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/cart" element={<CartPage />} />
          </Switch>

      </Routes>
      </header>
    </div>
  );
}

export default App;
