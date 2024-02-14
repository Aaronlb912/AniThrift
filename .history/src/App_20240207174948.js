import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from './firebase-config'; // Adjust the path according to your project structure



function App() {

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        setCurrentUser(user);
      } else {
        // User is signed out
        setCurrentUser(null);
      }
    });
  }, []);
  
  return <div className="app">

  </div>;
}

export default App;
