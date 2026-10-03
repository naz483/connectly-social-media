import { useState } from "react";
import { apiRequest } from "../api/api";

function Settings() {
  const [newUsername, setNewUsername] = useState("");
  const [message, setMessage] = useState("");

  const currentUsername =
    localStorage.getItem("username") || "User";

  const changeUsername = async () => {
    const username = newUsername.trim();

    if (!username) {
      alert("Please enter a new username.");
      return;
    }

    try {
      const data = await apiRequest(
        "/api/change-username/",
        {
          method: "PATCH",
          body: JSON.stringify({
            username: username,
          }),
        }
      );

      localStorage.setItem(
        "username",
        data.username
      );

      setNewUsername("");
      setMessage(
        "Username changed successfully! 🎉"
      );
    } catch (error) {
      alert(
        "Could not change username: " +
          error.message
      );
    }
  };

  return (
    <div className="settings-box">
      <h2>⚙️ Settings</h2>

      <p>
        Current username:{" "}
        <strong>{currentUsername}</strong>
      </p>

      <input
        type="text"
        placeholder="Enter new username"
        value={newUsername}
        onChange={(e) =>
          setNewUsername(e.target.value)
        }
      />

      <br />

      <button
        className="change-username-button"
        onClick={changeUsername}
      >
        Change Username
      </button>

      {message && (
        <p className="username-message">
          {message}
        </p>
      )}
    </div>
  );
}

export default Settings;