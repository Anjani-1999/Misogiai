import React, { useRef, useState, useEffect } from "react";
import { FiX, FiUpload, FiImage, FiCheckCircle, FiLink } from "react-icons/fi";

const steps = ["Details", "Video elements", "Checks"];
const difficulties = ["Easy", "Medium", "Hard"];
const categories = ["Frontend", "Backend", "DevOps", "System Design", "Other"];

const VideoUploadModal = ({
  isOpen,
  onClose,
  editMode = false,
  videoData = null,
  onEditSuccess,
}) => {
  const [step, setStep] = useState(0);
  const [uploadType, setUploadType] = useState("file"); // 'file' or 'link'
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailMethod, setThumbnailMethod] = useState("file"); // 'file' or 'url'
  const [thumbnailUrlInput, setThumbnailUrlInput] = useState("");
  const [video, setVideo] = useState(null);
  const [videoLink, setVideoLink] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [tags, setTags] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [category, setCategory] = useState("");
  const videoInputRef = useRef();
  const thumbnailInputRef = useRef();
  const [dragActive, setDragActive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Reset all state
  const resetState = () => {
    setStep(0);
    setUploadType("file");
    setTitle("");
    setDescription("");
    setThumbnail(null);
    setThumbnailMethod("file");
    setThumbnailUrlInput("");
    setVideo(null);
    setVideoLink("");
    setUploadProgress(0);
    setUploading(false);
    setTags("");
    setDifficulty("");
    setCategory("");
    setDragActive(false);
    setSaving(false);
    setError(null);
    setSuccess(false);
  };

  // Prefill for edit mode
  useEffect(() => {
    if (editMode && videoData) {
      setTitle(videoData.title || "");
      setDescription(videoData.description || "");
      setThumbnailMethod("url");
      setThumbnailUrlInput(videoData.thumbnailUrl || "");
      setVideoLink(videoData.url || "");
      setDifficulty(videoData.difficulty || "");
      setCategory(videoData.category || "");
      setTags(
        videoData.tags
          ? videoData.tags.map((t) => t.tag || t.tagName).join(", ")
          : ""
      );
      setStep(1); // Jump to details step
    } else if (!isOpen) {
      resetState();
    }
  }, [editMode, videoData, isOpen]);

  if (!isOpen) return null;

  // Simulate upload progress
  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideo(file);
      setUploading(true);
      setUploadProgress(0);
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setUploading(false);
        }
      }, 200);
      setStep(1); // Move to details step after file is selected
    }
  };

  const handleLinkNext = () => {
    if (videoLink.trim()) {
      setStep(1);
    }
  };

  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (file) setThumbnail(file);
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleVideoUpload({ target: { files: e.dataTransfer.files } });
    }
  };

  // Step validation
  const canGoNext = () => {
    if (editMode) return true;
    if (step === 1) {
      return (
        (uploadType === "file" ? video : videoLink.trim()) &&
        title.trim() &&
        !uploading
      );
    }
    if (step === 2) {
      return tags.trim() && difficulty && category;
    }
    return true;
  };

  // Save handler with API integration
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const userId = localStorage.getItem("user_id");
      let videoDataToSend;
      if (editMode && videoData) {
        // Send all fields for edit
        videoDataToSend = {
          videoId: videoData.videoId || videoData.id,
          userId: videoData.userId || (userId ? Number(userId) : undefined),
          title,
          description,
          url: videoData.url,
          thumbnailUrl: videoData.thumbnailUrl,
          duration: videoData.duration,
          category: videoData.category,
          tags: (videoData.tags || []).map((tag) =>
            tag.tagId
              ? { tagId: tag.tagId, tagName: tag.tag || tag.tagName }
              : { tagName: tag.tag || tag.tagName }
          ),
          likes: videoData.likes,
          comments: videoData.comments,
          numberOfComments: videoData.numberOfComments,
        };
      } else {
        videoDataToSend = {
          title,
          description,
          url: uploadType === "file" ? URL.createObjectURL(video) : videoLink,
          thumbnailUrl:
            thumbnailMethod === "file"
              ? thumbnail
                ? URL.createObjectURL(thumbnail)
                : ""
              : thumbnailUrlInput,
          duration: "00:00",
          category,
          tags: tags.split(",").map((tag) => ({ tagName: tag.trim() })),
          likes: 0,
          comments: [],
          numberOfComments: 0,
          userId: userId ? Number(userId) : undefined,
        };
      }
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No access token found. Please login again.");
      }
      const response = await fetch(
        editMode && videoData
          ? `http://localhost:8083/auth/api/edit/video`
          : "http://localhost:8083/auth/api/upload/video",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(videoDataToSend),
        }
      );
      const result = await response.json();
      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          setSaving(false);
          resetState();
          if (editMode && typeof onEditSuccess === "function") {
            onEditSuccess();
          } else {
            onClose();
          }
        }, 1200);
      } else {
        throw new Error(result.message || "Failed to upload video");
      }
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  // Close handler
  const handleClose = () => {
    resetState();
    onClose();
  };

  // Footer status (simulate processing)
  const renderFooterStatus = () => (
    <div className="flex items-center space-x-2 text-gray-300 text-sm">
      <FiUpload className="w-5 h-5" />
      <span className="bg-gray-700 text-xs px-2 py-0.5 rounded font-bold">
        HD
      </span>
      <FiCheckCircle className="w-5 h-5 text-green-400" />
      <span>Processing up to HD ... 3 minutes left</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-[#181818] rounded-xl shadow-lg w-full max-w-2xl p-0 relative overflow-hidden flex flex-col min-h-[600px]">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
          onClick={handleClose}
        >
          <FiX size={24} />
        </button>
        {/* Step 0: Choose upload type */}
        {step === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center px-4 pt-8 pb-4 relative">
            <h2 className="text-white text-2xl font-bold mb-8 w-full text-left">
              Upload videos
            </h2>
            <div className="flex justify-center mb-8 w-full">
              <button
                className={`flex items-center px-6 py-2 rounded-l-full font-semibold text-base border border-r-0 border-gray-700 focus:outline-none transition ${
                  uploadType === "file"
                    ? "bg-[#232323] text-white"
                    : "bg-[#232323]/60 text-gray-400"
                }`}
                onClick={() => setUploadType("file")}
              >
                <FiUpload className="mr-2" /> Upload file
              </button>
              <button
                className={`flex items-center px-6 py-2 rounded-r-full font-semibold text-base border border-gray-700 focus:outline-none transition ${
                  uploadType === "link"
                    ? "bg-[#232323] text-white"
                    : "bg-[#232323]/60 text-gray-400"
                }`}
                onClick={() => setUploadType("link")}
              >
                <FiLink className="mr-2" /> Post link
              </button>
            </div>
            {uploadType === "file" ? (
              <div
                className="flex-1 flex flex-col items-center justify-center w-full"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div
                  className={`rounded-full bg-[#232323] flex items-center justify-center mb-8" style={{ width: 120, height: 120 }}`}
                >
                  <FiUpload className="text-gray-400" size={64} />
                </div>
                <div className="text-center">
                  <div className="text-white text-lg font-semibold mb-1">
                    Drag and drop video files to upload
                  </div>
                  <div className="text-gray-400 mb-6">
                    Your videos will be private until you publish them.
                  </div>
                  <button
                    className="bg-white text-gray-900 font-semibold px-8 py-2 rounded-full shadow hover:bg-gray-100 mb-8 disabled:opacity-60"
                    onClick={
                      editMode
                        ? () =>
                            setError(
                              "Editing video file is not allowed in edit mode."
                            )
                        : () => videoInputRef.current.click()
                    }
                    disabled={editMode}
                  >
                    Select files
                  </button>
                  <input
                    type="file"
                    accept="video/*"
                    ref={videoInputRef}
                    className="hidden"
                    onChange={handleVideoUpload}
                  />
                </div>
                {dragActive && (
                  <div className="absolute inset-0 bg-blue-900 bg-opacity-20 border-4 border-blue-500 rounded-xl pointer-events-none" />
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center w-full mt-8">
                <div className="flex flex-col items-center w-full max-w-md">
                  <label className="text-white text-lg font-semibold mb-2 w-full text-left">
                    Paste video link
                  </label>
                  <input
                    className="w-full bg-[#232323] text-white px-4 py-2 rounded-md border border-gray-700 focus:outline-none focus:border-blue-500 mb-4"
                    placeholder="e.g. https://youtube.com/watch?v=..."
                    value={videoLink}
                    onChange={(e) => setVideoLink(e.target.value)}
                  />
                  <button
                    className="bg-white text-gray-900 font-semibold px-8 py-2 rounded-full shadow hover:bg-gray-100 transition disabled:opacity-60"
                    onClick={handleLinkNext}
                    disabled={!videoLink.trim()}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
            <div className="absolute bottom-4 left-0 w-full text-center text-xs text-gray-400 px-4">
              By submitting your videos to CodeCast, you acknowledge that you
              agree to our Terms of Service and Community Guidelines.
              <br />
              Please make sure that you do not violate others' copyright or
              privacy rights.
            </div>
          </div>
        )}
        {/* Stepper and Details Step (after file or link is selected) */}
        {step > 0 && (
          <>
            <div className="flex flex-col w-full flex-1 overflow-y-auto pb-28">
              <div className="flex items-center justify-between px-8 pt-8 pb-4">
                {steps.map((s, idx) => (
                  <div key={s} className="flex-1 flex flex-col items-center">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mb-1 ${
                        idx === step - 1
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 text-gray-300"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        idx === step - 1 ? "text-white" : "text-gray-400"
                      }`}
                    >
                      {s}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-b border-gray-700 mx-8" />
              {/* Details Step */}
              {step === 1 && (
                <div className="flex flex-col md:flex-row gap-6 px-8 py-8">
                  <div className="flex-1">
                    <label className="block text-white text-lg font-semibold mb-2">
                      Title <span className="text-red-500">(required)</span>
                    </label>
                    <input
                      className="w-full bg-[#232323] text-white px-4 py-2 rounded-md border border-gray-700 focus:outline-none focus:border-blue-500 mb-4"
                      placeholder="Title of your video"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      disabled={editMode ? false : undefined}
                    />
                    <label className="block text-white text-base font-medium mb-2">
                      Description
                    </label>
                    <textarea
                      className="w-full bg-[#232323] text-white px-4 py-2 rounded-md border border-gray-700 focus:outline-none focus:border-blue-500 mb-4"
                      placeholder="Tell viewers about your video (type @ to mention a channel)"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      disabled={editMode ? true : undefined}
                    />
                    <label className="block text-white text-base font-medium mb-2">
                      Thumbnail
                    </label>
                    <div className="flex gap-4 mb-2">
                      <button
                        type="button"
                        className={`px-4 py-2 rounded-md font-medium border border-gray-700 transition ${
                          thumbnailMethod === "file"
                            ? "bg-blue-600 text-white"
                            : "bg-[#232323] text-gray-300"
                        }`}
                        onClick={() => setThumbnailMethod("file")}
                      >
                        Upload File
                      </button>
                      <button
                        type="button"
                        className={`px-4 py-2 rounded-md font-medium border border-gray-700 transition ${
                          thumbnailMethod === "url"
                            ? "bg-blue-600 text-white"
                            : "bg-[#232323] text-gray-300"
                        }`}
                        onClick={() => setThumbnailMethod("url")}
                      >
                        Use URL
                      </button>
                    </div>
                    {thumbnailMethod === "file" ? (
                      <div className="flex gap-2 mb-4">
                        <button
                          type="button"
                          className="flex items-center px-4 py-2 bg-[#232323] text-white rounded-md border border-gray-700 hover:bg-[#222] disabled:opacity-60"
                          onClick={
                            editMode
                              ? () =>
                                  setError(
                                    "Editing thumbnail is not allowed in edit mode."
                                  )
                              : () => thumbnailInputRef.current.click()
                          }
                          disabled={editMode}
                        >
                          <FiImage className="mr-2" />
                          {thumbnail ? thumbnail.name : "Upload Thumbnail"}
                        </button>
                        <input
                          type="file"
                          accept="image/*"
                          ref={thumbnailInputRef}
                          className="hidden"
                          onChange={handleThumbnailUpload}
                        />
                      </div>
                    ) : (
                      <input
                        type="text"
                        className="w-full bg-[#232323] text-white px-4 py-2 rounded-md border border-gray-700 focus:outline-none focus:border-blue-500 mb-4"
                        placeholder="Paste thumbnail image URL"
                        value={thumbnailUrlInput}
                        onChange={(e) => setThumbnailUrlInput(e.target.value)}
                        disabled={editMode ? true : undefined}
                      />
                    )}
                  </div>
                  {/* Video upload and preview (only for file upload) */}
                  {uploadType === "file" && (
                    <div className="w-full md:w-80 flex flex-col items-center bg-[#232323] rounded-lg p-4">
                      <div className="w-full h-44 flex items-center justify-center bg-black rounded mb-2">
                        {video ? (
                          <video
                            src={URL.createObjectURL(video)}
                            controls
                            className="w-full h-full object-contain rounded"
                          />
                        ) : (
                          <span className="text-gray-400">
                            Uploading video...
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        className="flex items-center justify-center w-full bg-blue-600 text-white font-medium py-2 rounded mb-2 hover:bg-blue-700"
                        onClick={() => videoInputRef.current.click()}
                        disabled={uploading}
                      >
                        <FiUpload className="mr-2" />
                        {video ? "Change Video" : "Upload Video"}
                      </button>
                      <input
                        type="file"
                        accept="video/*"
                        ref={videoInputRef}
                        className="hidden"
                        onChange={handleVideoUpload}
                      />
                      {video && (
                        <>
                          <div className="text-xs text-gray-400 truncate w-full mb-1">
                            Filename: {video.name}
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-400 mb-1">
                            Uploading {uploadProgress}% ...
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  {/* For link, show preview or info if needed */}
                  {uploadType === "link" && (
                    <div className="w-full md:w-80 flex flex-col items-center justify-center bg-[#232323] rounded-lg p-4">
                      <div className="w-full h-44 flex items-center justify-center bg-black rounded mb-2">
                        <FiLink className="text-gray-400" size={48} />
                      </div>
                      <div className="text-gray-400 text-center">
                        Video link:{" "}
                        <span className="break-all">{videoLink}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {/* Video Elements Step */}
              {step === 2 && (
                <div className="flex flex-col gap-6 px-8 py-8">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <label className="block text-white text-base font-medium mb-2">
                        Tags{" "}
                        <span className="text-gray-400 text-xs">
                          (comma separated)
                        </span>
                      </label>
                      <input
                        className="w-full bg-[#232323] text-white px-4 py-2 rounded-md border border-gray-700 focus:outline-none focus:border-blue-500 mb-4"
                        placeholder="e.g. Next.js, React, System Design"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        disabled={editMode ? true : undefined}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-white text-base font-medium mb-2">
                        Difficulty level
                      </label>
                      <select
                        className="w-full bg-[#232323] text-white px-4 py-2 rounded-md border border-gray-700 focus:outline-none focus:border-blue-500 mb-4"
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        disabled={editMode ? true : undefined}
                      >
                        <option value="">Select difficulty</option>
                        {difficulties.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-white text-base font-medium mb-2">
                        Topic category
                      </label>
                      <select
                        className="w-full bg-[#232323] text-white px-4 py-2 rounded-md border border-gray-700 focus:outline-none focus:border-blue-500 mb-4"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        disabled={editMode ? true : undefined}
                      >
                        <option value="">Select category</option>
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
              {/* Checks Step (Step 3) */}
              {step === 3 && (
                <div className="flex flex-col gap-6 px-8 py-8">
                  <div className="text-white text-lg font-semibold mb-2">
                    Checks
                  </div>
                  <div className="text-gray-400">
                    This is a placeholder for checks or review before saving
                    your video. You can add more content here as needed.
                  </div>
                </div>
              )}
            </div>
            {/* Footer pinned to bottom - always show for steps 1, 2, 3 */}
            <div className="absolute left-0 right-0 bottom-0 bg-[#181818] border-t border-gray-800 flex items-center justify-between px-8 pb-6 pt-2 z-20">
              {step === 2 || step === 3 ? renderFooterStatus() : <div />}
              <div className="flex space-x-3">
                {step > 1 && (
                  <button
                    className="bg-[#232323] text-white font-semibold px-8 py-2 rounded-full border border-gray-700 hover:bg-[#222] transition"
                    onClick={() => setStep((s) => Math.max(s - 1, 1))}
                  >
                    Back
                  </button>
                )}
                {step === 3 ? (
                  <button
                    className="bg-blue-600 text-white font-semibold px-8 py-2 rounded-full shadow hover:bg-blue-700 transition disabled:opacity-60"
                    onClick={handleSave}
                    disabled={!canGoNext() || saving}
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                ) : (
                  <button
                    className="bg-white text-gray-900 font-semibold px-8 py-2 rounded-full shadow hover:bg-gray-100 transition disabled:opacity-60"
                    onClick={() => setStep((s) => Math.min(s + 1, 3))}
                    disabled={!canGoNext()}
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
            {/* Add error and success messages in the UI */}
            {error && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded">
                {error}
              </div>
            )}
            {success && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded">
                Video uploaded successfully!
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VideoUploadModal;
