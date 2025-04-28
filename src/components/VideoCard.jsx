import React from "react";
import { useNavigate } from "react-router-dom";

const VideoCard = ({ video }) => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate(`/video/${video.id}`);
  };
  return (
    <div className="w-full cursor-pointer" onClick={handleClick}>
      <div className="relative pb-[56.25%]">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="absolute top-0 left-0 w-full h-full object-cover rounded-xl"
        />
        <span className="absolute bottom-2 right-2 bg-black text-white text-xs px-1 rounded">
          {video.duration}
        </span>
      </div>
      <div className="mt-2 flex">
        <div className="flex-shrink-0 mr-3">
          <img
            src={video.channelIcon}
            alt={video.channelName}
            className="w-9 h-9 rounded-full"
          />
        </div>
        <div>
          <h3 className="text-sm font-medium line-clamp-2">{video.title}</h3>
          <p className="text-xs text-gray-600 mt-1">{video.channelName}</p>
          <div className="flex items-center text-xs text-gray-600">
            <span>{video.views}</span>
            <span className="mx-1">•</span>
            <span>{video.uploadTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
