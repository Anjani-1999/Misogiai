import React, { useState, useEffect, useRef, useCallback } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import VideoCard from "./components/VideoCard";
import { videos } from "./mockData";
import AuthModal from "./components/AuthModal";
import VideoUploadModal from "./components/VideoUploadModal";
import { Routes, Route, useLocation } from "react-router-dom";
import VideoDetail from "./components/VideoDetail";
import Analytics from "./components/Analytics";
import axios from "axios";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const location = useLocation();

  // Infinite scroll video state
  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef();

  const [tags, setTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState([]);
  const [difficulty, setDifficulty] = useState("");

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await fetch("http://localhost:8083/auth/refresh-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        throw new Error("Failed to refresh token");
      }

      const data = await response.json();
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      return true;
    } catch (error) {
      console.error("Token refresh failed:", error);
      handleLogout();
      return false;
    }
  };

  const checkAuth = async () => {
    const accessToken = localStorage.getItem("access_token");
    console.log("checkAuth: access_token in localStorage:", accessToken);
    if (!accessToken) {
      setIsAuthenticated(false);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8083/auth/api/validate/token",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        setIsAuthenticated(true);
      } else if (response.status === 401) {
        // Token expired, try to refresh
        const refreshed = await refreshToken();
        if (refreshed) {
          setIsAuthenticated(true);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (location.pathname.startsWith("/video/")) {
      setSidebarOpen(false);
    }
  }, [location]);

  // Unified handler for both modal close and login success
  const handleAuthCloseOrSuccess = () => {
    setAuthOpen(false);
    setIsAuthenticated(!!localStorage.getItem("access_token"));
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setIsAuthenticated(false);
  };

  // Fetch videos from API (with search and filters)
  const fetchVideos = useCallback(
    async (pageToFetch = 0, search = "", cat = [], diff = "", tagsArr = []) => {
      if (loading) return;
      setLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        const payload = {
          page: pageToFetch,
          pageSize: 10,
          searchBox: search,
        };
        if (cat && cat.length > 0) payload.category = cat;
        if (diff) payload.difficulty = diff;
        if (tagsArr && tagsArr.length > 0) payload.tags = tagsArr;
        const response = await axios.post(
          "http://localhost:8083/auth/api/get/video/filter",
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = response.data;
        if (data && data.data) {
          setVideos((prev) =>
            pageToFetch === 0 ? data.data : [...prev, ...data.data]
          );
          setHasMore(
            data.data.length > 0 && (pageToFetch + 1) * 10 < data.totalResults
          );
          setPage(pageToFetch);
        } else {
          setHasMore(false);
        }
      } catch (err) {
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [loading]
  );

  // Initial fetch
  useEffect(() => {
    setVideos([]);
    setPage(0);
    setHasMore(true);
    fetchVideos(0, searchTerm, category, difficulty, tags);
  }, [searchTerm, category, difficulty, tags]);

  // Infinite scroll observer
  useEffect(() => {
    if (!hasMore || loading) return;
    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchVideos(page + 1, searchTerm, category, difficulty, tags);
        }
      },
      { threshold: 1 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [
    hasMore,
    loading,
    fetchVideos,
    page,
    searchTerm,
    category,
    difficulty,
    tags,
  ]);

  useEffect(() => {
    const fetchTags = async () => {
      setTagsLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch("http://localhost:8083/auth/api/tags", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok && data.tags) {
          setTags(["All", ...data.tags.map((t) => t.tag)]);
        } else {
          setTags(["All"]);
        }
      } catch (err) {
        setTags(["All"]);
      } finally {
        setTagsLoading(false);
      }
    };
    fetchTags();
  }, []);

  // Handler for search and filter from Header
  const handleSearch = (term, cat, diff, tagsArr) => {
    setSearchTerm(term);
    setCategory(cat);
    setDifficulty(diff);
    setTags(tagsArr);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onSignInClick={() => setAuthOpen(true)}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        onCreateClick={() => setUploadOpen(true)}
        onSearch={handleSearch}
      />
      <Sidebar isOpen={sidebarOpen} />
      <AuthModal
        isOpen={authOpen}
        onClose={handleAuthCloseOrSuccess}
        onLoginSuccess={handleAuthCloseOrSuccess}
      />
      <VideoUploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
      />
      <main
        className={`pt-14 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Routes>
          <Route
            path="/"
            element={
              <>
                {/* Tag Bar */}
                <div className="w-full overflow-x-auto whitespace-nowrap py-3 px-2 bg-white border-b border-gray-200 flex gap-2 scrollbar-hide">
                  {tagsLoading ? (
                    <span className="text-gray-500 text-sm px-4">
                      Loading tags...
                    </span>
                  ) : (
                    tags.map((tag, idx) => (
                      <button
                        key={tag}
                        className={`inline-block px-4 py-1.5 rounded-lg font-medium text-sm transition-all ${
                          idx === 0
                            ? "bg-gray-900 text-white"
                            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                        }`}
                      >
                        {tag}
                      </button>
                    ))
                  )}
                </div>
                <div className="p-4">
                  <div
                    className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${
                      !sidebarOpen ? "xl:grid-cols-4" : "xl:grid-cols-3"
                    } gap-4`}
                  >
                    {videos.map((video) => (
                      <VideoCard
                        key={video.videoId || video.id}
                        video={{
                          id: video.videoId || video.id,
                          title: video.title,
                          thumbnail: video.thumbnailUrl,
                          duration: video.duration,
                          channelName: video.category || "Education",
                          channelIcon:
                            "https://yt3.ggpht.com/ytc/AKedOLQw8Qw8Qw8Qw8Qw8Qw8Qw8Qw8Qw8Qw=s68-c-k-c0x00ffffff-no-rj",
                          views: video.likes + " likes",
                          uploadTime: video.created
                            ? new Date(video.created).toLocaleDateString()
                            : "",
                        }}
                      />
                    ))}
                  </div>
                  {loading && (
                    <div className="text-center py-4 text-gray-500">
                      Loading...
                    </div>
                  )}
                  <div ref={loaderRef} />
                </div>
              </>
            }
          />
          <Route path="/video/:id" element={<VideoDetail />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
