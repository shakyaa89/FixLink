// import { useState } from "react";
// import { NavLink } from "react-router-dom";
// import {
//   Home,
//   PlusCircle,
//   Briefcase,
//   MessageSquare,
//   Star,
//   Flag,
//   User,
//   Menu,
// } from "lucide-react";
// import { useAuthStore } from "../../store/authStore";

// export default function Sidebar() {
//   const { user } = useAuthStore();
//   const [collapsed, setCollapsed] = useState(() => {
//     return localStorage.getItem("sidebarCollapsed") === "true";
//   });

//   const toggleSidebar = () => {
//     setCollapsed((prev: boolean) => {
//       localStorage.setItem("sidebarCollapsed", String(!prev));
//       return !prev;
//     });
//   };

//   return (
//     <aside
//       className={`min-h-screen border-r border-(--border) p-4 transition-all duration-300 ${
//         collapsed ? "w-21" : "w-64"
//       } hidden md:block bg-(--primary)`}
//     >
//       {/* Collapse toggle */}
//       <div className="flex justify-end mb-4">
//         <button
//           onClick={toggleSidebar}
//           className="p-1 rounded hover:bg-(--secondary)"
//         >
//           <Menu className="w-5 h-5" />
//         </button>
//       </div>

//       {/* User Info */}
//       (
//         <div className="flex-col justify-center items-center w-full mb-4">
//           <img
//             src={user?.profilePicture}
//             alt=""
//             className="w-30 h-auto aspect-square object-cover rounded-full mx-auto border border-(--border)"
//           />
//           <h1 className="text-3xl font-bold p-4 pb-6 text-center">
//             {user?.fullName}
//           </h1>
//         </div>
//       )}

//       {/* Navigation */}
//       <nav className="space-y-2">
//         {user?.role === "user" && (
//           <>
//             <NavLink
//               to="/user/dashboard"
//               className={({ isActive }) =>
//                 `flex items-center gap-3 px-4 py-3 rounded-lg ${
//                   isActive
//                     ? "bg-(--accent) text-white shadow"
//                     : "hover:bg-(--secondary)"
//                 } `
//               }
//             >
//               <Home className="w-5 h-5" />
//               "Dashboard"}
//             </NavLink>

//             <NavLink
//               to="/user/create-job"
//               className={({ isActive }) =>
//                 `flex items-center gap-3 px-4 py-3 rounded-lg ${
//                   isActive
//                     ? "bg-(--accent) text-white shadow"
//                     : "hover:bg-(--secondary)"
//                 } `
//               }
//             >
//               <PlusCircle className="w-5 h-5" />
//               "Create Job"}
//             </NavLink>

//             <NavLink
//               to="/user/jobs"
//               className={({ isActive }) =>
//                 `flex items-center gap-3 px-4 py-3 rounded-lg ${
//                   isActive
//                     ? "bg-(--accent) text-white shadow"
//                     : "hover:bg-(--secondary)"
//                 } `
//               }
//             >
//               <Briefcase className="w-5 h-5" />
//               "My Jobs"}
//             </NavLink>
//           </>
//         )}

//         {user?.role === "serviceProvider" && (
//           <>
//             <NavLink
//               to="/serviceProvider/dashboard"
//               className={({ isActive }) =>
//                 `flex items-center gap-3 px-4 py-3 rounded-lg ${
//                   isActive
//                     ? "bg-(--accent) text-white shadow"
//                     : "hover:bg-(--secondary)"
//                 } `
//               }
//             >
//               <Home className="w-5 h-5" />
//               "Dashboard"}
//             </NavLink>

//             <NavLink
//               to="/serviceprovider/jobs"
//               className={({ isActive }) =>
//                 `flex items-center gap-3 px-4 py-3 rounded-lg ${
//                   isActive
//                     ? "bg-(--accent) text-white shadow"
//                     : "hover:bg-(--secondary)"
//                 } `
//               }
//             >
//               <Briefcase className="w-5 h-5" />
//               "View Jobs"}
//             </NavLink>
//           </>
//         )}

//         <NavLink
//           to="/messages"
//           className={({ isActive }) =>
//             `flex items-center gap-3 px-4 py-3 rounded-lg ${
//               isActive
//                 ? "bg-(--accent) text-white shadow"
//                 : "hover:bg-(--secondary)"
//             } `
//           }
//         >
//           <MessageSquare className="w-5 h-5" />
//           "Messages"}
//         </NavLink>

//         <NavLink
//           to="/reviews"
//           className={({ isActive }) =>
//             `flex items-center gap-3 px-4 py-3 rounded-lg ${
//               isActive
//                 ? "bg-(--accent) text-white shadow"
//                 : "hover:bg-(--secondary)"
//             } `
//           }
//         >
//           <Star className="w-5 h-5" />
//           "Reviews"}
//         </NavLink>

//         <NavLink
//           to="/disputes"
//           className={({ isActive }) =>
//             `flex items-center gap-3 px-4 py-3 rounded-lg ${
//               isActive
//                 ? "bg-(--accent) text-white shadow"
//                 : "hover:bg-(--secondary)"
//             } `
//           }
//         >
//           <Flag className="w-5 h-5" />
//           "Disputes"}
//         </NavLink>

//         <NavLink
//           to="/profile"
//           className={({ isActive }) =>
//             `flex items-center gap-3 px-4 py-3 rounded-lg ${
//               isActive
//                 ? "bg-(--accent) text-white shadow"
//                 : "hover:bg-(--secondary)"
//             } `
//           }
//         >
//           <User className="w-5 h-5" />
//           "Profile"}
//         </NavLink>
//       </nav>
//     </aside>
//   );
// }

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
