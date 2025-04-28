const API_BASE_URL =
  "https://test-service-dev-1084792667556.us-central1.run.app";

export const fetchTags = async (token) => {
  const response = await fetch(`${API_BASE_URL}/auth/api/tags`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};
