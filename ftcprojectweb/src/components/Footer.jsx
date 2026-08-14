export default function Footer() {
  return (
    <footer className="w-full bg-gray-800 text-white py-4 px-6 mt-auto">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <p className="text-sm text-white cursor-pointer">
          © {new Date().getFullYear()} Future Code Technology. All rights reserved.
        </p>
        <div className="flex gap-4 mt-2 md:mt-0">
          <a href="/" className="text-gray-400 hover:text-white text-sm transition">
            Home
          </a>
          <a href="/about" className="text-gray-400 hover:text-white text-sm transition">
            About Us
          </a>
          <a href="/services" className="text-gray-400 hover:text-white text-sm transition">
            Services
          </a>
          <a href="/contact" className="text-gray-400 hover:text-white text-sm transition">
            Contact Us
          </a>
        </div>
      </div>
    </footer>
  );
}
