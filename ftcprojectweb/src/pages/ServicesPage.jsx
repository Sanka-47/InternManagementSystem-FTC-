import { motion } from "framer-motion";
import { FaLaptopCode, FaPalette, FaMobileAlt, FaLayerGroup, FaCheckCircle, FaProjectDiagram } from "react-icons/fa";
import WelcomeNavbar from "../components/WelcomeNavbar";
import Footer from "../components/WelcomeFooter";

const services = [
  {
    icon: <FaLaptopCode size={40} className="text-yellow-500" />,
    title: "Web Development",
    desc: "Building responsive and robust web applications tailored to your business needs using modern technologies.",
  },
  {
    icon: <FaPalette size={40} className="text-purple-500" />,
    title: "UI/UX Design",
    desc: "Designing intuitive and engaging user interfaces to ensure seamless user experiences across all platforms.",
  },
  {
    icon: <FaMobileAlt size={40} className="text-orange-500" />,
    title: "Mobile App Development",
    desc: "Creating high-performance mobile applications for Android and iOS to expand your digital reach.",
  },
  {
    icon: <FaLayerGroup size={40} className="text-blue-500" />,
    title: "Full Stack Development",
    desc: "Delivering end-to-end solutions with expertise in both frontend and backend development for scalable systems.",
  },
  {
    icon: <FaCheckCircle size={40} className="text-green-500" />,
    title: "Quality Assurance",
    desc: "Ensuring the reliability and quality of your products through rigorous testing and validation processes.",
  },
  {
    icon: <FaProjectDiagram size={40} className="text-gray-500" />,
    title: "Project Management",
    desc: "Managing projects efficiently from initiation to delivery, ensuring timely completion and client satisfaction.",
  },
];

export default function ServicesPage() {
  document.title = "FCT | Our Services";
  return (
    <div className="min-h-screen flex flex-col">
      <WelcomeNavbar />

      {/* Services Banner */}
      <section className="w-full flex flex-col items-center justify-center px-8 md:px-20 pt-24 pb-10 relative overflow-hidden bg-gradient-to-r from-gray-300 via-white to-indigo-500 bg-[length:200%_200%] animate-gradient">
        <div className="absolute inset-0 pointer-events-none">
          <svg
            className="w-full h-full"
            viewBox="0 0 1440 600"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ opacity: 0.13 }}
          >
            <path
              d="M0 100C200 200 400 0 600 100C800 200 1000 0 1200 100C1400 200 1600 0 1800 100"
              stroke="#2d174d"
              strokeWidth="2"
              strokeDasharray="8 8"
            />
          </svg>
        </div>
        <motion.h2
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl md:text-6xl font-extrabold text-indigo-700 mb-2 z-10 drop-shadow-lg"
          style={{
            letterSpacing: "1px",
            textShadow: "0 2px 8px rgba(45,23,77,0.12)",
          }}
        >
          Services
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-lg md:text-xl text-gray-500 mb-8"
        >
          Driving Innovation in Software & Hotel Tech Solutions
        </motion.p>
      </section>

      {/* Services List */}
      <section className="max-w-7xl mx-auto px-6 py-8 mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {services.map((service, idx) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + idx * 0.15 }}
              className="bg-white rounded-xl shadow-md p-8 flex flex-col items-center text-center"
            >
              <div className="mb-4">{service.icon}</div>
              <h3 className="text-xl font-bold text-indigo-700 mb-2">{service.title}</h3>
              <p className="text-gray-600 text-base">{service.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}