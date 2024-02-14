import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignInPage from "./pages/SignInPage";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { auth } from './firebase-config'; // Adjust the path according to your project structure
import { onAuthStateChanged } from "firebase/auth";


const Root = () => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
  }, []);

  return (
    <Router>
      <App user={currentUser} />
    </Router>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
    <Header />
      <Routes>
        <Route path="/" element={<App />}></Route>
        <Route path="/signin" element={<SignInPage />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);
