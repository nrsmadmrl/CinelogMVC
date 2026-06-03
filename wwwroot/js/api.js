const API_URL = "/api";

const api = {
  async request(method, endpoint, body = null, auth = false) {
    const headers = { "Content-Type": "application/json" };

    if (auth) {
      const token = localStorage.getItem("token");
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(`${API_URL}${endpoint}`, options);
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Something went wrong");
    return data;
  },

  get: (endpoint, auth = false) => api.request("GET", endpoint, null, auth),
  post: (endpoint, body, auth = false) => api.request("POST", endpoint, body, auth),
  put: (endpoint, body, auth = false) => api.request("PUT", endpoint, body, auth),
  delete: (endpoint, auth = false) => api.request("DELETE", endpoint, null, auth),

  // Users
  getUsers: () => api.get("/users"),
  getUserById: (id) => api.get(`/users/${id}`),
  register: (data) => api.post("/users/register", data),
  login: (data) => api.post("/users/login", data),
  updateUser: (id, data) => api.put(`/users/${id}`, data, true),
  deleteUser: (id) => api.delete(`/users/${id}`, true),

  // Content
  getAllContent: (type, search) => {
    let query = "";
    if (type) query += `type=${type}`;
    if (search) query += `${query ? "&" : ""}search=${encodeURIComponent(search)}`;
    return api.get(`/content${query ? "?" + query : ""}`);
  },
  getContentById: (id) => api.get(`/content/${id}`),
  createContent: (data) => api.post("/content", data, true),
  updateContent: (id, data) => api.put(`/content/${id}`, data, true),
  deleteContent: (id) => api.delete(`/content/${id}`, true),

  // Reviews
  getReviewsByContent: (contentId) => api.get(`/reviews/content/${contentId}`),
  getReviewsByUser: (userId) => api.get(`/reviews/user/${userId}`),
  getAverageRating: (contentId) => api.get(`/reviews/content/${contentId}/average`),
  createReview: (data) => api.post("/reviews", data, true),
  updateReview: (id, data) => api.put(`/reviews/${id}`, data, true),
  deleteReview: (id) => api.delete(`/reviews/${id}`, true),

  // Posts
  getAllPosts: () => api.get("/posts"),
  getPostById: (id) => api.get(`/posts/${id}`),
  getPostsByUser: (userId) => api.get(`/posts/user/${userId}`),
  createPost: (data) => api.post("/posts", data, true),
  updatePost: (id, data) => api.put(`/posts/${id}`, data, true),
  deletePost: (id) => api.delete(`/posts/${id}`, true),

  // Comments
  getCommentsByPost: (postId) => api.get(`/comments/post/${postId}`),
  createComment: (data) => api.post("/comments", data, true),
  updateComment: (id, data) => api.put(`/comments/${id}`, data, true),
  deleteComment: (id) => api.delete(`/comments/${id}`, true),

  // Likes
  toggleLike: (postId) => api.post(`/likes/post/${postId}/toggle`, {}, true),
  getLikeStatus: (postId) => api.get(`/likes/post/${postId}/status`, true),

  // Lists
  getListsByUser: (userId) => api.get(`/lists/user/${userId}`),
  getListWithItems: (id) => api.get(`/lists/${id}`, true),
  createList: (data) => api.post("/lists", data, true),
  updateList: (id, data) => api.put(`/lists/${id}`, data, true),
  deleteList: (id) => api.delete(`/lists/${id}`, true),
  addToList: (listId, contentId) => api.post(`/lists/${listId}/items`, { contentId: contentId }, true),
  removeFromList: (listId, contentId) => api.delete(`/lists/${listId}/items/${contentId}`, true),
};
