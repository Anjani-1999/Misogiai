const API_BASE_URL =
  "https://test-service-dev-1084792667556.us-central1.run.app";

export const fetchAnalytics = async (token) => {
  const response = await fetch(`${API_BASE_URL}/auth/api/analytics`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};
// Add more analytics-related API functions as needed
