import { NavLink } from "react-router-dom";
import {
  Home,
  PlusCircle,
  Briefcase,
  MessageSquare,
  Star,
  Flag,
  User,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";

export default function Sidebar() {
  const { user } = useAuthStore();

  return (
    <aside
      className={`w-64 min-h-screen border-r border-gray-300 p-4 hidden md:block`}
    >
      <div className="flex-col justify-center items-center w-full">
        <img
          src={user?.profilePicture}
          alt=""
          className="w-30 h-auto rounded-full mx-auto border border-gray-300"
        />
        <h1 className="text-3xl font-bold p-4 pb-6 text-center">
          {user?.fullName}
        </h1>
      </div>

      <nav className="space-y-2">
        <NavLink
          to="/user/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg 
             ${
               isActive ? "bg-blue-600 text-white shadow" : "hover:bg-gray-100"
             }`
          }
        >
          <Home className="w-5 h-5" /> Dashboard
        </NavLink>

        <NavLink
          to="/user/create-job"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg 
             ${
               isActive ? "bg-blue-600 text-white shadow" : "hover:bg-gray-100"
             }`
          }
        >
          <PlusCircle className="w-5 h-5" /> Create Job
        </NavLink>

        <NavLink
          to="/user/jobs"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg 
             ${
               isActive ? "bg-blue-600 text-white shadow" : "hover:bg-gray-100"
             }`
          }
        >
          <Briefcase className="w-5 h-5" /> My Jobs
        </NavLink>

        <NavLink
          to="/user/messages"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg 
             ${
               isActive ? "bg-blue-600 text-white shadow" : "hover:bg-gray-100"
             }`
          }
        >
          <MessageSquare className="w-5 h-5" /> Messages
        </NavLink>

        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg 
             ${
               isActive ? "bg-blue-600 text-white shadow" : "hover:bg-gray-100"
             }`
          }
        >
          <Star className="w-5 h-5" /> Reviews
        </NavLink>

        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg 
             ${
               isActive ? "bg-blue-600 text-white shadow" : "hover:bg-gray-100"
             }`
          }
        >
          <Flag className="w-5 h-5" /> Disputes
        </NavLink>

        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg 
             ${
               isActive ? "bg-blue-600 text-white shadow" : "hover:bg-gray-100"
             }`
          }
        >
          <User className="w-5 h-5" /> Profile
        </NavLink>
      </nav>
    </aside>
  );
}
