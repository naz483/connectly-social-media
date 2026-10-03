import { useState } from "react";
import { apiRequest } from "./api/api";

function Register({ onRegister }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    try {
      await apiRequest("/api/register/", {
        method: "POST",
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      alert("Registration successful! You can now login.");

      onRegister();
    } catch (error) {
      alert("Registration failed: " + error.message);
    }
  };

  return (
    <div className="login-container">
      <h1>Join Us 👋</h1>
      <h2>Create Account</h2>

      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button className="login-button" type="submit">
          Create Account
        </button>
      </form>

      <p style={{ marginTop: "18px", textAlign: "center" }}>
        Already have an account?{" "}
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
          Login
        </button>
      </p>
    </div>
  );
}

export default Register;