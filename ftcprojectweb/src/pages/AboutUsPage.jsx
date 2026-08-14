//import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
// import team1 from "../assets/team1.jpeg";
// import team2 from "../assets/team2.jpeg";
// import team3 from "../assets/team3.jpeg";
// import team4 from "../assets/team4.jpeg";
import { FaHandshake, FaAward, FaUserShield, FaRocket, FaSmile, FaClock } from "react-icons/fa";
import WelcomeNavbar from "../components/WelcomeNavbar";
import Footer from "../components/WelcomeFooter";
import CountUp from "react-countup";

// Team members array with image and name
// const teamMembers = [
//   { img: team1, name: "Alice Fernando" },
//   { img: team2, name: "Bob Silva" },
//   { img: team3, name: "Chathura Perera" },
//   { img: team4, name: "Dilani Jayasuriya" },
// ];

// const VISIBLE_COUNT = 4;

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
    label: "Founded",
    value: "2023",
    color: "text-yellow-500",
  },
  {
    label: "Company Size",
    value: "200+ Employees",
    color: "text-green-500",
  },
  {
    label: "Industry",
    value: "IT Service and IT Consulting",
    color: "text-blue-500",
  },
];

export default function AboutUs() {
  document.title = "FCT | About Us";

  // Slider state
  // const [start, setStart] = useState(0);
  // const timeoutRef = useRef(null);

  // Auto-slide every 2.5 seconds
  // useEffect(() => {
  //   timeoutRef.current = setTimeout(() => {
  //     setStart((prev) => (prev + 1) % teamMembers.length);
  //   }, 2500);
  //   return () => clearTimeout(timeoutRef.current);
  // }, [start]);

  // Slide animation variants
  // const variants = {
  //   enter: (direction) => ({
  //     x: direction > 0 ? 300 : -300,
  //     opacity: 0,
  //     position: "absolute",
  //   }),
  //   center: {
  //     x: 0,
  //     opacity: 1,
  //     position: "relative",
  //   },
  //   exit: (direction) => ({
  //     x: direction < 0 ? 300 : -300,
  //     opacity: 0,
  //     position: "absolute",
  //   }),
  // };

  // For manual navigation
  // const [direction, setDirection] = useState(1);
  // const handlePrev = () => {
  //   setDirection(-1);
  //   setStart((prev) => (prev - 1 + teamMembers.length) % teamMembers.length);
  // };
  // const handleNext = () => {
  //   setDirection(1);
  //   setStart((prev) => (prev + 1) % teamMembers.length);
  // };

  // Get the visible team members (wrap around)
  // const visibleMembers = [];
  // for (let i = 0; i < VISIBLE_COUNT; i++) {
  //   visibleMembers.push(teamMembers[(start + i) % teamMembers.length]);
  // }

  // Track which image is hovered
  //const [hoveredIdx, setHoveredIdx] = useState(null);

  return (
    <div className="min-h-screen flex flex-col">
      <WelcomeNavbar />

      {/* About Us Banner */}
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
          About Us
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-lg md:text-xl text-gray-500 mb-8"
        >
          Providing high-quality virtual assistance that will help reach your business objectives!
        </motion.p>
      </section>

      {/* About Us Description */}
      <section className="max-w-7xl mx-auto px-6 py-8 text-justify">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-8"
        >
          <h3 className="text-2xl font-bold text-indigo-700 mb-4">Future Code Technology (FCT)</h3>
          <p className="text-gray-700 text-lg mb-4">
            The Future Code Technology (FCT) is a Founder at Future Code Technologies | Driving Innovation in Software & Hotel Tech Solutions
          </p>
          <p className="text-gray-700 text-lg mb-4">
            I’m the founder of Future Code Technologies, a forward-thinking IT company focused on delivering high-quality software solutions for businesses across industries. Our work spans custom software development, mobile and web applications, and technology solutions for the hospitality industry, including hotel management systems.
          </p>
          <p className="text-gray-700 text-lg">
            We’re passionate about solving real-world problems through clean code, smart design, and strategic development. Let’s connect and build the future together!
          </p>
        </motion.div>
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
                show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
              }}
            >
              <span className="text-lg font-semibold text-gray-700 mt-2">
                {kpi.label}
              </span>

              <span className={`text-1xl md:text-2xl font-extrabold ${kpi.color}`}>
                {typeof kpi.value === "number" ? (
                  <>
                    <CountUp end={kpi.value} duration={2} />
                    <span className="text-xl">+</span>
                  </>
                ) : (
                  kpi.value
                )}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </section>


      {/* Our Team Banner */}
      {/* <section className="w-full flex flex-col items-center justify-center px-8 md:px-20 pt-16 pb-8 relative overflow-hidden">
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
          Our Team
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
          Get to Know the Faces Behind Future Code Technology
        </motion.p>
      </section> */}

      {/* Team Slider with 4 visible images and name on hover */}
      {/* <section className="max-w-7xl mx-auto px-6 pb-16 relative">
        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            onClick={handlePrev}
            className="bg-indigo-100 hover:bg-indigo-300 text-indigo-700 font-bold rounded-full w-10 h-10 flex items-center justify-center shadow transition"
            aria-label="Previous"
          >
            &#8592;
          </button>
          <button
            onClick={handleNext}
            className="bg-indigo-100 hover:bg-indigo-300 text-indigo-700 font-bold rounded-full w-10 h-10 flex items-center justify-center shadow transition"
            aria-label="Next"
          >
            &#8594;
          </button>
        </div>
        <div className="relative h-[280px] flex items-center justify-center overflow-hidden">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={start}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="flex gap-6 w-full justify-center"
              style={{ position: "absolute", left: 0, right: 0, margin: "auto" }}
            >
              {visibleMembers.map((member, idx) => (
                <div
                  key={idx}
                  className="relative min-w-[300px] h-[280px] flex items-center justify-center group cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  <img
                    src={member.img}
                    alt={`Team member ${member.name}`}
                    className="w-[300px] h-[280px] rounded-lg object-cover"
                  />
                  <AnimatePresence>
                    {hoveredIdx === idx && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 rounded-lg"
                      >
                        <span className="text-white text-xl font-bold">{member.name}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div> */}
        {/* Dots */}
        {/* <div className="flex justify-center gap-2 mt-4 mb-10">
          {teamMembers.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDirection(idx > start ? 1 : -1);
                setStart(idx);
              }}
              className={`w-3 h-3 rounded-full ${idx === start ? "bg-indigo-700" : "bg-gray-300"}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section> */}

      {/* Why Choose Us Banner */}
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

      <Footer />
    </div>
  );
}