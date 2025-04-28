import React, { useState } from "react";
import { FiMail, FiLock, FiEye, FiEyeOff, FiX, FiPhone } from "react-icons/fi";

const AuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    mobile: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!isLogin) {
      // Sign up validation
      if (
        !form.email ||
        !form.password ||
        !form.confirmPassword ||
        !form.mobile
      ) {
        setError("All fields are required.");
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(
          "https://test-service-dev-1084792667556.us-central1.run.app/auth/sign-up",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userName: form.email,
              userEmail: form.email,
              userMobileNo: form.mobile,
              userPassword: form.password,
              userRole: "ROLE_MANAGER",
            }),
          }
        );
        if (!res.ok) {
          const err = await res.json();
          setError(err.message || "Sign up failed");
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (data.access_token) {
          localStorage.setItem("access_token", data.access_token);
        }
        if (data.refresh_token) {
          localStorage.setItem("refresh_token", data.refresh_token);
        }
        // Store user_id from response
        if (data.userId) {
          localStorage.setItem("user_id", data.userId);
        } else if (data.data?.userId) {
          localStorage.setItem("user_id", data.data.userId);
        }
        setLoading(false);
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      } catch (err) {
        setError("Sign up failed. Please try again.");
        setLoading(false);
      }
    } else {
      // LOGIN
      setLoading(true);
      try {
        // Create Basic Auth header
        const basicAuth = btoa(`${form.email}:${form.password}`);
        const response = await fetch(
          "https://test-service-dev-1084792667556.us-central1.run.app/auth/sign-in",
          {
            method: "GET",
            headers: {
              Authorization: `Basic ${basicAuth}`,
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.message || "Login failed");
          setLoading(false);
          return;
        }

        const data = await response.json();
        console.log("Login response:", data); // Debug log

        // Store tokens from response
        if (data.access_token) {
          localStorage.setItem("access_token", data.access_token);
        } else if (data.data?.access_token) {
          localStorage.setItem("access_token", data.data.access_token);
        }

        // Store user_id from response
        if (data.userId) {
          localStorage.setItem("user_id", data.userId);
        } else if (data.data?.userId) {
          localStorage.setItem("user_id", data.data.userId);
        }

        // Get refresh token from response or cookies
        if (data.refresh_token) {
          localStorage.setItem("refresh_token", data.refresh_token);
        } else if (data.data?.refresh_token) {
          localStorage.setItem("refresh_token", data.data.refresh_token);
        } else {
          const cookies = document.cookie.split(";");
          const refreshTokenCookie = cookies.find((cookie) =>
            cookie.trim().startsWith("refresh_token=")
          );
          if (refreshTokenCookie) {
            const refreshToken = refreshTokenCookie.split("=")[1];
            localStorage.setItem("refresh_token", refreshToken);
          }
        }

        // Clear form and close modal
        setForm({
          email: "",
          password: "",
          confirmPassword: "",
          mobile: "",
        });
        setLoading(false);
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      } catch (err) {
        console.error("Login error:", err); // Debug log
        setError("Login failed. Please try again.");
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-[#181818] rounded-xl shadow-lg w-full max-w-md p-8 relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
          onClick={onClose}
        >
          <FiX size={24} />
        </button>
        <div className="flex flex-col items-center mb-6">
          {/* Logo placeholder */}
          <div className="bg-[#0a0a23] rounded-lg p-4 mb-4 flex items-center justify-center">
            <span className="text-white text-2xl font-bold tracking-widest">
              CC
            </span>
          </div>
          <h2 className="text-white text-2xl font-bold mb-1">
            Welcome to CodeCast
          </h2>
          <p className="text-gray-400 text-sm mb-4">
            Sign {isLogin ? "in" : "up"} to start your journey with us
          </p>
          <button className="flex items-center justify-center w-full bg-white text-gray-900 font-medium py-2 rounded-md mb-4 shadow hover:bg-gray-100">
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5 mr-2"
            />
            Sign {isLogin ? "in" : "up"} with Google
          </button>
        </div>
        <div className="flex items-center mb-4">
          <div className="flex-1 h-px bg-gray-700" />
          <span className="mx-3 text-gray-400">Or</span>
          <div className="flex-1 h-px bg-gray-700" />
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-3 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <FiMail />
            </span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full bg-[#232323] text-white pl-10 pr-3 py-2 rounded-md border border-gray-700 focus:outline-none focus:border-orange-500"
            />
          </div>
          {/* Mobile number for sign up */}
          {!isLogin && (
            <div className="mb-3 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <FiPhone />
              </span>
              <input
                type="text"
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                placeholder="Enter your mobile number"
                className="w-full bg-[#232323] text-white pl-10 pr-3 py-2 rounded-md border border-gray-700 focus:outline-none focus:border-orange-500"
              />
            </div>
          )}
          <div className="mb-2 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <FiLock />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter Password"
              className="w-full bg-[#232323] text-white pl-10 pr-10 py-2 rounded-md border border-gray-700 focus:outline-none focus:border-orange-500"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          {/* Confirm Password for Sign Up */}
          {!isLogin && (
            <div className="mb-2 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <FiLock />
              </span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                className="w-full bg-[#232323] text-white pl-10 pr-10 py-2 rounded-md border border-gray-700 focus:outline-none focus:border-orange-500"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                onClick={() => setShowConfirmPassword((v) => !v)}
                tabIndex={-1}
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          )}
          {/* Forgot Password only for Login */}
          {isLogin && (
            <div className="flex justify-between items-center mb-4">
              <span></span>
              <button
                type="button"
                className="text-orange-400 text-sm hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          )}
          {error && <div className="text-red-400 text-sm mb-2">{error}</div>}
          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-md transition mb-2 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
          </button>
        </form>
        <div className="text-center mt-2 text-gray-400 text-sm">
          {isLogin ? (
            <>
              Don't have an account?{" "}
              <button
                className="text-orange-400 hover:underline"
                onClick={() => setIsLogin(false)}
              >
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                className="text-orange-400 hover:underline"
                onClick={() => setIsLogin(true)}
              >
                Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
