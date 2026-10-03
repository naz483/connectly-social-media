import { useEffect, useState } from "react";
import { apiRequest } from "../api/api";

function Home() {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editingPostId, setEditingPostId] = useState(null);
  const [editingContent, setEditingContent] = useState("");

  const getPosts = async () => {
    try {
      setLoading(true);
      setMessage("");

      const data = await apiRequest("/api/posts/");

      setPosts(
        Array.isArray(data) ? data : data.results || []
      );
    } catch (error) {
      console.error("Could not fetch posts:", error);

      setMessage(
        "Unable to connect to the server. Please make sure Django is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPosts();
  }, []);

  const likePost = async (postId) => {
    try {
      await apiRequest(`/api/posts/${postId}/like/`, {
        method: "POST",
      });

      getPosts();
    } catch (error) {
      alert("Could not like post: " + error.message);
    }
  };

  const getComments = async (postId) => {
    try {
      const data = await apiRequest(
        `/api/comments/?post=${postId}`
      );

      setComments((previous) => ({
        ...previous,
        [postId]: Array.isArray(data)
          ? data
          : data.results || [],
      }));
    } catch (error) {
      console.error("Could not fetch comments:", error);
    }
  };

  const addComment = async (postId) => {
    const text = commentText[postId]?.trim();

    if (!text) {
      alert("Please write a comment.");
      return;
    }

    try {
      await apiRequest("/api/comments/", {
        method: "POST",
        body: JSON.stringify({
          post: postId,
          content: text,
        }),
      });

      setCommentText((previous) => ({
        ...previous,
        [postId]: "",
      }));

      getComments(postId);
    } catch (error) {
      alert("Could not add comment: " + error.message);
    }
  };

  const startEdit = (post) => {
    setEditingPostId(post.id);
    setEditingContent(post.content);
  };

  const cancelEdit = () => {
    setEditingPostId(null);
    setEditingContent("");
  };

  const saveEdit = async (postId) => {
    if (!editingContent.trim()) {
      alert("Post cannot be empty.");
      return;
    }

    try {
      await apiRequest(`/api/posts/${postId}/`, {
        method: "PATCH",
        body: JSON.stringify({
          content: editingContent,
        }),
      });

      setEditingPostId(null);
      setEditingContent("");

      getPosts();
    } catch (error) {
      alert("Could not edit post: " + error.message);
    }
  };

  const deletePost = async (postId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this post?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await apiRequest(`/api/posts/${postId}/`, {
        method: "DELETE",
      });

      getPosts();
    } catch (error) {
      alert("Could not delete post: " + error.message);
    }
  };

  return (
    <div>
      <h2 className="posts-title">Home</h2>

      {message && (
        <div className="error-message">
          <p>{message}</p>

          <button
            className="retry-button"
            onClick={getPosts}
          >
            🔄 Try Again
          </button>
        </div>
      )}

      {loading ? (
        <p>Loading posts...</p>
      ) : posts.length === 0 ? (
        <p>No posts available.</p>
      ) : (
        posts.map((post) => (
          <div className="post-card" key={post.id}>

            <h3 className="post-author">
              👤 {post.author?.username || "User"}
            </h3>

            {editingPostId === post.id ? (
              <>
                <textarea
                  value={editingContent}
                  onChange={(e) =>
                    setEditingContent(e.target.value)
                  }
                  rows="4"
                />

                <br />

                <button
                  className="save-button"
                  onClick={() => saveEdit(post.id)}
                >
                  Save
                </button>

                <button
                  className="cancel-button"
                  onClick={cancelEdit}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <p className="post-content">
                  {post.content}
                </p>

                <p className="post-time">
                  🕒{" "}
                  {new Date(
                    post.created_at
                  ).toLocaleString()}
                </p>

                {post.image && (
                  <img
                    src={post.image}
                    alt="Post"
                    className="post-image"
                  />
                )}

                <p className="like-count">
                  ❤️ {post.likes?.length || 0}
                </p>

                <button
                  className="like-button"
                  onClick={() => likePost(post.id)}
                >
                  ❤️ Like
                </button>

                <button
                  className="edit-button"
                  onClick={() => startEdit(post)}
                >
                  ✏️ Edit
                </button>

                <button
                  className="delete-button"
                  onClick={() => deletePost(post.id)}
                >
                  🗑️ Delete
                </button>

                <div className="comments-section">
                  <h4>💬 Comments</h4>

                  {(comments[post.id] || []).map(
                    (comment) => (
                      <div
                        className="comment"
                        key={comment.id}
                      >
                        <strong>
                          {comment.author?.username ||
                            "User"}
                        </strong>

                        <span>
                          {comment.content}
                        </span>
                      </div>
                    )
                  )}

                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={
                      commentText[post.id] || ""
                    }
                    onChange={(e) =>
                      setCommentText((previous) => ({
                        ...previous,
                        [post.id]: e.target.value,
                      }))
                    }
                  />

                  <button
                    className="comment-button"
                    onClick={() =>
                      addComment(post.id)
                    }
                  >
                    Comment
                  </button>

                  <button
                    className="load-comments-button"
                    onClick={() =>
                      getComments(post.id)
                    }
                  >
                    View Comments
                  </button>
                </div>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default Home;