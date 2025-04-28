import { useState, useEffect, useRef } from "react";
import axios from "axios";

const SearchBox = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef(null);

  const fetchVideos = async (term) => {
    if (!term) {
      setSearchResults([]);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:8083/auth/api/get/video/filter",
        {
          page: 1,
          pageSize: 10,
          searchBox: term,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Bearer eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJBbmphbmkiLCJzdWIiOiJhQGdtYWlsLmNvbSIsImV4cCI6MTc0NTc5ODY1MiwiaWF0IjoxNzQ1Nzk1MDUyLCJzY29wZSI6IlJFQUQifQ.DIsSUQoi5rl_lh_ob4ejbkEoS99j9-zfPjh5BwbrPYa4U5jKJ48pTQHARqzVUHxTt7iMhCREqtDwR64nSI6W7kX5CU7-ZFVknLN7vn1VCDCMGlvPbtbndf6ALo4iaEHtku7KQj_-qm_VpmLQA01Os6TXmiZB2Qouo-8W2jDbL9YANuvzts7ErHiOj0MCUpWYF7WjVQeDCbmJ0SlLMLodNMKHUr_l0cxwPalsuFlA-9O7eRHRwYgBLaLvgtA6r7Y15bqKxHo-yb40_TupGpDESuBVixa6l5sASteJxYVwTY-yPX_TyzqpQwYQuGNVCgcDNk8b0M0ytgZV-bm8JoFwBg",
          },
        }
      );
      setSearchResults(response.data.data);
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    if (!searchTerm) {
      setSearchResults([]);
      return;
    }
    debounceTimer.current = setTimeout(() => {
      fetchVideos(searchTerm);
    }, 500);

    return () => clearTimeout(debounceTimer.current);
  }, [searchTerm]);

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search videos..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {loading && (
          <div className="absolute right-3 top-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {searchResults.length > 0 && (
        <div className="absolute w-full mt-2 bg-white rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {searchResults.map((video) => (
            <div
              key={video.videoId}
              className="p-4 border-b border-gray-200 hover:bg-gray-50"
            >
              <div className="flex items-start">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-24 h-16 object-cover rounded"
                />
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900">
                    {video.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {video.description}
                  </p>
                  <div className="mt-2 flex items-center text-xs text-gray-500">
                    <span>{video.duration}</span>
                    <span className="mx-2">•</span>
                    <span>{video.views} views</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBox;
