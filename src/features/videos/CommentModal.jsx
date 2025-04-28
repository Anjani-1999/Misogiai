import React, { useEffect, useState, useRef } from "react";
import { FiTrash2 } from "react-icons/fi";

const CommentModal = ({ isOpen, onClose, videoId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  const dropdownRef = useRef();

  useEffect(() => {
    if (!isOpen || !videoId) return;
    setLoading(true);
    setError(null);
    const fetchComments = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch(
          `https://test-service-dev-1084792667556.us-central1.run.app/auth/api/get/comments/${videoId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        if (
          response.ok &&
          data.data &&
          data.data.comments &&
          Array.isArray(data.data.comments)
        ) {
          setComments(data.data.comments);
        } else {
          setComments([]);
          setError("No comments found.");
        }
      } catch (e) {
        setError("Failed to fetch comments.");
        setComments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [isOpen, videoId]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpenId) return;
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpenId(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpenId]);

  const handleDelete = async (commentId) => {
    if (
      !window.confirm("Are you sure you want to delete this comment forever?")
    )
      return;
    try {
      const token = localStorage.getItem("access_token");
      await fetch(
        `https://test-service-dev-1084792667556.us-central1.run.app/auth/api/delete/comment/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDropdownOpenId(null);
      const fetchComments = async () => {
        try {
          const token = localStorage.getItem("access_token");
          const response = await fetch(
            `https://test-service-dev-1084792667556.us-central1.run.app/auth/api/get/comments/${videoId}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = await response.json();
          if (
            response.ok &&
            data.data &&
            data.data.comments &&
            Array.isArray(data.data.comments)
          ) {
            setComments(data.data.comments);
          } else {
            setComments([]);
            setError("No comments found.");
          }
        } catch (e) {
          setError("Failed to fetch comments.");
          setComments([]);
        }
      };
      fetchComments();
    } catch (e) {
      alert("Failed to delete comment.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative">
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-black"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4">Comments</h2>
        {loading ? (
          <div className="text-gray-500">Loading comments...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : comments.length === 0 ? (
          <div className="text-gray-500">No comments yet.</div>
        ) : (
          <div className="max-h-96 overflow-y-auto space-y-4">
            {comments.map((c, idx) => (
              <div
                key={c.commentId || idx}
                className="border-b pb-2 relative group"
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-gray-800">
                    {c.createdByName || c.userName || `User ${c.userId || ""}`}
                  </div>
                  <button
                    className="p-1 rounded hover:bg-red-100"
                    title="Delete forever"
                    onClick={() => handleDelete(c.commentId)}
                  >
                    <FiTrash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
                <div className="text-gray-700 text-sm">
                  {c.comment || c.text}
                </div>
                {c.created && (
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(c.created).toLocaleString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentModal;
