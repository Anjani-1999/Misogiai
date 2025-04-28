import React, { useState, useRef, useEffect } from "react";
import {
  FiMenu,
  FiSearch,
  FiMic,
  FiMoreVertical,
  FiUser,
  FiLogOut,
  FiPlus,
  FiFilter,
} from "react-icons/fi";

const categories = [
  "Web Development",
  "Development Tools",
  "Data Science",
  "Programming",
  "Mobile Development",
  "Frontend Development",
  "Database",
  "Machine Learning",
  "Backend Development",
];
const difficulties = ["Easy", "Medium", "Hard"];

const Header = ({
  onMenuClick,
  onSignInClick,
  isAuthenticated,
  onLogout,
  onCreateClick,
  onSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagsList, setTagsList] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(true);
  const debounceTimer = useRef(null);

  // Fetch tags from API on mount
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
          setTagsList(data.tags.map((t) => t.tag).filter(Boolean));
        } else {
          setTagsList([]);
        }
      } catch (err) {
        setTagsList([]);
      } finally {
        setTagsLoading(false);
      }
    };
    fetchTags();
  }, []);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      if (onSearch)
        onSearch(
          searchQuery,
          selectedCategories,
          selectedDifficulty,
          selectedTags
        );
    }, 500);
    return () => clearTimeout(debounceTimer.current);
  }, [
    searchQuery,
    selectedCategories,
    selectedDifficulty,
    selectedTags,
    onSearch,
  ]);

  const handleCategoryChange = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleTagClick = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white flex flex-col z-50 shadow-sm">
      <div className="flex items-center px-4 h-14">
        {/* Left section */}
        <div className="flex items-center min-w-[200px]">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-800"
          >
            <FiMenu className="w-6 h-6" />
          </button>
          <div className="flex items-center ml-2">
            {/* Improved CodeCast Logo: Larger, bolder, and better aligned */}
            <span className="flex items-center justify-center h-10 w-10 mr-2">
              <svg
                width="36"
                height="36"
                viewBox="0 0 36 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g>
                  <text
                    x="2"
                    y="26"
                    fontSize="24"
                    fontFamily="monospace"
                    fill="#2563eb"
                    fontWeight="bold"
                  >
                    {"{"}
                  </text>
                  <polygon
                    points="16,12 28,18 16,24"
                    fill="#2563eb"
                    stroke="#1d4ed8"
                    strokeWidth="2"
                  />
                  <text
                    x="30"
                    y="26"
                    fontSize="24"
                    fontFamily="monospace"
                    fill="#2563eb"
                    fontWeight="bold"
                  >
                    {"}"}
                  </text>
                </g>
              </svg>
            </span>
            <span className="text-gray-900 text-2xl font-extrabold tracking-tight ml-1">
              CodeCast
            </span>
            <span className="text-xs text-gray-500 ml-1 mt-2">IN</span>
          </div>
        </div>

        {/* Center section - Search bar */}
        <div className="flex-1 flex justify-center">
          <div className="flex items-center w-full max-w-2xl relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full h-10 px-4 bg-gray-100 border border-gray-300 text-gray-900 rounded-l-full focus:outline-none placeholder:text-gray-500"
            />
            <button className="h-10 w-16 flex items-center justify-center border border-l-0 border-gray-300 bg-gray-100 rounded-r-full text-gray-700 hover:bg-gray-200">
              <FiSearch className="w-5 h-5" />
            </button>
            <button className="ml-2 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700">
              <FiMic className="w-5 h-5" />
            </button>
            <button
              className="ml-2 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 flex items-center"
              onClick={() => setShowFilter((v) => !v)}
              aria-label="Filter"
            >
              <FiFilter className="w-5 h-5" />
            </button>
            {showFilter && (
              <div className="absolute top-12 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 w-80">
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <label key={cat} className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat)}
                          onChange={() => handleCategoryChange(cat)}
                        />
                        <span>{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-2 py-1"
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                  >
                    <option value="">All</option>
                    {difficulties.map((dif) => (
                      <option key={dif} value={dif}>
                        {dif}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                    onClick={() => {
                      setSelectedCategories([]);
                      setSelectedDifficulty("");
                      setShowFilter(false);
                    }}
                  >
                    Clear
                  </button>
                  <button
                    className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() => setShowFilter(false)}
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-2 min-w-[200px] justify-end relative">
          <button className="p-2 hover:bg-gray-100 rounded-full text-gray-700">
            <FiMoreVertical className="w-6 h-6" />
          </button>
          {isAuthenticated && (
            <button
              className="flex items-center border border-gray-300 rounded-full px-4 py-1 text-gray-800 hover:bg-gray-100 mr-2"
              onClick={onCreateClick}
            >
              <FiPlus className="w-5 h-5 mr-2" />
              <span className="font-medium">Create</span>
            </button>
          )}
          {isAuthenticated ? (
            <div className="relative">
              <button
                className="flex items-center border border-gray-300 rounded-full px-4 py-1 text-gray-800 hover:bg-gray-100"
                onClick={() => setShowDropdown((v) => !v)}
              >
                <FiUser className="w-5 h-5 mr-2" />
                <span className="font-medium">Account</span>
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg z-10">
                  <button
                    className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      setShowDropdown(false);
                      onLogout();
                    }}
                  >
                    <FiLogOut className="mr-2" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              className="flex items-center border border-gray-300 rounded-full px-4 py-1 text-gray-800 hover:bg-gray-100"
              onClick={onSignInClick}
            >
              <FiUser className="w-5 h-5 mr-2" />
              <span className="font-medium">Sign in</span>
            </button>
          )}
        </div>
      </div>
      {/* Tags bar */}
      <div className="w-full overflow-x-auto whitespace-nowrap py-2 px-4 bg-white border-b border-gray-200 flex gap-2 scrollbar-hide">
        {tagsLoading ? (
          <span className="text-gray-500 text-sm px-4">Loading tags...</span>
        ) : tagsList.length === 0 ? (
          <span className="text-gray-500 text-sm px-4">No tags</span>
        ) : (
          tagsList.map((tag) => (
            <button
              key={tag}
              className={`inline-block px-4 py-1.5 rounded-lg font-medium text-sm transition-all border ${
                selectedTags.includes(tag)
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-gray-200 text-gray-800 border-gray-200 hover:bg-gray-300"
              }`}
              onClick={() => handleTagClick(tag)}
            >
              {tag}
            </button>
          ))
        )}
      </div>
    </header>
  );
};

export default Header;
