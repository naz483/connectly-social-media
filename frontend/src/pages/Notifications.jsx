import { useEffect, useState } from "react";
import { apiRequest } from "../api/api";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const data = await apiRequest("/api/notifications/");

      setNotifications(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      alert("Could not load notifications: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  return (
    <div className="notifications-box">
      <h2>🔔 Notifications</h2>

      {loading && <p>Loading notifications...</p>}

      {!loading && notifications.length === 0 && (
        <p className="no-notifications">
          No notifications yet.
        </p>
      )}

      {!loading && notifications.length > 0 && (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div
              className={`notification-item ${
                notification.is_read ? "" : "unread"
              }`}
              key={notification.id}
            >
              <div className="notification-icon">
                🔔
              </div>

              <div className="notification-content">
                <p>{notification.message}</p>

                <small>
                  {new Date(
                    notification.created_at
                  ).toLocaleString()}
                </small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;