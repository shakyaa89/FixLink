import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Flag,
  FileCheck2,
  FileText,
  MessageSquare,
  Tags,
} from "lucide-react";

export default function AdminSidebar() {
  return (
    <aside className="group min-h-screen border-r border-(--border) p-4 transition-all duration-300 w-21 hover:w-64 hidden md:block bg-(--primary)">
      <nav className="space-y-2">
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg ${
              isActive
                ? "bg-(--accent) text-(--primary) shadow"
                : "hover:bg-(--secondary) text-(--text)"
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5 shrink-0" />
          <p className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Dashboard
          </p>
        </NavLink>

        <NavLink
          to="/admin/users"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg ${
              isActive
                ? "bg-(--accent) text-(--primary) shadow"
                : "hover:bg-(--secondary) text-(--text)"
            }`
          }
        >
          <Users className="w-5 h-5 shrink-0" />
          <p className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Users
          </p>
        </NavLink>

        <NavLink
          to="/admin/providers"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg ${
              isActive
                ? "bg-(--accent) text-(--primary) shadow"
                : "hover:bg-(--secondary) text-(--text)"
            }`
          }
        >
          <FileCheck2 className="w-5 h-5 shrink-0" />
          <p className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Verification
          </p>
        </NavLink>

        <NavLink
          to="/admin/jobs"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg ${
              isActive
                ? "bg-(--accent) text-(--primary) shadow"
                : "hover:bg-(--secondary) text-(--text)"
            }`
          }
        >
          <Briefcase className="w-5 h-5 shrink-0" />
          <p className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Jobs
          </p>
        </NavLink>

        <NavLink
          to="/admin/disputes"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg ${
              isActive
                ? "bg-(--accent) text-(--primary) shadow"
                : "hover:bg-(--secondary) text-(--text)"
            }`
          }
        >
          <Flag className="w-5 h-5 shrink-0" />
          <p className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Disputes
          </p>
        </NavLink>

        <NavLink
          to="/admin/offers"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg ${
              isActive
                ? "bg-(--accent) text-(--primary) shadow"
                : "hover:bg-(--secondary) text-(--text)"
            }`
          }
        >
          <Tags className="w-5 h-5 shrink-0" />
          <p className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Offers
          </p>
        </NavLink>

        <NavLink
          to="/admin/reviews"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg ${
              isActive
                ? "bg-(--accent) text-(--primary) shadow"
                : "hover:bg-(--secondary) text-(--text)"
            }`
          }
        >
          <FileText className="w-5 h-5 shrink-0" />
          <p className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Reviews
          </p>
        </NavLink>

        <NavLink
          to="/admin/messages"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg ${
              isActive
                ? "bg-(--accent) text-(--primary) shadow"
                : "hover:bg-(--secondary) text-(--text)"
            }`
          }
        >
          <MessageSquare className="w-5 h-5 shrink-0" />
          <p className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Messages
          </p>
        </NavLink>
      </nav>
    </aside>
  );
}
