import { useState } from "react";
import { apiRequest } from "../api/api";

function CreatePost() {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const selectedImage = e.target.files[0];

    if (!selectedImage) {
      setImage(null);
      setPreview("");
      return;
    }

    setImage(selectedImage);
    setPreview(URL.createObjectURL(selectedImage));
    setMessage("");
  };

  const createPost = async () => {
    if (!content.trim() && !image) {
      setMessage("Please write something or select an image.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const formData = new FormData();

      formData.append("content", content.trim());

      if (image) {
        formData.append("image", image);
      }

      await apiRequest("/api/posts/", {
        method: "POST",
        body: formData,
      });

      setContent("");
      setImage(null);
      setPreview("");

      const fileInput = document.getElementById("post-image");

      if (fileInput) {
        fileInput.value = "";
      }

      setMessage("Post created successfully! 🎉");
    } catch (error) {
      setMessage("Could not create post: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post">
      <h2>➕ Create a Post</h2>

      <textarea
        value={content}
        onChange={(e) => {
          if (e.target.value.length <= 1000) {
            setContent(e.target.value);
            setMessage("");
          }
        }}
        placeholder="What's on your mind?"
        rows="6"
        maxLength="1000"
      />

      <div className="character-count">
        {content.length}/1000
      </div>

      <label htmlFor="post-image" className="image-label">
        📷 Add a picture
      </label>

      <input
        id="post-image"
        type="file"
        accept="image/*"
        onChange={handleImageChange}
      />

      {preview && (
        <div className="image-preview">
          <p>Image preview:</p>

          <img
            src={preview}
            alt="Preview"
          />
        </div>
      )}

      <button
        className="create-button"
        onClick={createPost}
        disabled={loading}
      >
        {loading ? "Creating..." : "🚀 Create Post"}
      </button>

      {message && (
        <p className="username-message">
          {message}
        </p>
      )}
    </div>
  );
}

export default CreatePost;