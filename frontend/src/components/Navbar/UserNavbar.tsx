import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function UserNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className=" border-b border-gray-300">
      <nav className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-gray-900">FixLink</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-8">
            <Link
              to="/"
              className="text-gray-600 hover:text-blue-600 transition"
            >
              Home
            </Link>

            <Link
              to="/user/dashboard"
              className="text-gray-600 hover:text-blue-600 transition"
            >
              Dashboard
            </Link>

            <Link
              to={{ pathname: "/", hash: "#about" }}
              className="text-gray-600 transition hover:text-blue-600"
            >
              About
            </Link>
            <Link
              to={{ pathname: "/", hash: "#contact" }}
              className="text-gray-600 transition hover:text-blue-600"
            >
              Contact
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <p>
                  Hello,{" "}
                  <span className="font-semibold text-gray-900">
                    {user.fullName}
                  </span>
                </p>
                <img
                  src={user.profilePicture}
                  alt="User Profile Picture"
                  className="w-10 h-10 rounded-full border"
                />
                <button
                  onClick={handleLogout}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-gray-900" />
            ) : (
              <Menu className="w-6 h-6 text-gray-900" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-3">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="block py-3 text-gray-700 hover:text-blue-600 border-b border-gray-300 transition"
            >
              Home
            </Link>

            {/* Dashboard section */}
            <Link
              to="/user/dashboard"
              onClick={() => setIsOpen(false)}
              className="block text-gray-700 hover:text-blue-600 transition border-b border-gray-300 pb-3"
            >
              Dashboard
            </Link>
            <Link
              to="/user/create-job"
              onClick={() => setIsOpen(false)}
              className="block text-gray-700 hover:text-blue-600 transition border-b border-gray-300 pb-3"
            >
              Create Job
            </Link>
            <Link
              to="/user/jobs"
              onClick={() => setIsOpen(false)}
              className="block pb-3 text-gray-700 hover:text-blue-600 border-b border-gray-300 transition"
            >
              My Jobs
            </Link>
            <Link
              to="/user/messages"
              onClick={() => setIsOpen(false)}
              className="block pb-3 text-gray-700 hover:text-blue-600 border-b border-gray-300 transition"
            >
              Messages
            </Link>

            <Link
              to="#"
              onClick={() => setIsOpen(false)}
              className="block pb-3 text-gray-700 hover:text-blue-600 border-b border-gray-300 transition"
            >
              Reviews
            </Link>
            <Link
              to="#"
              onClick={() => setIsOpen(false)}
              className="block pb-3 text-gray-700 hover:text-blue-600 border-b border-gray-300 transition"
            >
              Disputes
            </Link>
            <Link
              to="#"
              onClick={() => setIsOpen(false)}
              className="block pb-3 text-gray-700 hover:text-blue-600 border-b border-gray-300 transition"
            >
              Profile
            </Link>

            <div className="pt-3 flex flex-col gap-2">
              {user ? (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={user.profilePicture}
                      alt="User Profile Picture"
                      className="w-10 h-10 rounded-full border"
                    />
                    <span className=" text-gray-900">
                      Hello,{" "}
                      <span className="font-semibold">{user.fullName}</span>
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setIsOpen(false)}
                  className="w-full px-4 py-2 text-blue-600 border border-blue-600 rounded-lg text-center font-medium"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
