import { NavLink, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext";
import Button from "./Button";
import {
  MdDashboard,
  MdWork,
  MdPlaylistAdd,
  MdComment,
  MdCalendarToday,
  MdAccountCircle
} from "react-icons/md";

const linkBase =
  "flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors";
const linkActive =
  "bg-indigo-100 text-indigo-700 font-semibold";
const linkIdle =
  "text-gray-700 hover:bg-gray-100";

export default function MentorSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you need to logout from mentor panel?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, logout",
      cancelButtonText: "Cancel",
      customClass: {
        confirmButton: 'w-[200px] sm:w-[400px] bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 mb-2',
        cancelButton: 'w-[200px] sm:w-[400px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300'
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate("/mentor/login");
      }
    });
  };

  const navItem = (to, label, icon) => (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `${linkBase} ${isActive ? linkActive : linkIdle}`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );

  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-gray-200 p-4 gap-2 sticky top-0 h-screen">
      {/* Brand / User */}
      <div className="mb-2">
        <div className="text-lg font-bold text-gray-900">
          Hello, {user?.username}👋 
        </div>
        <div className="text-sm text-gray-500">
          {user?.email}
        </div>
      </div>

      <div className="h-px bg-gray-200 my-2" />

      {/* Primary */}
      <div className="flex-1 overflow-y-auto pr-1">
        <div className="text-[11px] uppercase tracking-wide text-gray-400 px-1 mb-1">Overview</div>
        {navItem("/mentor", "Dashboard", <MdDashboard className="text-xl" />)}

        <div className="text-[11px] uppercase tracking-wide text-gray-400 px-1 mt-4 mb-1">Projects</div>
        {navItem("/mentor/projects", "Projects", <MdWork className="text-xl" />)}
        {navItem("/mentor/projects/new", "New Project", <MdPlaylistAdd className="text-xl" />)}

        <div className="text-[11px] uppercase tracking-wide text-gray-400 px-1 mt-4 mb-1">Interns</div>
        {navItem("/mentor/attendance", "Attendance", <MdCalendarToday className="text-xl" />)}
        {navItem("/mentor/leaves", "Leave Request", <MdPlaylistAdd className="text-xl" />)}

        <div className="text-[11px] uppercase tracking-wide text-gray-400 px-1 mt-4 mb-1">Feedback</div>
        {navItem("/mentor/comments", "Task Comments", <MdComment className="text-xl" />)}

        <div className="text-[11px] uppercase tracking-wide text-gray-400 px-1 mt-4 mb-1">Chat</div>
        {navItem("/mentor/chat", "Mentor Chat", <MdComment className="text-xl" />)}

        <div className="text-[11px] uppercase tracking-wide text-gray-400 px-1 mt-4 mb-1">Profile</div>
        {navItem("/mentor/details", "Mentor Profile", <MdAccountCircle className="text-xl" />)}
      </div>

      {/* Logout */}
      <div className="pt-5 border-t border-gray-200">
        <Button
          className="w-full bg-red-600 hover:bg-red-700"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>
    </aside>
  );
}