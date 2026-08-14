import { Link } from "react-router-dom";
import Footer from "../components/WelcomeFooter";
import WelcomeNavbar from "../components/WelcomeNavbar";
import { FaLaptopCode, FaPalette, FaMobileAlt, FaLayerGroup, FaCheckCircle, FaProjectDiagram, FaClock } from "react-icons/fa";
import { FaHandshake, FaAward, FaUserShield, FaRocket, FaSmile } from "react-icons/fa";
import CountUp from "react-countup";
import bannerImg from "../assets/BannerImg.png";
import contactImg from "../assets/ContactImg.png";
import { motion } from "framer-motion";

// Reasons data
const reasons = [
  {
    icon: <FaHandshake size={40} className="text-blue-500" />,
    title: "Trusted Partnership",
    desc: "We build long-term relationships with our clients, focusing on trust and transparency.",
  },
  {
    icon: <FaAward size={40} className="text-yellow-500" />,
    title: "Proven Excellence",
    desc: "Our team delivers high-quality solutions, recognized by industry awards and client satisfaction.",
  },
  {
    icon: <FaUserShield size={40} className="text-green-500" />,
    title: "Expert Team",
    desc: "Our experts bring years of experience and specialized skills to every project.",
  },
  {
    icon: <FaRocket size={40} className="text-purple-500" />,
    title: "Innovative Approach",
    desc: "We use the latest technologies and creative strategies to drive your business forward.",
  },
  {
    icon: <FaSmile size={40} className="text-pink-500" />,
    title: "Customer Satisfaction",
    desc: "We prioritize your needs and ensure a smooth, enjoyable experience from start to finish.",
  },
  {
    icon: <FaClock size={40} className="text-gray-500" />,
    title: "Timely Delivery",
    desc: "Not exceeding deadlines, on-time delivery, and efficiency define us. Explore metrics showcasing our project management excellence.",
  },
];

// KPI data
const kpis = [
  {
    label: "Projects Completed",
    value: 120,
    color: "text-blue-500",
  },
  {
    label: "Happy Clients",
    value: 85,
    color: "text-green-500",
  },
  {
    label: "Skilled Experts",
    value: 25,
    color: "text-yellow-500",
  },
];

// Services data
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

export default function HomePage() {
  document.title = "FCT | Welcome to Future Code Technology";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <WelcomeNavbar />

      {/* Banner */}
      <section className="w-full flex flex-col md:flex-row items-center justify-between px-8 md:px-20 pt-20 pb-10 bg-gradient-to-r from-gray-300 via-white to-indigo-500 bg-[length:200%_200%] animate-gradient relative overflow-hidden">
        {/* Text */}
        <div className="flex-1 max-w-2xl z-10 pl-12">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="uppercase text-indigo-700 text-sm font-semibold tracking-widest mb-2"
          >
            Future Code Technology - FCT
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-4xl md:text-6xl font-extrabold text-gray-800 mb-4 leading-tight"
          >
            <span className="text-indigo-700">Welcome back, </span>
            Future Code<br />
            Technology<br />
            
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-lg md:text-xl text-gray-500 mb-8"
          >
            We provide high-quality virtual assistance that will help reach your business objectives!
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.1 }}
          >
            <Link
              to="/about"
              className="inline-block px-10 py-3 bg-indigo-600 text-white rounded-2xl shadow-lg hover:bg-indigo-700 transition font-semibold text-lg"
            >
              ABOUT US
            </Link>
          </motion.div>
        </div>
        {/* Illustration */}
        <motion.div
          className="flex-1 flex justify-center items-center mt-10 md:mt-0 z-10"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.6 }}
        >
          <img
            src={bannerImg}
            alt="Banner Illustration"
            className="w-[350px] md:w-[500px] max-w-full"
            draggable={false}
          />
        </motion.div>
        {/* Decorative background circuit lines */}
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
      </section>

      {/* Services Banner */}
      <section className="w-full flex flex-col items-center justify-center px-8 md:px-20 pt-16 pb-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <svg
            className="w-full h-full"
            viewBox="0 0 1440 300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ opacity: 0.13 }}
          >
            <path
              d="M0 50C200 150 400 0 600 50C800 150 1000 0 1200 50C1400 150 1600 0 1800 50"
              stroke="#2d174d"
              strokeWidth="2"
              strokeDasharray="8 8"
            />
          </svg>
        </div>
        <motion.h2
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={{
            hidden: { opacity: 0, y: -30 },
            show:   { opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.1 } },
          }}
          //initial={{ opacity: 0, y: -30 }}
          //animate={{ opacity: 1, y: 0 }}
          //transition={{ duration: 0.7, delay: 0.1 }}
          className="text-3xl md:text-4xl font-extrabold text-indigo-700 mb-2 z-10"
        >
          Our Services
        </motion.h2>
        <motion.p
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={{
            hidden: { opacity: 0, y: 30 },
            show:   { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.3 } },
          }}
          //initial={{ opacity: 0, y: 30 }}
          //animate={{ opacity: 1, y: 0 }}
          //transition={{ duration: 0.8, delay: 0.3 }}
          className="text-lg md:text-xl text-gray-500 mb-8"
        >
          Explore the core features of the Future Code Technology
        </motion.p>
      </section>

      {/* Services List */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {services.map((service, idx) => (
            <motion.div
              key={service.title}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              variants={{
                hidden: { opacity: 0, y: 40 },
                show:   { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2 + idx * 0.15 } },
              }}
              //initial={{ opacity: 0, y: 40 }}
              //animate={{ opacity: 1, y: 0 }}
              //transition={{ duration: 0.6, delay: 0.2 + idx * 0.15 }}
              className="bg-white rounded-xl shadow-md p-8 flex flex-col items-center text-center"
            >
              <div className="mb-4">{service.icon}</div>
              <h3 className="text-xl font-bold text-indigo-800 mb-2">{service.title}</h3>
              <p className="text-gray-600 text-base">{service.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why Choose Us Banner */}
      <section className="w-full flex flex-col items-center justify-center px-8 md:px-20 pt-16 pb-8 relative overflow-hidden bg-gradient-to-r from-gray-300 via-white to-indigo-500 bg-[length:200%_200%] animate-gradient mt-10">
        <div className="absolute inset-0 pointer-events-none">
          <svg
            className="w-full h-full"
            viewBox="0 0 1440 300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ opacity: 0.10 }}
          >
            <path
              d="M0 50C200 150 400 0 600 50C800 150 1000 0 1200 50C1400 150 1600 0 1800 50"
              stroke="#2d174d"
              strokeWidth="2"
              strokeDasharray="8 8"
            />
          </svg>
        </div>
        <motion.h2
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          //initial={{ opacity: 0, y: -30 }}
          //animate={{ opacity: 1, y: 0 }}
          //transition={{ duration: 0.7, delay: 0.1 }}
          variants={{
            hidden: { opacity: 0, y: -30 },
            show:   { opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.1 } },
          }}
          className="text-3xl md:text-4xl font-extrabold text-indigo-700 mb-2 z-10"
        >
          Why Will You Choose Us
        </motion.h2>
        <motion.p
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          //initial={{ opacity: 0, y: 30 }}
          //animate={{ opacity: 1, y: 0 }}
          //transition={{ duration: 0.8, delay: 0.3 }}
          variants={{
            hidden: { opacity: 0, y: 30 },
            show:   { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.3 } },
          }}
          className="text-lg md:text-xl text-gray-500 mb-8"
        >
          Discover the reasons why our clients trust us for their digital transformation and business growth.
        </motion.p>

        {/* Reasons Cards */}
        <div className="max-w-7xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-12 z-10 px-6 py-8">
          {reasons.map((reason, idx) => (
            <motion.div
              key={reason.title}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              //initial={{ opacity: 0, y: 40 }}
              //animate={{ opacity: 1, y: 0 }}
              //transition={{ duration: 0.6, delay: 0.2 + idx * 0.15 }}
              variants={{
                hidden: { opacity: 0, y: 40 },
                show:   { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2 + idx * 0.15 } },
              }}
              className="bg-white rounded-xl shadow-md p-8 flex flex-col items-center text-center"
            >
              <div className="mb-4">{reason.icon}</div>
              <h3 className="text-xl font-bold text-indigo-800 mb-2">{reason.title}</h3>
              <p className="text-gray-600 text-base">{reason.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* KPIs */}
      <section>
        <motion.div
          className="max-w-7xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-12 mt-12 z-10 px-6 py-8"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={{
            hidden: { opacity: 1 },
            show: {
              transition: { staggerChildren: 0.15, delayChildren: 0.15 },
            },
          }}
        >
          {kpis.map((kpi, idx) => (
            <motion.div
              key={kpi.label}
              className="flex flex-col items-center bg-white rounded-xl shadow p-6 min-w-[180px]"
              variants={{
                hidden: { opacity: 0, y: 30 },
                show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
              }}
            >
              {/* Icon */}
              <div className="mb-2">
                {idx === 0 && <FaProjectDiagram size={36} className="text-blue-500" />}
                {idx === 1 && <FaSmile size={36} className="text-green-500" />}
                {idx === 2 && <FaUserShield size={36} className="text-yellow-500" />}
              </div>

              <span className={`text-4xl md:text-5xl font-extrabold ${kpi.color}`}>
                <CountUp end={kpi.value} duration={2} />
                <span className="text-3xl">+</span>
              </span>

              <span className="text-lg font-semibold text-gray-700 mt-2">
                {kpi.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </section>


      {/* Contact Us Banner */}
      <section className="w-full flex flex-col items-center justify-center px-8 md:px-20 pt-24 relative overflow-hidden bg-gray-800 ">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center rounded-2xl p-6 md:p-3 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
          >
            <img
              src={contactImg}
              alt="Get in touch"
              className="w-[350px] md:w-[500px] max-w-full"
              draggable={false}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col items-start"
          >
            <h3 className="text-3xl md:text-4xl font-extrabold text-indigo-500">
              Let’s Build Something Great Together
            </h3>
            <p className="text-white text-lg mt-4 mb-8">
              Have questions or want to discuss your needs? Our team is ready to help you get the most out of Future Code Technology.
            </p>
            <Link
              to="/contact"
              className="inline-block px-10 py-3 bg-indigo-600 text-white rounded-2xl shadow-lg hover:bg-indigo-700 transition font-semibold text-lg"
            >
              Contact Us
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}