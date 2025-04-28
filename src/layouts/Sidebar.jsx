import React from "react";
import { Link } from "react-router-dom";
import {
  FiHome,
  FiCompass,
  FiYoutube,
  FiClock,
  FiThumbsUp,
  FiList,
  FiDownload,
  FiSettings,
  FiFlag,
  FiHelpCircle,
  FiBarChart2,
  FiBook,
  FiPlayCircle,
} from "react-icons/fi";

const Sidebar = ({ isOpen }) => {
  const mainItems = [
    { icon: <FiHome className="w-6 h-6" />, label: "Home", to: "/" },
    { icon: <FiCompass className="w-6 h-6" />, label: "Explore" },
    { icon: <FiYoutube className="w-6 h-6" />, label: "Shorts" },
    { icon: <FiList className="w-6 h-6" />, label: "Subscriptions" },
    {
      icon: <FiBarChart2 className="w-6 h-6" />,
      label: "Analytics",
      to: "/analytics",
    },
  ];

  const secondaryItems = [
    { icon: <FiPlayCircle className="w-6 h-6" />, label: "Watch later" },
    { icon: <FiThumbsUp className="w-6 h-6" />, label: "Liked videos" },
    { icon: <FiClock className="w-6 h-6" />, label: "History" },
  ];

  const settingsItems = [
    { icon: <FiSettings className="w-6 h-6" />, label: "Settings" },
    { icon: <FiFlag className="w-6 h-6" />, label: "Report history" },
    { icon: <FiHelpCircle className="w-6 h-6" />, label: "Help" },
  ];

  return (
    <aside
      className={`fixed left-0 top-14 w-64 h-[calc(100vh-56px)] bg-white overflow-y-auto transition-all duration-300 z-20 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto">
          {/* Main navigation */}
          <div className="px-2">
            {mainItems.map((item, index) =>
              item.to ? (
                <Link
                  key={index}
                  to={item.to}
                  className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 rounded-lg"
                >
                  {item.icon}
                  <span className="ml-4">{item.label}</span>
                </Link>
              ) : (
                <button
                  key={index}
                  className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 rounded-lg"
                >
                  {item.icon}
                  <span className="ml-4">{item.label}</span>
                </button>
              )
            )}
          </div>

          <div className="border-t border-gray-200 my-2"></div>

          {/* Secondary navigation */}
          <div className="px-2">
            {secondaryItems.map((item, index) => (
              <button
                key={index}
                className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 rounded-lg"
              >
                {item.icon}
                <span className="ml-4">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="border-t border-gray-200 my-2"></div>

          {/* Settings navigation */}
          <div className="px-2">
            {settingsItems.map((item, index) => (
              <button
                key={index}
                className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 rounded-lg"
              >
                {item.icon}
                <span className="ml-4">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
