import { useState } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useThemeStore } from "../../store/themeStore";
import { isServiceProviderProfileComplete } from "../../utils/serviceProviderProfile";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const { theme, toggleTheme } = useThemeStore();

  const { user, logout } = useAuthStore();
  const isProviderComplete = isServiceProviderProfileComplete(user);

  const handleLogout = () => {
    logout();
  };

  const handleThemeChange = () => {
    toggleTheme();
  };

  return (
    // asd

    <header className="bg-(--primary) shadow-sm border-b border-(--border)">
      <nav className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-(--text)">
                <a href="/">FixLink</a>
              </span>
            </div>
            <p className="text-(--muted)">|</p>
            {/* Desktop Menu */}
            <div className="hidden gap-8 md:flex">
              <Link
                to={{ pathname: "/", hash: "#home" }}
                className="text-(--muted) transition hover:text-(--accent)"
              >
                Home
              </Link>

              {!user && (
                <Link
                  to={{ pathname: "/", hash: "#services" }}
                  className="text-(--muted) transition hover:text-(--accent)"
                >
                  Services
                </Link>
              )}

              {user?.role === "user" && (
                <Link
                  to={{ pathname: "/user/dashboard" }}
                  className="text-(--muted) transition hover:text-(--accent)"
                >
                  Dashboard
                </Link>
              )}

              {user?.role === "serviceProvider" && (
                <Link
                  to={{
                    pathname: isProviderComplete
                      ? "/serviceprovider/dashboard"
                      : "/serviceprovider/complete-profile",
                  }}
                  className="text-(--muted) transition hover:text-(--accent)"
                >
                  {isProviderComplete ? "Provider" : "Complete Profile"}
                </Link>
              )}

              <Link
                to={{ pathname: "/", hash: "#about" }}
                className="text-(--muted) transition hover:text-(--accent)"
              >
                About
              </Link>
              <Link
                to={{ pathname: "/", hash: "#contact" }}
                className="text-(--muted) transition hover:text-(--accent)"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="hidden gap-4 md:flex">
            {user ? (
              <div className="flex items-center gap-4">
                <p>
                  Hello,{" "}
                  <span className="font-semibold text-(--text)">
                    {" "}
                    {user.fullName}
                  </span>
                </p>
                <img
                  src={user.profilePicture}
                  alt="User Profile Picture"
                  className="w-10 h-10 object-cover border rounded-full"
                />
                <button onClick={() => handleThemeChange()}>
                  {theme === "light" ? (
                    <Moon className="w-6 h-6 text-(--text)" />
                  ) : (
                    <Sun className="w-6 h-6 text-(--text)" />
                  )}
                </button>
                <button
                  onClick={handleLogout}
                  className="px-6 py-2 font-medium text-(--primary) transition bg-(--accent) rounded-lg hover:bg-(--accent-hover)"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <button onClick={() => handleThemeChange()}>
                  {theme === "light" ? (
                    <Moon className="w-6 h-6 text-(--text)" />
                  ) : (
                    <Sun className="w-6 h-6 text-(--text)" />
                  )}
                </button>
                <Link
                  to="/auth"
                  className="px-6 py-2 font-medium text-(--primary) transition bg-(--accent) rounded-lg hover:bg-(--accent-hover)"
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
              <X className="w-6 h-6 text-(--text)" />
            ) : (
              <Menu className="w-6 h-6 text-(--text)" />
            )}
          </button>
        </div>
        {/* Mobile Menu */}
        {isOpen && (
          <div className="pb-4 mt-4 space-y-3 md:hidden">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="block py-2 text-(--muted) transition hover:text-(--accent)"
            >
              Home
            </Link>

            {!user && (
              <>
                <Link
                  to={{ pathname: "/", hash: "#services" }}
                  onClick={() => setIsOpen(false)}
                  className="block py-2 text-(--muted) transition hover:text-(--accent)"
                >
                  Services
                </Link>
                <Link
                  to={{ pathname: "/", hash: "#about" }}
                  onClick={() => setIsOpen(false)}
                  className="block py-2 text-(--muted) transition hover:text-(--accent)"
                >
                  About
                </Link>
                <Link
                  to={{ pathname: "/", hash: "#contact" }}
                  onClick={() => setIsOpen(false)}
                  className="block py-2 text-(--muted) transition hover:text-(--accent)"
                >
                  Contact
                </Link>
              </>
            )}

            {user?.role === "user" && (
              <>
                <Link
                  to="/user/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="block text-(--text) hover:text-(--accent) transition border-b border-(--border) pb-3"
                >
                  Dashboard
                </Link>
                <Link
                  to="/user/create-job"
                  onClick={() => setIsOpen(false)}
                  className="block text-(--text) hover:text-(--accent) transition border-b border-(--border) pb-3"
                >
                  Create Job
                </Link>
                <Link
                  to="/user/jobs"
                  onClick={() => setIsOpen(false)}
                  className="block pb-3 text-(--text) hover:text-(--accent) border-b border-(--border) transition"
                >
                  My Jobs
                </Link>
                <Link
                  to="/messages"
                  onClick={() => setIsOpen(false)}
                  className="block pb-3 text-(--text) hover:text-(--accent) border-b border-(--border) transition"
                >
                  Messages
                </Link>

                <Link
                  to="/reviews"
                  onClick={() => setIsOpen(false)}
                  className="block pb-3 text-(--text) hover:text-(--accent) border-b border-(--border) transition"
                >
                  Reviews
                </Link>
                <Link
                  to="/disputes"
                  onClick={() => setIsOpen(false)}
                  className="block pb-3 text-(--text) hover:text-(--accent) border-b border-(--border) transition"
                >
                  Disputes
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="block pb-3 text-(--text) hover:text-(--accent) border-b border-(--border) transition"
                >
                  Profile
                </Link>
                <button
                  onClick={() => handleThemeChange()}
                  className="block pb-3 text-(--text) hover:text-(--accent) border-b border-(--border) transition w-full"
                >
                  {theme === "light" ? (
                    <span className="flex gap-2 w-full">
                      <Moon className="w-6 h-6 text-(--text)" /> Set to Dark
                      Mode
                    </span>
                  ) : (
                    <span className="flex gap-2 w-full">
                      <Sun className="w-6 h-6 text-(--text)" /> Set to Light
                      Mode
                    </span>
                  )}
                </button>
              </>
            )}

            {user?.role === "serviceProvider" && (
              <>
                <Link
                  to={
                    isProviderComplete
                      ? "/serviceprovider/dashboard"
                      : "/serviceprovider/complete-profile"
                  }
                  onClick={() => setIsOpen(false)}
                  className="block text-(--text) hover:text-(--accent) transition border-b border-(--border) pb-3"
                >
                  {isProviderComplete ? "Dashboard" : "Complete Profile"}
                </Link>
                {isProviderComplete && (
                  <Link
                    to="/serviceprovider/jobs"
                    onClick={() => setIsOpen(false)}
                    className="block text-(--text) hover:text-(--accent) transition border-b border-(--border) pb-3"
                  >
                    View Job
                  </Link>
                )}
              </>
            )}

            <div className="flex flex-col gap-2 pt-2">
              {user ? (
                <>
                  <p className="flex items-center gap-2 mb-2">
                    <img
                      src={user.profilePicture}
                      alt="User Profile Picture"
                      className="w-10 h-10 object-cover border rounded-full"
                    />
                    Hello,{" "}
                    <span className="font-semibold text-(--text)">
                      {" "}
                      {user.fullName}
                    </span>
                  </p>

                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 font-medium text-(--primary) transition bg-(--accent) rounded-lg hover:bg-(--accent-hover)"
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
