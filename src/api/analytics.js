const API_BASE_URL = "http://localhost:8083";

export const fetchAnalytics = async (token) => {
  const response = await fetch(`${API_BASE_URL}/auth/api/analytics`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};
// Add more analytics-related API functions as needed
