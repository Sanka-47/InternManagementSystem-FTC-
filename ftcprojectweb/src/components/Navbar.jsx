import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/FCTLogo.png";

export default function Navbar() {
  const { user } = useAuth();
  const { pathname } = useLocation();

  // Show only on these login and registration routes, and only when not logged in
  const loginAndRegisterPaths = ["/admin/login", "/mentor/login", "/intern/login", "/admin/register", "/admin/register/otp"];
  const show = loginAndRegisterPaths.includes(pathname) && !user;

  if (!show) return null;

  const linkClass = (path) =>
    `font-medium transition-colors ${
      pathname === path
        ? "text-gray-400"
        : "text-white hover:text-gray-400"
    }`;

  return (
    <nav className="sticky top-0 w-full bg-gray-800 text-white shadow-md py-3 px-6 flex items-center justify-between cursor-pointer z-50">
      {/* Logo and Title */}
      <div className="flex items-center gap-3 cursor-pointer">
        <img src={logo} alt="Company Logo" className="h-12 w-12 rounded-full shadow" />
        <div>
          <div className="font-semibold text-lg text-white">
            Future Code Technology
          </div>
          <div className="text-sm text-gray-400">
            Welcome to Intern Management System - IMS
          </div>
        </div>
      </div>

      <div className="flex items-center gap-10">
        <Link to="/admin/login" className={linkClass("/admin/login")}>
          ADMIN
        </Link>
        <Link to="/mentor/login" className={linkClass("/mentor/login")}>
          MENTOR
        </Link>
        <Link to="/intern/login" className={linkClass("/intern/login")}>
          INTERN
        </Link>
      </div>
    </nav>
  );
}
