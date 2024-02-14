import "./App.css";
import Header from "./components/Header";
import HomePage from './pages/HomePage';
import SignInPage from './pages/SignInPage';
import CartPage from './pages/CartPage';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Header />
      </header>
    </div>
  );
}

export default App;
