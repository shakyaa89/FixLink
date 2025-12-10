import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <nav className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-gray-900">FixLink</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden gap-8 md:flex">
            <Link
              to={{ pathname: "/", hash: "#home" }}
              className="text-gray-600 transition hover:text-blue-600"
            >
              Home
            </Link>

            <Link
              to={{ pathname: "/", hash: "#services" }}
              className="text-gray-600 transition hover:text-blue-600"
            >
              Services
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
          <div className="hidden gap-4 md:flex">
            {user ? (
              <div className="flex items-center gap-4">
                <p>
                  Hello,{" "}
                  <span className="font-semibold text-gray-900">
                    {" "}
                    {user.fullName}
                  </span>
                </p>
                <img
                  src={user.profilePicture}
                  alt="User Profile Picture"
                  className="w-10 h-10 border rounded-full"
                />
                <button
                  onClick={handleLogout}
                  className="px-6 py-2 font-medium text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="px-6 py-2 font-medium text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Sign In
                </Link>
              </>
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
          <div className="pb-4 mt-4 space-y-3 md:hidden">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="block py-2 text-gray-600 transition hover:text-blue-600"
            >
              Home
            </Link>

            <Link
              to={{ pathname: "/", hash: "#services" }}
              onClick={() => setIsOpen(false)}
              className="block py-2 text-gray-600 transition hover:text-blue-600"
            >
              Services
            </Link>
            <Link
              to={{ pathname: "/", hash: "#about" }}
              onClick={() => setIsOpen(false)}
              className="block py-2 text-gray-600 transition hover:text-blue-600"
            >
              About
            </Link>
            <Link
              to={{ pathname: "/", hash: "#contact" }}
              onClick={() => setIsOpen(false)}
              className="block py-2 text-gray-600 transition hover:text-blue-600"
            >
              Contact
            </Link>
            <div className="flex flex-col gap-2 pt-2">
              {user ? (
                <>
                  <p className="flex items-center gap-2 mb-2">
                    <img
                      src={user.profilePicture}
                      alt="User Profile Picture"
                      className="w-10 h-10 border rounded-full"
                    />
                    Hello,{" "}
                    <span className="font-semibold text-gray-900">
                      {" "}
                      {user.fullName}
                    </span>
                  </p>

                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 font-medium text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth"
                    onClick={() => setIsOpen(false)}
                    className="w-full px-4 py-2 font-medium transition text-center text-blue-500 rounded-lg border border-blue-500"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
