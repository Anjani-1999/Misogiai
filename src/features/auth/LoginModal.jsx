import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { validateToken, logout } from "../../api/auth";

const API_BASE_URL =
  "https://test-service-dev-1084792667556.us-central1.run.app";
const FRONTEND_ORIGIN = "http://localhost:5173";

const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const getRefreshTokenFromCookies = () => {
    console.log("Current cookies:", document.cookie);
    const cookies = document.cookie.split(";");
    console.log("Split cookies:", cookies);
    const refreshTokenCookie = cookies.find((cookie) => {
      const trimmedCookie = cookie.trim();
      console.log("Checking cookie:", trimmedCookie);
      return trimmedCookie.startsWith("refresh_token=");
    });
    console.log("Found refresh token cookie:", refreshTokenCookie);
    if (refreshTokenCookie) {
      const token = refreshTokenCookie.split("=")[1].trim();
      console.log("Extracted refresh token:", token);
      return token;
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isSignUp) {
      // SIGN UP
      try {
        const response = await fetch(`${API_BASE_URL}/auth/sign-up`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Origin: FRONTEND_ORIGIN,
          },
          credentials: "include",
          body: JSON.stringify({
            userName: email,
            userEmail: email,
            userPassword: password,
            userRole: "ROLE_MANAGER",
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          setError(data.message || "Sign up failed");
          setLoading(false);
          return;
        }
        // Save access token and user info
        if (data.access_token) {
          localStorage.setItem("accessToken", data.access_token);
          localStorage.setItem("userName", data.user_name);
          // Get refresh token from response headers
          const refreshToken = data.refresh_token || data.data?.refresh_token;
          if (refreshToken) {
            console.log("Storing refresh token from response:", refreshToken);
            localStorage.setItem("refreshToken", refreshToken);
          } else {
            console.log("No refresh token in response");
          }
        }
        // Store user_id from response
        if (data.userId) {
          localStorage.setItem("user_id", data.userId);
        } else if (data.data && data.data.userId) {
          localStorage.setItem("user_id", data.data.userId);
        }
        setLoading(false);
        // Pass the entire response object to the parent component
        onLoginSuccess(data);
      } catch (err) {
        setError("An error occurred during sign up");
        setLoading(false);
      }
    } else {
      // LOGIN
      try {
        // Create Basic Auth header
        const basicAuth = btoa(`${email}:${password}`);
        const response = await fetch(`${API_BASE_URL}/auth/sign-in`, {
          method: "GET",
          headers: {
            Authorization: `Basic ${basicAuth}`,
            Origin: FRONTEND_ORIGIN,
          },
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Login failed");
          setLoading(false);
          return;
        }

        // Store access token and user info
        if (data.data && data.data.access_token) {
          localStorage.setItem("accessToken", data.data.access_token);
          localStorage.setItem("userName", data.data.user_name);
        }
        // Store user_id from response
        if (data.userId) {
          localStorage.setItem("user_id", data.userId);
        } else if (data.data && data.data.userId) {
          localStorage.setItem("user_id", data.data.userId);
        }
        // Get refresh token from response data
        const refreshToken = data.data.refresh_token || data.refresh_token;
        if (refreshToken) {
          console.log("Storing refresh token from response:", refreshToken);
          localStorage.setItem("refreshToken", refreshToken);
        } else {
          console.log("No refresh token in response");
        }

        // Clear sensitive fields
        setEmail("");
        setPassword("");
        setLoading(false);
        // Pass the correct object to the parent component (login)
        onLoginSuccess(data.data);
      } catch (err) {
        setError("An error occurred during login");
        setLoading(false);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      setError("Error during logout");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {isSignUp ? "Sign Up" : "Login"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="flex items-center justify-between mb-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            >
              {loading
                ? isSignUp
                  ? "Signing Up..."
                  : "Signing In..."
                : isSignUp
                ? "Sign Up"
                : "Sign In"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        </form>
        <div className="text-center mt-2">
          <button
            type="button"
            onClick={() => setIsSignUp((prev) => !prev)}
            className="text-indigo-600 hover:underline"
          >
            {isSignUp
              ? "Already have an account? Login"
              : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
