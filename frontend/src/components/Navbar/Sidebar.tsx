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
      className={`min-h-screen border-r border-gray-300 p-4 transition-all duration-300 ${
        collapsed ? "w-21" : "w-64"
      } hidden md:block`}
    >
      {/* Collapse toggle */}
      <div className="flex justify-end mb-4">
        <button
          onClick={toggleSidebar}
          className="p-1 rounded hover:bg-gray-100"
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
            className="w-30 h-auto rounded-full mx-auto border border-gray-300"
          />
          <h1 className="text-3xl font-bold p-4 pb-6 text-center">
            {user?.fullName}
          </h1>
        </div>
      )}

      {/* Navigation */}
      <nav className="space-y-2">
        <NavLink
          to="/user/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg ${
              isActive ? "bg-blue-600 text-white shadow" : "hover:bg-gray-100"
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
              isActive ? "bg-blue-600 text-white shadow" : "hover:bg-gray-100"
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
              isActive ? "bg-blue-600 text-white shadow" : "hover:bg-gray-100"
            } ${collapsed ? "justify-center" : ""}`
          }
        >
          <Briefcase className="w-5 h-5" />
          {!collapsed && "My Jobs"}
        </NavLink>

        <NavLink
          to="/user/messages"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg ${
              isActive ? "bg-blue-600 text-white shadow" : "hover:bg-gray-100"
            } ${collapsed ? "justify-center" : ""}`
          }
        >
          <MessageSquare className="w-5 h-5" />
          {!collapsed && "Messages"}
        </NavLink>

        <NavLink
          to="/user/reviews"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg ${
              isActive ? "bg-blue-600 text-white shadow" : "hover:bg-gray-100"
            } ${collapsed ? "justify-center" : ""}`
          }
        >
          <Star className="w-5 h-5" />
          {!collapsed && "Reviews"}
        </NavLink>

        <NavLink
          to="/user/disputes"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg ${
              isActive ? "bg-blue-600 text-white shadow" : "hover:bg-gray-100"
            } ${collapsed ? "justify-center" : ""}`
          }
        >
          <Flag className="w-5 h-5" />
          {!collapsed && "Disputes"}
        </NavLink>

        <NavLink
          to="/user/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg ${
              isActive ? "bg-blue-600 text-white shadow" : "hover:bg-gray-100"
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
