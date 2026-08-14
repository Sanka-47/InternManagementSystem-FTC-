import { Link } from "react-router-dom";
import logo from "../assets/FCTLogo.png";
import { FaLinkedin, FaFacebookF, FaInstagram } from "react-icons/fa";

export default function WelcomeFooter() {
  return (
    <footer className="bg-gray-800 text-white pt-12 pb-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between px-6 gap-10">
        {/* Left: Logo and copyright */}
        <div className="flex flex-col gap-4 min-w-[220px]">
          <div className="block items-center gap-3 justify-center cursor-pointer">
            <img src={logo} alt="Company Logo" className="h-[200px] w-[200px] rounded-full shadow" />
            <span className="text-lg font-bold tracking-wide">Future Code Technology</span>
          </div>
        </div>
        {/* Center: Services & Company */}
        <div className="flex flex-1 justify-center gap-20 text-left">
          <div>
            <div className="font-bold text-lg mb-3">Services</div>
            <ul className="space-y-2 text-sm ">
              <li>Web Development</li>
              <li>UI/UX Design</li>
              <li>Mobile App Development</li>
              <li>Full Stack Development</li>
              <li>Quality Assurance</li>
              <li>Project Management</li>
            </ul>
          </div>
          <div>
            <div className="font-bold text-lg mb-3">Company</div>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="hover:underline">About Us</Link>
              </li>
              <li>
                <Link to="/services" className="hover:underline">Services</Link>
              </li>
              <li>
                <Link to="/careers" className="hover:underline">Careers</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:underline">Contact Us</Link>
              </li>
            </ul>
          </div>
        </div>
        {/* Right: Let's Talk & Role Links */}
        <div className="flex flex-col items-center md:items-end gap-4 min-w-[220px]">
          <div className="text-sm text-gray-200 mb-1">Got questions or need assistance?</div>
          <div className="text-3xl font-extrabold mb-2">Engage With Us <span className="inline-block align-middle">→</span></div>
          <div className="flex gap-4 mb-2">
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="bg-white text-[#25194A] rounded-full p-2 hover:bg-indigo-100 transition">
              <FaLinkedin size={22} />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="bg-white text-[#25194A] rounded-full p-2 hover:bg-indigo-100 transition">
              <FaFacebookF size={20} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="bg-white text-[#25194A] rounded-full p-2 hover:bg-indigo-100 transition">
              <FaInstagram size={20} />
            </a>
          </div>
          <div className="flex gap-4">
            <Link to="/admin/login" className="text-gray-300 hover:text-indigo-600 font-semibold text-sm">ADMIN</Link>
            <Link to="/mentor/login" className="text-gray-300 hover:text-indigo-600 font-semibold text-sm">MENTOR</Link>
            <Link to="/intern/login" className="text-gray-300 hover:text-indigo-600 font-semibold text-sm">INTERN</Link>
          </div>
        </div>
      </div>
      {/* Bottom bar */}
      <div className="border-t border-gray-700 mt-8 pt-3 flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto px-6">
        <span className="text-xs text-gray-400 mb-2 md:mb-0">
          Copyright © {new Date().getFullYear()} Future Code Technology. All Rights Reserved.
        </span>
        <div className="flex items-center gap-4">
          <Link to="/privacy" className="text-xs text-gray-400 hover:text-indigo-600">Privacy Policy</Link>
          <span className="text-xs text-gray-400">|</span>
          <Link to="/terms" className="text-xs text-gray-400 hover:text-indigo-600">Terms & Conditions</Link>
        </div>
      </div>
    </footer>
  );
}