const API_BASE_URL = "http://localhost:8083";

export const fetchTags = async (token) => {
  const response = await fetch(`${API_BASE_URL}/auth/api/tags`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};
