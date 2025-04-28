import { useState, useEffect, useRef, useCallback } from "react";
import VideoCard from "./VideoCard";

export default function FilteredList({ filterApiEndpoint, pageSize = 10 }) {
  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const initialLoadDone = useRef(false);

  // Fetch videos from API
  const fetchVideos = useCallback(
    async (pageToFetch = 0) => {
      if (loading) return;
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch(filterApiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            page: pageToFetch,
            pageSize: pageSize,
          }),
        });

        const data = await response.json();

        if (response.ok && data.data) {
          setVideos((prev) =>
            pageToFetch === 0 ? data.data : [...prev, ...data.data]
          );
          setHasMore(data.data.length > 0 && pageToFetch < data.totalPages - 1);
          setPage(pageToFetch);
        } else {
          setError(data.message || "Failed to fetch videos");
          setHasMore(false);
        }
      } catch (err) {
        setError("An error occurred while fetching videos");
        setHasMore(false);
      } finally {
        setLoading(false);
        setIsInitialLoad(false);
      }
    },
    [loading, filterApiEndpoint, pageSize]
  );

  // Helper to check if more videos should be loaded
  const checkAndFetchMore = useCallback(() => {
    if (loading || !hasMore || isInitialLoad) return;
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    if (isNearBottom) {
      fetchVideos(page + 1);
    }
  }, [loading, hasMore, page, fetchVideos, isInitialLoad]);

  // Initial fetch - only once
  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      fetchVideos(0);
    }
  }, [fetchVideos]);

  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      checkAndFetchMore();
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [checkAndFetchMore]);

  // After loading more videos, check again if more should be loaded
  useEffect(() => {
    checkAndFetchMore();
  }, [videos, hasMore, checkAndFetchMore]);

  return (
    <div className="p-4">
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4`}
      >
        {videos.map((video) => (
          <VideoCard
            key={video.videoId}
            video={{
              id: video.videoId,
              title: video.title,
              thumbnail: video.thumbnailUrl,
              duration: video.duration,
              channelName: video.category || "Education",
              channelIcon:
                "https://yt3.ggpht.com/ytc/AKedOLQw8Qw8Qw8Qw8Qw8Qw8Qw8Qw8Qw=s68-c-k-c0x00ffffff-no-rj",
              views: video.likes + " likes",
              uploadTime: video.created
                ? new Date(video.created).toLocaleDateString()
                : "",
            }}
          />
        ))}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="text-center py-4 text-gray-500">
          Loading more videos...
        </div>
      )}

      {/* Error message */}
      {error && <div className="text-center py-4 text-red-500">{error}</div>}

      {/* No more videos message */}
      {!hasMore && !isInitialLoad && videos.length > 0 && (
        <div className="text-center py-4 text-gray-500">
          No more videos to load
        </div>
      )}
    </div>
  );
}
