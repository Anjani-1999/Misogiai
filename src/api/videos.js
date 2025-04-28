import axios from "axios";
const API_BASE_URL = "http://localhost:8083";

export const fetchVideos = (payload, token) => {
  // Only use userId if it is explicitly provided in the payload
  return axios.post(`${API_BASE_URL}/auth/api/get/video/filter`, payload, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const fetchVideoDetail = (id, token) =>
  axios.get(`${API_BASE_URL}/auth/api/get/video/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const uploadVideo = (formData, token) =>
  axios.post(`${API_BASE_URL}/auth/api/upload/video`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

// Add more video-related API functions as needed
