const API_BASE_URL = "http://localhost:8083";
const FRONTEND_ORIGIN = "http://localhost:5173";

export const validateToken = async () => {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/api/validate/token`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Origin: FRONTEND_ORIGIN,
      },
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      return data.data && data.data.authenticated;
    }

    // If we get a 500 error or other error, try to refresh the token
    if (response.status === 500 || response.status === 401) {
      console.log("Token validation failed, attempting to refresh token...");
      const newToken = await refreshAccessToken();
      if (newToken) {
        console.log("Token refreshed successfully");
        // Retry the validation with the new token
        const retryResponse = await fetch(
          `${API_BASE_URL}/auth/api/validate/token`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${newToken}`,
              Origin: FRONTEND_ORIGIN,
            },
            credentials: "include",
          }
        );
        if (retryResponse.ok) {
          const retryData = await retryResponse.json();
          return retryData.data && retryData.data.authenticated;
        }
      }
      console.log("Token refresh failed");
      return false;
    }

    return false;
  } catch (error) {
    console.error("Token validation error:", error);
    return false;
  }
};

export const logout = async () => {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) return;

  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Origin: FRONTEND_ORIGIN,
      },
      credentials: "include",
    });
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    // Clear local storage regardless of API response
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userName");
    localStorage.removeItem("refreshToken");
  }
};

export const getRefreshToken = () => {
  // Get refresh token from cookies
  const cookies = document.cookie.split(";");
  const refreshTokenCookie = cookies.find((cookie) =>
    cookie.trim().startsWith("refresh_token=")
  );
  return refreshTokenCookie ? refreshTokenCookie.split("=")[1] : null;
};

export async function refreshAccessToken() {
  // First try to get refresh token from localStorage
  let refreshToken = localStorage.getItem("refreshToken");

  // If not in localStorage, try to get from cookies
  if (!refreshToken) {
    refreshToken = getRefreshTokenFromCookies();
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
  }

  if (!refreshToken) {
    console.log("No refresh token found");
    return null;
  }

  try {
    console.log("Attempting to refresh token...");
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${refreshToken}`,
        Origin: FRONTEND_ORIGIN,
      },
      credentials: "include",
    });

    if (!response.ok) {
      console.error("Failed to refresh token:", response.status);
      // Clear invalid tokens
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      return null;
    }

    const data = await response.json();
    if (data.access_token) {
      console.log("New access token received");
      localStorage.setItem("accessToken", data.access_token);

      // Update refresh token if a new one is provided in cookies
      const newRefreshToken = getRefreshTokenFromCookies();
      if (newRefreshToken) {
        localStorage.setItem("refreshToken", newRefreshToken);
      }
      return data.access_token;
    }
    console.log("No access token in refresh response");
    return null;
  } catch (err) {
    console.error("Error refreshing token:", err);
    // Clear tokens on error
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    return null;
  }
}

export async function fetchWithAuth(url, options = {}) {
  let token = localStorage.getItem("accessToken");
  let res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      Origin: FRONTEND_ORIGIN,
    },
    credentials: "include",
  });

  if (res.status === 401 || res.status === 403 || res.status === 500) {
    // Try to refresh token
    token = await refreshAccessToken();
    if (token) {
      // Retry original request
      res = await fetch(url, {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${token}`,
          Origin: FRONTEND_ORIGIN,
        },
        credentials: "include",
      });
    }
  }
  return res;
}

export async function logoutUser() {
  const token = localStorage.getItem("accessToken");
  if (!token) return;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Origin: FRONTEND_ORIGIN,
      },
      credentials: "include",
    });

    if (response.ok) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    } else {
      console.error("Logout failed with status:", response.status);
      throw new Error("Logout failed");
    }
  } catch (err) {
    console.error("Logout error:", err);
    // Don't remove the token if the request failed
  }
}

// Helper function to get refresh token from cookies
function getRefreshTokenFromCookies() {
  const cookies = document.cookie.split(";");
  const refreshTokenCookie = cookies.find((cookie) =>
    cookie.trim().startsWith("refresh_token=")
  );
  return refreshTokenCookie ? refreshTokenCookie.split("=")[1] : null;
}
