import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  PlusCircle,
  Briefcase,
  MessageSquare,
  Star,
  Flag,
  User,
  Menu,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";

export default function Sidebar() {
  const { user } = useAuthStore();
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("sidebarCollapsed") === "true";
  });

  const toggleSidebar = () => {
    setCollapsed((prev: boolean) => {
      localStorage.setItem("sidebarCollapsed", String(!prev));
      return !prev;
    });
  };

  return (
    <aside
      className={`min-h-screen border-r border-(--border) p-4 transition-all duration-300 ${
        collapsed ? "w-21" : "w-64"
      } hidden md:block bg-(--primary)`}
    >
      {/* Collapse toggle */}
      <div className="flex justify-end mb-4">
        <button
          onClick={toggleSidebar}
          className="p-1 rounded hover:bg-(--secondary)"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="flex-col justify-center items-center w-full mb-4">
          <img
            src={user?.profilePicture}
            alt=""
            className="w-30 h-auto aspect-square object-cover rounded-full mx-auto border border-(--border)"
          />
          <h1 className="text-3xl font-bold p-4 pb-6 text-center">
            {user?.fullName}
          </h1>
        </div>
      )}

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
                } ${collapsed ? "justify-center" : ""}`
              }
            >
              <Home className="w-5 h-5" />
              {!collapsed && "Dashboard"}
            </NavLink>

            <NavLink
              to="/user/create-job"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg ${
                  isActive
                    ? "bg-(--accent) text-white shadow"
                    : "hover:bg-(--secondary)"
                } ${collapsed ? "justify-center" : ""}`
              }
            >
              <PlusCircle className="w-5 h-5" />
              {!collapsed && "Create Job"}
            </NavLink>

            <NavLink
              to="/user/jobs"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg ${
                  isActive
                    ? "bg-(--accent) text-white shadow"
                    : "hover:bg-(--secondary)"
                } ${collapsed ? "justify-center" : ""}`
              }
            >
              <Briefcase className="w-5 h-5" />
              {!collapsed && "My Jobs"}
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
                } ${collapsed ? "justify-center" : ""}`
              }
            >
              <Home className="w-5 h-5" />
              {!collapsed && "Dashboard"}
            </NavLink>

            <NavLink
              to="/serviceprovider/jobs"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg ${
                  isActive
                    ? "bg-(--accent) text-white shadow"
                    : "hover:bg-(--secondary)"
                } ${collapsed ? "justify-center" : ""}`
              }
            >
              <Briefcase className="w-5 h-5" />
              {!collapsed && "View Jobs"}
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
            } ${collapsed ? "justify-center" : ""}`
          }
        >
          <MessageSquare className="w-5 h-5" />
          {!collapsed && "Messages"}
        </NavLink>

        <NavLink
          to="/reviews"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg ${
              isActive
                ? "bg-(--accent) text-white shadow"
                : "hover:bg-(--secondary)"
            } ${collapsed ? "justify-center" : ""}`
          }
        >
          <Star className="w-5 h-5" />
          {!collapsed && "Reviews"}
        </NavLink>

        <NavLink
          to="/disputes"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg ${
              isActive
                ? "bg-(--accent) text-white shadow"
                : "hover:bg-(--secondary)"
            } ${collapsed ? "justify-center" : ""}`
          }
        >
          <Flag className="w-5 h-5" />
          {!collapsed && "Disputes"}
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg ${
              isActive
                ? "bg-(--accent) text-white shadow"
                : "hover:bg-(--secondary)"
            } ${collapsed ? "justify-center" : ""}`
          }
        >
          <User className="w-5 h-5" />
          {!collapsed && "Profile"}
        </NavLink>
      </nav>
    </aside>
  );
}
