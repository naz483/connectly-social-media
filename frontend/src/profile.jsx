import { useEffect, useState } from "react";
import { apiRequest } from "./api/api";

function Profile({ onBack }) {
  const [profile, setProfile] = useState(null);
  const [postCount, setPostCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const username = localStorage.getItem("username");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profiles = await apiRequest("/api/profiles/");

        const currentProfile = Array.isArray(profiles)
          ? profiles.find(
              (item) => item.user?.username === username
            )
          : profiles.results?.find(
              (item) => item.user?.username === username
            );

        setProfile(currentProfile);

        const posts = await apiRequest("/api/posts/");

        const postList = Array.isArray(posts)
          ? posts
          : posts.results || [];

        const userPosts = postList.filter(
          (post) => post.author?.username === username
        );

        setPostCount(userPosts.length);
      } catch (error) {
        console.error("Could not load profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [username]);

  if (loading) {
    return <p>Loading profile...</p>;
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <h2>Profile</h2>
        <p>Profile could not be loaded.</p>

        <button onClick={onBack}>
          ← Back
        </button>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-card">

        <div className="profile-picture">
          {profile.profile_image ? (
            <img
              src={profile.profile_image}
              alt="Profile"
            />
          ) : (
            <span>👤</span>
          )}
        </div>

        <h1>{profile.user.username}</h1>

        <p className="profile-email">
          {profile.user.email || "No email added"}
        </p>

        <p className="profile-bio">
          {profile.bio || "No bio added yet."}
        </p>

        <div className="profile-stats">
          <div>
            <strong>{postCount}</strong>
            <span>Posts</span>
          </div>

          <div>
            <strong>{profile.followers?.length || 0}</strong>
            <span>Followers</span>
          </div>
        </div>

        <button onClick={onBack}>
          ← Back to Home
        </button>

      </div>
    </div>
  );
}

export default Profile;