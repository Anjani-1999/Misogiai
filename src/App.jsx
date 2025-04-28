import React, { useState, useEffect, useRef, useCallback } from "react";
import Header from "./layouts/Header";
import Sidebar from "./layouts/Sidebar";
import VideoCard from "./features/videos/VideoCard";
import { videos } from "./mockData";
import AuthModal from "./features/auth/AuthModal";
import VideoUploadModal from "./features/videos/VideoUploadModal";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import VideoDetail from "./features/videos/VideoDetail";
import Analytics from "./features/analytics/Analytics";
import axios from "axios";
import { fetchVideos as apiFetchVideos } from "./api/videos";
import { fetchTags as apiFetchTags } from "./api/tags";

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

  const [allTags, setAllTags] = useState([]); // All available tags
  const [selectedTag, setSelectedTag] = useState("All"); // Currently selected tag
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

      const response = await fetch(
        "https://test-service-dev-1084792667556.us-central1.run.app/auth/refresh-token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        }
      );

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
        "https://test-service-dev-1084792667556.us-central1.run.app/auth/api/validate/token",
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

  const fetchTags = async () => {
    setTagsLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const data = await apiFetchTags(token);
      if (data && data.tags) {
        setAllTags(["All", ...data.tags.map((t) => t.tag)]);
      } else {
        setAllTags(["All"]);
      }
    } catch (err) {
      setAllTags(["All"]);
    } finally {
      setTagsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
    fetchTags();
    // Initial video load without search parameters
    fetchVideos(0, "", [], "", []);
  }, []);

  // Add effect to reload videos when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      setPage(0);
      setVideos([]);
      setHasMore(true);
      fetchVideos(0, "", [], "", []);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (location.pathname.startsWith("/video/")) {
      setSidebarOpen(false);
    }
  }, [location]);

  // Unified handler for both modal close and login success
  const handleAuthCloseOrSuccess = () => {
    setAuthOpen(false);
    setIsAuthenticated(true);
    // Reset and reload videos after successful authentication
    setPage(0);
    setVideos([]);
    setHasMore(true);
    fetchVideos(0, "", [], "", []);
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
        const response = await apiFetchVideos(payload, token);
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

  // Handler for search and filter from Header
  const handleSearch = (term, cat, diff, tagsArr) => {
    setSearchTerm(term);
    setCategory(cat);
    setDifficulty(diff);
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
        {/* Sticky YouTube-like Tags Bar */}
        <div
          className={`sticky top-14 z-10 w-full bg-white border-b border-gray-200 shadow-sm overflow-x-auto whitespace-nowrap flex gap-2 scrollbar-hide transition-all duration-300 ${
            sidebarOpen ? "ml-0" : "ml-0"
          }`}
        >
          {tagsLoading ? (
            <span className="text-gray-500 text-sm px-4">Loading tags...</span>
          ) : (
            allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`inline-block px-4 py-1.5 rounded-full font-medium text-sm transition-all ${
                  selectedTag === tag
                    ? "bg-gray-900 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                {tag}
              </button>
            ))
          )}
        </div>
        <Routes>
          <Route
            path="/"
            element={
              <div className="flex flex-col">
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
              </div>
            }
          />
          <Route path="/video/:id" element={<VideoDetail />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
