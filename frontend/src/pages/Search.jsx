import { useState } from "react";
import { apiRequest } from "../api/api";

function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const searchUsers = async () => {
    const query = searchQuery.trim();

    if (!query) {
      setSearchResults([]);
      setMessage("Please enter a username.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const data = await apiRequest(
        `/api/search-users/?q=${encodeURIComponent(query)}`
      );

      const results = Array.isArray(data) ? data : [];

      setSearchResults(results);

      if (results.length === 0) {
        setMessage("No users found.");
      }
    } catch (error) {
      setMessage("Could not search users: " + error.message);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const followUser = async (userId) => {
    try {
      const data = await apiRequest(
        `/api/follow-user/${userId}/`,
        {
          method: "POST",
        }
      );

      setMessage(data.message);

      await searchUsers();
    } catch (error) {
      setMessage("Could not update follow status: " + error.message);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      searchUsers();
    }
  };

  return (
    <div className="search-users-box">
      <h2>🔍 Search Users</h2>

      <div className="search-input-row">
        <input
          type="text"
          placeholder="Search by username..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setMessage("");
          }}
          onKeyDown={handleKeyDown}
        />

        <button
          className="search-users-button"
          onClick={searchUsers}
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {message && (
        <p className="search-message">
          {message}
        </p>
      )}

      {searchResults.length > 0 && (
        <div className="search-results">
          {searchResults.map((user) => (
            <div
              className="search-result"
              key={user.id}
            >
              <div className="search-user-info">
                <div className="search-avatar">
                  👤
                </div>

                <strong>{user.username}</strong>
              </div>

              <button
                className="follow-button"
                onClick={() => followUser(user.id)}
              >
                Follow / Unfollow
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Search;