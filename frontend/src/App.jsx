import { useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import Login from "./login";
import Register from "./Register";

import Home from "./pages/Home";
import CreatePost from "./pages/Createpost";
import Search from "./pages/Search";
import Settings from "./pages/Setting";
import Notifications from "./pages/Notifications";
function App() {
  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem("access_token")
  );

  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = () => {
    setLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("username");
    setLoggedIn(false);
  };

  if (!loggedIn) {
    return showRegister ? (
      <Register
        onRegister={() => setShowRegister(false)}
      />
    ) : (
      <Login
        onLogin={handleLogin}
        onRegister={() => setShowRegister(true)}
      />
    );
  }

  return (
    <BrowserRouter>
      <div className="app-container">
        <header className="header">
          <h1>Connectly</h1>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </header>

        <nav className="navbar">
          <Link to="/">🏠 Home</Link>

          <Link to="/create">
            ➕ Create Post
          </Link>

          <Link to="/search">
            🔍 Search
          </Link>

          <Link to="/settings">
            ⚙️ Settings
          </Link>

          <Link to="/notifications">
            🔔 Notifications
          </Link>
        </nav>

        <main className="page-content">
          <Routes>
            <Route
              path="/"
              element={<Home />}
            />

            <Route
              path="/create"
              element={<CreatePost />}
            />

            <Route
              path="/search"
              element={<Search />}
            />

            <Route
              path="/settings"
              element={<Settings />}
            />

            <Route
              path="/notifications"
              element={<Notifications />}
            />

            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;