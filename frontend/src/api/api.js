const API_BASE_URL = "http://127.0.0.1:8000";

export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem("access_token");

  const isFormData = options.body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,

    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),

      ...(token && {
        Authorization: `Bearer ${token}`,
      }),

      ...(options.headers || {}),
    },
  });

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();

  let data = {};

  if (text) {
    try {
      data = JSON.parse(text);
    } catch (error) {
      throw new Error("Server returned an invalid response.");
    }
  }

  if (!response.ok) {
    throw new Error(
      data.message ||
      data.detail ||
      data.error ||
      "Something went wrong"
    );
  }

  return data;
};