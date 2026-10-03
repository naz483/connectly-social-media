import { useState } from "react";
import { apiRequest } from "./api/api";

function Login({ onLogin, onRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const data = await apiRequest("/api/token/", {
        method: "POST",
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      localStorage.setItem("username", username);
      onLogin();

    } catch (error) {
      alert("Login failed: " + error.message);
    }
  };

  return (
  <div className="login-container">
    <h1>Connectly</h1>
    <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <br />

        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <br />

        <button type="submit">
          Login
        </button>
      </form>
            <p style={{ marginTop: "18px", textAlign: "center" }}>
        Don't have an account?{" "}
        <button
          type="button"
          onClick={onRegister}
          style={{
            background: "none",
            color: "#5b326d",
            padding: 0,
            margin: 0,
            boxShadow: "none",
          }}
        >
          Create Account
        </button>
      </p>
    </div>
  );
}

export default Login;
