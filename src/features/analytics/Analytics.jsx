import React, { useEffect, useState } from "react";
import {
  FiEdit2,
  FiBarChart2,
  FiMessageSquare,
  FiYoutube,
  FiMoreVertical,
  FiTrash2,
} from "react-icons/fi";
import VideoUploadModal from "../videos/VideoUploadModal";
import CommentModal from "../videos/CommentModal";
import { useNavigate } from "react-router-dom";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";

export default function Analytics() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editVideo, setEditVideo] = useState(null);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [commentVideoId, setCommentVideoId] = useState(null);
  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);
  const navigate = useNavigate();

  const fetchVideos = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token");
      const userId = localStorage.getItem("user_id");
      const response = await fetch(
        "http://localhost:8083/auth/api/get/video/filter",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            page: page,
            pageSize: pageSize,
            userId: [Number(userId)],
          }),
        }
      );
      const data = await response.json();
      if (response.ok && data.data) {
        setVideos(data.data);
        setTotalPages(data.totalPages || 1);
        setTotalResults(data.totalResults || 0);
      } else {
        setError(data.message || "Failed to fetch videos");
      }
    } catch (err) {
      setError("An error occurred while fetching videos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [page, pageSize]);

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  // Helper for like percent
  const getLikePercent = (video) => {
    const likes = video.likes || 0;
    // If you have dislikes, use: likes / (likes + dislikes)
    return likes > 0 ? "100.0%" : "0.0%";
  };

  const handleDelete = async () => {
    if (!videoToDelete) return;
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `http://localhost:8083/auth/api/delete/video/${videoToDelete.videoId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        fetchVideos();
      }
    } catch (e) {
      // No alert on error
    }
    setDeleteModalOpen(false);
    setVideoToDelete(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-6">Channel content</h1>
      <VideoUploadModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        editMode={!!editVideo}
        videoData={editVideo}
        onEditSuccess={() => {
          setEditModalOpen(false);
          setEditVideo(null);
          fetchVideos();
        }}
      />
      <CommentModal
        isOpen={commentModalOpen}
        onClose={() => setCommentModalOpen(false)}
        videoId={commentVideoId}
      />
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center border-b pb-2 mb-4">
          <span className="text-lg font-semibold mr-6">Videos</span>
          <span className="text-gray-500 mr-6 cursor-pointer">Shorts</span>
          <span className="text-gray-500 mr-6 cursor-pointer">Live</span>
          <span className="text-gray-500 mr-6 cursor-pointer">Posts</span>
          <span className="text-gray-500 mr-6 cursor-pointer">Playlists</span>
          <span className="text-gray-500 mr-6 cursor-pointer">Podcasts</span>
          <span className="text-gray-500 cursor-pointer">Promotions</span>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : (
            <div style={{ minHeight: `${pageSize * 56}px` }}>
              <table className="min-w-full text-sm text-left">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-4 font-semibold">Video</th>
                    <th className="py-2 px-4 font-semibold">Visibility</th>
                    <th className="py-2 px-4 font-semibold">Restrictions</th>
                    <th className="py-2 px-4 font-semibold">Date</th>
                    <th className="py-2 px-4 font-semibold">Views</th>
                    <th className="py-2 px-4 font-semibold">Comments</th>
                    <th className="py-2 px-4 font-semibold">Likes</th>
                  </tr>
                </thead>
                <tbody>
                  {videos.map((video) => (
                    <tr
                      key={video.videoId}
                      className="border-b group transition min-h-[64px]"
                    >
                      {/* Video/Title/Actions */}
                      <td className="py-4 px-4 flex items-start gap-3 min-w-[320px] relative group">
                        <div className="relative flex items-start gap-3 w-full">
                          <div className="relative w-40 h-24 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                            <img
                              src={video.thumbnailUrl}
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                            {/* Duration badge */}
                            <span className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-[10px] px-1 py-0.5 rounded font-semibold">
                              {video.duration}
                            </span>
                          </div>
                          <div className="flex flex-col justify-center relative w-full">
                            <span className="font-medium line-clamp-2 max-w-xs group-hover:underline">
                              {video.title}
                            </span>
                            {/* Rectangle action box absolutely under the title, only on hover */}
                            <div className="absolute left-0 top-full mt-2 z-20 w-max opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                              <div className="bg-[#232323] rounded-lg shadow-lg flex items-center gap-2 px-2 py-1">
                                <button
                                  className="p-1.5 bg-gray-800/80 rounded-full flex items-center justify-center hover:bg-gray-700"
                                  onClick={() => {
                                    setEditVideo(video);
                                    setEditModalOpen(true);
                                  }}
                                >
                                  <FiEdit2 className="text-white w-4 h-4" />
                                </button>
                                <button className="p-1.5 border border-white bg-transparent rounded flex items-center justify-center hover:bg-gray-700/40">
                                  <FiBarChart2 className="text-white w-4 h-4" />
                                </button>
                                <button
                                  className="p-1.5 border border-white bg-transparent rounded flex items-center justify-center hover:bg-gray-700/40"
                                  onClick={() => {
                                    setCommentVideoId(video.videoId);
                                    setCommentModalOpen(true);
                                  }}
                                >
                                  <FiMessageSquare className="text-white w-4 h-4" />
                                </button>
                                <button
                                  className="p-1.5 border border-white bg-transparent rounded flex items-center justify-center hover:bg-gray-700/40"
                                  onClick={() =>
                                    navigate(`/video/${video.videoId}`)
                                  }
                                >
                                  <FiYoutube className="text-white w-4 h-4" />
                                </button>
                                <button
                                  className="p-1.5 border border-white bg-transparent rounded flex items-center justify-center hover:bg-gray-700/40"
                                  onClick={() => {
                                    setVideoToDelete(video);
                                    setDeleteModalOpen(true);
                                  }}
                                >
                                  <FiTrash2 className="text-white w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      {/* Visibility */}
                      <td className="py-2 px-4">
                        {video.active ? "Public" : "Private"}
                      </td>
                      {/* Restrictions */}
                      <td className="py-2 px-4">
                        {video.restrictions || "None"}
                      </td>
                      {/* Date */}
                      <td className="py-2 px-4">
                        {video.created
                          ? new Date(video.created).toLocaleDateString()
                          : "-"}
                        <div className="text-xs text-gray-400 group-hover:text-gray-300">
                          {video.active ? "Published" : "Draft"}
                        </div>
                      </td>
                      {/* Views */}
                      <td className="py-2 px-4">{video.views ?? 0}</td>
                      {/* Comments */}
                      <td className="py-2 px-4 text-blue-500 underline cursor-pointer">
                        {video.comments ? video.comments.length : 0}
                      </td>
                      {/* Likes (with bar and percent) */}
                      <td className="py-2 px-4 min-w-[120px]">
                        <div className="flex items-center gap-2">
                          <span>{getLikePercent(video)}</span>
                          <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: getLikePercent(video) }}
                            />
                          </div>
                          <span className="text-xs text-gray-400 group-hover:text-gray-200">
                            {video.likes} likes
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Pagination Controls */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-gray-600 text-sm">
                  Showing page {page} of {totalPages} ({totalResults} videos)
                </div>
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                    onClick={handlePrev}
                    disabled={page === 1}
                  >
                    Prev
                  </button>
                  <span className="px-2 font-semibold">{page}</span>
                  <button
                    className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                    onClick={handleNext}
                    disabled={page === totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
