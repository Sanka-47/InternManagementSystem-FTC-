import { Link, useLocation } from "react-router-dom";
import logo from "../assets/FCTLogo.png";

export default function WelcomeNavbar() {
  const { pathname } = useLocation();

  const navLinks = [
    { name: "HOME", path: "/" },
    { name: "ABOUT", path: "/about" },
    { name: "SERVICES", path: "/services" },
    { name: "CAREERS", path: "/careers" },
    { name: "CONTACT", path: "/contact" },
  ];

  const linkClass = (path) =>
    `font-bold transition-colors px-2 py-1 rounded ${
      pathname === path
        ? "text-indigo-700"
        : "text-gray-800 hover:text-indigo-700"
    }`;

  return (
    <nav className="sticky top-0 w-full bg-white text-white shadow-md py-3 px-6 flex items-center justify-between z-50">
      {/* Logo and Title */}
      <a href="/">
        <div className="flex items-center gap-3 cursor-pointer">
          <img src={logo} alt="Company Logo" className="h-12 w-12 rounded-full shadow" />
          <div>
            <div className="text-lg text-gray-800 leading-tight font-bold">
              Future Code Technology
            </div>
            <div className="text-sm text-gray-500">
              Welcome to Future Code Technology - FCT
            </div>
          </div>
        </div>
      </a>

      {/* Navigation Links */}
      <div className="flex items-center gap-10 pr-2">
        {navLinks.map(link => (
          <Link
            key={link.name}
            to={link.path}
            className={linkClass(link.path)}
          >
            {link.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}