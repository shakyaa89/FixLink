import { NavLink } from "react-router-dom";
import { Home, Briefcase, MessageSquare, Star, Flag, Plus } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

export default function Sidebar() {
  const { user } = useAuthStore();

  return (
    <aside
      className={`group  min-h-screen border-r border-(--border) p-4 transition-all duration-300 w-21 hover:w-64 hidden md:block bg-(--primary)`}
    >
      {/* Navigation */}
      <nav className="space-y-2">
        {user?.role === "user" && (
          <>
            <NavLink
              to="/user/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg ${
                  isActive
                    ? "bg-(--accent) text-white shadow"
                    : "hover:bg-(--secondary)"
                } `
              }
            >
              <Home className="w-5 h-5 shrink-0" />
              <p className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                Dashboard
              </p>
            </NavLink>

            <NavLink
              to="/user/create-job"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg ${
                  isActive
                    ? "bg-(--accent) text-white shadow"
                    : "hover:bg-(--secondary)"
                } `
              }
            >
              <Plus className="w-5 h-5 shrink-0" />
              <p className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                Create Job
              </p>
            </NavLink>

            <NavLink
              to="/user/jobs"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg ${
                  isActive
                    ? "bg-(--accent) text-white shadow"
                    : "hover:bg-(--secondary)"
                } `
              }
            >
              <Briefcase className="w-5 h-5 shrink-0" />
              <p className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                My Jobs
              </p>
            </NavLink>
          </>
        )}

        {user?.role === "serviceProvider" && (
          <>
            <NavLink
              to="/serviceProvider/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg ${
                  isActive
                    ? "bg-(--accent) text-white shadow"
                    : "hover:bg-(--secondary)"
                } `
              }
            >
              <Home className="w-5 h-5 shrink-0" />
              <p className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                Dashboard
              </p>
            </NavLink>

            <NavLink
              to="/serviceprovider/jobs"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg ${
                  isActive
                    ? "bg-(--accent) text-white shadow"
                    : "hover:bg-(--secondary)"
                } `
              }
            >
              <Briefcase className="w-5 h-5 shrink-0" />
              <p className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                View Jobs
              </p>
            </NavLink>
          </>
        )}

        <NavLink
          to="/messages"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg ${
              isActive
                ? "bg-(--accent) text-white shadow"
                : "hover:bg-(--secondary)"
            } `
          }
        >
          <MessageSquare className="w-5 h-5 shrink-0" />
          <p className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Messages
          </p>
        </NavLink>

        <NavLink
          to="/reviews"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg ${
              isActive
                ? "bg-(--accent) text-white shadow"
                : "hover:bg-(--secondary)"
            } `
          }
        >
          <Star className="w-5 h-5 shrink-0" />
          <p className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Reviews
          </p>
        </NavLink>

        <NavLink
          to="/disputes"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg ${
              isActive
                ? "bg-(--accent) text-white shadow"
                : "hover:bg-(--secondary)"
            } `
          }
        >
          <Flag className="w-5 h-5 shrink-0" />
          <p className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Disputes
          </p>
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg ${
              isActive
                ? "bg-(--accent) text-white shadow"
                : "hover:bg-(--secondary) text-(--text)"
            } `
          }
        >
          {/* <User className="w-5 h-5 shrink-0" /> */}
          <img
            src={user?.profilePicture}
            alt="user"
            className="w-5 h-5 group-hover:w-10 group-hover:h-10 shrink-0 rounded-full"
          />
          <p className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Profile
          </p>
        </NavLink>
      </nav>
    </aside>
  );
}
