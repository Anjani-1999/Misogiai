import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import VideoCard from "./VideoCard";

const relatedVideos = [
  {
    id: "2",
    title: "How to Build a Modern Web Application with React",
    channelName: "Web Dev Simplified",
    thumbnail: "https://i.ytimg.com/vi/bMknfKXIFA8/hqdefault.jpg",
    duration: "12:34",
    views: "3.2K views",
    uploadTime: "1 day ago",
    isNew: false,
  },
  {
    id: "3",
    title: "Learn TypeScript in 1 Hour",
    channelName: "Programming with Mosh",
    thumbnail: "https://i.ytimg.com/vi/d56mG7DezGs/hqdefault.jpg",
    duration: "1:02:45",
    views: "3.2K views",
    uploadTime: "1 day ago",
    isNew: false,
  },
  {
    id: "4",
    title: "CSS GRID Crash Course",
    channelName: "Traversy Media",
    thumbnail: "https://i.ytimg.com/vi/jV8B24rSN5o/hqdefault.jpg",
    duration: "28:15",
    views: "3.2K views",
    uploadTime: "1 day ago",
    isNew: false,
  },
];

const hardcodedComments = [
  {
    id: 1,
    pinned: true,
    author: "Shiva Kumar Vakiti",
    avatar:
      "https://yt3.ggpht.com/ytc/AKedOLQw8Qw8Qw8Qw8Qw8Qw8Qw8Qw8Qw8Qw=s68-c-k-c0x00ffffff-no-rj",
    time: "1 day ago",
    content: (
      <>
        <span className="bg-gray-200 text-gray-800 px-2 py-0.5 rounded text-xs font-semibold mr-2">
          @shiva-kumar-vakiti
        </span>
        DevGnan Frontend Internship Program - YouTube Timeline
        <br />
        <br />
        Introduction Section
        <br />
        <span className="text-blue-600">00:00</span> - Introduction…
      </>
    ),
    likes: 5,
    replies: [
      {
        id: 11,
        author: "Shiva Kumar Vakiti",
        avatar:
          "https://yt3.ggpht.com/ytc/AKedOLQw8Qw8Qw8Qw8Qw8Qw8Qw8Qw8Qw8Qw=s68-c-k-c0x00ffffff-no-rj",
        time: "1 day ago",
        content: "Thank you for watching!",
        likes: 2,
      },
    ],
  },
  {
    id: 2,
    author: "wrecker699",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    time: "1 day ago",
    content:
      "nobody cares as shiva does in this yt community, nobody provides their personal no. and listen to your problems and help you according to your situation but shiva does!, vintunadu ani cheppi mi unnecessary pressures shiva meedha ruddhakandi!!!",
    likes: 5,
    replies: [],
  },
];

const VideoDetail = () => {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState(false);
  const [likeError, setLikeError] = useState(null);
  const [likes, setLikes] = useState(0);
  const [commentInput, setCommentInput] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState(null);
  const [comments, setComments] = useState([]);
  const [numberOfComments, setNumberOfComments] = useState(0);

  // Related videos state
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [relatedError, setRelatedError] = useState(null);
  const [relatedPage, setRelatedPage] = useState(0);
  const [hasMoreRelated, setHasMoreRelated] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Fetch related videos
  const fetchRelatedVideos = useCallback(
    async (pageToFetch = 0) => {
      if (relatedLoading) return;
      setRelatedLoading(true);
      setRelatedError(null);

      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch(
          "http://localhost:8083/auth/api/get/video/filter",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              page: pageToFetch,
              pageSize: 5, // Show 5 related videos at a time
            }),
          }
        );

        const data = await response.json();
        if (response.ok && data.data) {
          // Filter out the current video from related videos
          const filteredVideos = data.data.filter(
            (v) => v.videoId !== parseInt(id)
          );
          setRelatedVideos((prev) =>
            pageToFetch === 0 ? filteredVideos : [...prev, ...filteredVideos]
          );
          setHasMoreRelated(
            filteredVideos.length > 0 && pageToFetch < data.totalPages - 1
          );
          setRelatedPage(pageToFetch);
        } else {
          setRelatedError(data.message || "Failed to fetch related videos");
          setHasMoreRelated(false);
        }
      } catch (err) {
        setRelatedError("An error occurred while fetching related videos");
        setHasMoreRelated(false);
      } finally {
        setRelatedLoading(false);
        if (pageToFetch === 0) {
          setInitialLoadDone(true);
        }
      }
    },
    [id]
  ); // Only depend on id

  // Initial fetch of related videos
  useEffect(() => {
    if (!initialLoadDone) {
      fetchRelatedVideos(0);
    }
  }, [fetchRelatedVideos, initialLoadDone]);

  // Helper to check if more related videos should be loaded
  const checkAndFetchMoreRelated = useCallback(() => {
    if (relatedLoading || !hasMoreRelated) return;
    const relatedSection = document.querySelector(".related-videos-container");
    if (!relatedSection) return;
    const rect = relatedSection.getBoundingClientRect();
    if (rect.bottom - window.innerHeight < 200) {
      fetchRelatedVideos(relatedPage + 1);
    }
  }, [relatedLoading, hasMoreRelated, relatedPage, fetchRelatedVideos]);

  // Update scroll logic to use window scroll
  useEffect(() => {
    const handleWindowScroll = () => {
      checkAndFetchMoreRelated();
    };
    window.addEventListener("scroll", handleWindowScroll);
    return () => window.removeEventListener("scroll", handleWindowScroll);
  }, [checkAndFetchMoreRelated]);

  // After loading more related videos, check again if more should be loaded
  useEffect(() => {
    checkAndFetchMoreRelated();
  }, [relatedVideos, hasMoreRelated, checkAndFetchMoreRelated]);

  useEffect(() => {
    const fetchVideo = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch(
          `http://localhost:8083/auth/api/get/video/${id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        if (response.ok && data.data && data.data.data) {
          setVideo(data.data.data);
          setLikes(data.data.data.likes || 0);
          setComments(data.data.data.comments || []);
          setNumberOfComments(
            data.data.data.comments ? data.data.data.comments.length : 0
          );
        } else {
          setVideo(null);
        }
      } catch (e) {
        setVideo(null);
      } finally {
        setLoading(false);
      }
    };
    fetchVideo();
  }, [id]);

  useEffect(() => {
    // Count view when video is opened
    const countView = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const userId = localStorage.getItem("user_id") || 1;
        await fetch("http://localhost:8083/auth/api/view/video", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            videoId: Number(id),
            userId: Number(userId),
          }),
        });
      } catch (e) {
        // Ignore errors for view counting
      }
    };
    countView();
  }, [id]);

  const handleLike = async () => {
    if (!video) return;
    setLikeLoading(true);
    setLikeError(null);
    try {
      const token = localStorage.getItem("access_token");
      // You may want to get userId from auth context or localStorage
      const userId = localStorage.getItem("user_id") || 1;
      const response = await fetch(
        "http://localhost:8083/auth/api/like/video",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            videoId: video.videoId || video.id,
            userId: Number(userId),
          }),
        }
      );
      const data = await response.json();
      if (response.ok && data.data) {
        setLikes(data.data.likes || 0); // Use likes from response
      } else {
        setLikeError(data.message || "Failed to like video");
      }
    } catch (e) {
      setLikeError("Failed to like video");
    } finally {
      setLikeLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setCommentLoading(true);
    setCommentError(null);
    try {
      const token = localStorage.getItem("access_token");
      const userId = localStorage.getItem("user_id") || 1;
      const response = await fetch(
        "http://localhost:8083/auth/api/comment/video",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            videoId: video.videoId || video.id,
            userId: Number(userId),
            comment: commentInput,
            likes: 0,
            dislikes: 0,
          }),
        }
      );
      const data = await response.json();
      if (response.ok && data.data && data.data.comments) {
        setComments(data.data.comments);
        setNumberOfComments(data.data.comments.length);
        setCommentInput("");
      } else {
        setCommentError(data.message || "Failed to add comment");
      }
    } catch (e) {
      setCommentError("Failed to add comment");
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading)
    return <div className="text-center text-white py-10">Loading...</div>;
  if (!video)
    return (
      <div className="text-center text-red-500 py-10">Video not found.</div>
    );
  const v = {
    ...video,
    title: video.title,
    channelName: video.category || "Education",
    channelIcon:
      "https://yt3.ggpht.com/ytc/AKedOLQw8Qw8Qw8Qw8Qw8Qw8Qw8Qw8Qw8Qw=s68-c-k-c0x00ffffff-no-rj",
    subscribers: "Subscribers",
    views: (video.likes || 0) + " likes",
    uploadTime: video.created
      ? new Date(video.created).toLocaleDateString()
      : "",
    hashtags: video.tags ? video.tags.map((t) => `#${t.tagName}`) : [],
    videoUrl: video.url,
    likes: video.likes || 0,
  };
  // Helper to check if YouTube
  const isYouTube =
    v.videoUrl &&
    (v.videoUrl.includes("youtube.com") || v.videoUrl.includes("youtu.be"));
  return (
    <div className="flex flex-col lg:flex-row max-w-7xl w-full mx-auto p-2 sm:p-4 md:p-6 gap-8">
      {/* Video Player */}
      <div className="flex-1">
        <div className="w-full aspect-video bg-black rounded-xl overflow-hidden">
          {isYouTube ? (
            <iframe
              width="100%"
              height="100%"
              src={
                v.videoUrl.includes("embed")
                  ? v.videoUrl +
                    (v.videoUrl.includes("autoplay=1") ? "" : "?autoplay=1")
                  : v.videoUrl.replace("watch?v=", "embed/").split("&")[0] +
                    "?autoplay=1"
              }
              title={v.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          ) : (
            <video
              src={v.videoUrl}
              controls
              autoPlay
              className="w-full h-full object-contain rounded"
            />
          )}
        </div>
        {/* Video Info */}
        <h1 className="text-2xl font-bold mt-4">{v.title}</h1>
        <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
          {/* Channel Info */}
          <div className="flex items-center gap-3">
            <img
              src={v.channelIcon}
              alt={v.channelName}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <div className="font-semibold">{v.channelName}</div>
              <div className="text-xs text-gray-500">{v.subscribers}</div>
            </div>
            <button className="ml-4 px-4 py-1 bg-black text-white rounded-full font-semibold hover:bg-gray-800">
              Subscribe
            </button>
          </div>
          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              className="flex items-center px-3 py-1 bg-gray-200 rounded-full font-semibold hover:bg-gray-300 disabled:opacity-60"
              onClick={handleLike}
              disabled={likeLoading}
            >
              👍 {likes}
            </button>
            <button className="flex items-center px-3 py-1 bg-gray-200 rounded-full font-semibold hover:bg-gray-300">
              👎
            </button>
            <button className="flex items-center px-3 py-1 bg-gray-200 rounded-full font-semibold hover:bg-gray-300">
              Share
            </button>
            <button className="flex items-center px-3 py-1 bg-gray-200 rounded-full font-semibold hover:bg-gray-300">
              Thanks
            </button>
          </div>
        </div>
        {/* Views, date, hashtags */}
        <div className="mt-2 text-gray-600 text-sm flex flex-wrap gap-2 items-center">
          <span>{v.views}</span>
          <span>•</span>
          <span>{v.uploadTime}</span>
          {v.hashtags.map((tag) => (
            <span key={tag} className="text-blue-600 font-semibold">
              {tag}
            </span>
          ))}
        </div>
        {/* Video Description (light theme) */}
        <div className="bg-gray-100 text-gray-800 rounded-lg p-4 mt-4">
          <span className="text-gray-700 font-semibold">
            {v.views} {v.uploadTime} {v.hashtags.join(" ")}
          </span>
          <p className="mt-2">
            As a tech lead with 8 years of industry experience, I've rejected
            hundreds of frontend developer applications for the SAME reason. In
            this video, I reveal why your frontend portfolio projects are
            getting rejected and what to build instead.
            <br />
            <span className="text-red-600 font-bold">STOP</span> building todo
            apps and weather apps! Companies aren't impressed. ...more
          </p>
        </div>
        {/* Comments Section (light theme, reverted) */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">
            {numberOfComments} Comment{numberOfComments !== 1 ? "s" : ""}
          </h2>
          <form
            className="flex items-center gap-3 mb-6"
            onSubmit={handleCommentSubmit}
          >
            <img
              src="https://randomuser.me/api/portraits/men/31.jpg"
              alt="User"
              className="w-10 h-10 rounded-full"
            />
            <input
              className="flex-1 bg-gray-100 text-gray-800 rounded-full px-4 py-2 focus:outline-none border border-gray-300"
              placeholder="Add a comment..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              disabled={commentLoading}
            />
            <button
              type="submit"
              className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700"
              disabled={commentLoading || !commentInput.trim()}
            >
              {commentLoading ? "Posting..." : "Comment"}
            </button>
          </form>
          {commentError && (
            <div className="text-red-500 text-xs mb-2">{commentError}</div>
          )}
          {comments.length === 0 && (
            <div className="text-gray-500">No comments yet.</div>
          )}
          {comments.map((c) => (
            <div key={c.commentId} className="mb-6">
              <div className="flex items-start gap-3">
                <img
                  src="https://randomuser.me/api/portraits/men/31.jpg"
                  alt="User"
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      User {c.userId}
                    </span>
                  </div>
                  <div className="mt-1 text-gray-800 text-sm">{c.comment}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {likeError && (
          <div className="text-red-500 text-xs mt-1">{likeError}</div>
        )}
      </div>
      {/* Related Videos Section */}
      <div className="w-full lg:w-80 space-y-4 related-videos-container">
        <h2 className="text-lg font-semibold text-gray-900">Related Videos</h2>
        {relatedVideos.map((rv) => (
          <VideoCard
            key={rv.videoId}
            video={{
              id: rv.videoId,
              title: rv.title,
              thumbnail: rv.thumbnailUrl,
              duration: rv.duration,
              channelName: rv.category || "Education",
              channelIcon:
                "https://yt3.ggpht.com/ytc/AKedOLQw8Qw8Qw8Qw8Qw8Qw8Qw8Qw8Qw8Qw=s68-c-k-c0x00ffffff-no-rj",
              views: rv.likes + " likes",
              uploadTime: rv.created
                ? new Date(rv.created).toLocaleDateString()
                : "",
            }}
          />
        ))}

        {/* Loading indicator */}
        {relatedLoading && (
          <div className="text-center py-4 text-gray-500">
            Loading more videos...
          </div>
        )}

        {/* Error message */}
        {relatedError && (
          <div className="text-center py-4 text-red-500">{relatedError}</div>
        )}

        {/* No more videos message */}
        {!hasMoreRelated && relatedVideos.length > 0 && (
          <div className="text-center py-4 text-gray-500">
            No more videos to load
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoDetail;
