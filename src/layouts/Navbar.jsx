import { useState } from "react";
import { Link } from "react-router-dom";
import LoginModal from "./LoginModal";
import { logoutUser } from "../api/auth";

const Navbar = ({ isLoggedIn, onLoginSuccess }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleLoginSuccess = (boardData) => {
    setIsLoginModalOpen(false);
    onLoginSuccess(boardData);
  };

  const handleLogout = async () => {
    await logoutUser();
    onLoginSuccess(false);
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-800">
                Kanban Board
              </Link>
            </div>
            {isLoggedIn && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/board"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Board
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center">
            {!isLoggedIn ? (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Login
              </button>
            ) : (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Welcome, User</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </nav>
  );
};

export default Navbar;
