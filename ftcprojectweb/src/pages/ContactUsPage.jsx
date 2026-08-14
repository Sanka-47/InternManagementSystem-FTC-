import { useState } from "react";
import { motion } from "framer-motion";
import { FaMapMarkerAlt, FaEnvelope, FaPhoneAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import WelcomeNavbar from "../components/WelcomeNavbar";
import Footer from "../components/WelcomeFooter";
import Input from "../components/input";
import Textarea from "../components/Textarea";
import Button from "../components/Button";
import { submitAppointment } from "../services/appointment";

export default function ContactUsPage() {
  document.title = "FCT | Contact Us";

  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [busy, setBusy] = useState(false);

  const onChange = (e) => {
    const key = e.target.name || e.target.id;
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      setBusy(true);
      await submitAppointment(form);
      await Swal.fire({
        icon: "success",
        title: "Appointment submitted!",
        text: "Thank you! We’ll reach out to you shortly.",
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'w-[200px] sm:w-[400px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300'
        },
        buttonsStyling: false,
      });
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Failed to make your appointment!",
        confirmButtonText: 'Try Again!',
        customClass: {
          confirmButton: 'w-[200px] sm:w-[400px] bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300'
        },
        buttonsStyling: false,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <WelcomeNavbar />

      {/* Banner */}
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
          style={{ letterSpacing: "1px", textShadow: "0 2px 8px rgba(45,23,77,0.12)" }}
        >
          Contact Us
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-lg md:text-xl text-gray-600 mb-8 z-10"
        >
          Get in Touch with Our Team
        </motion.p>
      </section>

      {/* Contact Section */}
      <section className="relative w-full px-6 md:px-10 lg:px-20 py-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="space-y-8"
          >
            {/* Heading + Subtext */}
            <div>
              <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-indigo-700">
                Make a quick Appointment
              </h3>
              <p className="mt-3 text-base md:text-lg text-gray-600 leading-relaxed max-w-prose text-justify">
                Have a question, need support, or want to discuss your requirements?
                Book a quick appointment with our team and we’ll be happy to help. We aim to respond
                within one business day.
              </p>
            </div>

            {/* Contact Info Section */}
            <div className="flex flex-col gap-8">
              {/* Address */}
              <div className="flex items-start gap-4">
                <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-indigo-100">
                  <FaMapMarkerAlt className="text-indigo-600 text-lg" />
                </span>
                <div>
                  <div className="text-lg font-semibold text-gray-800">
                    Moratuwa, Colombo, Western Province, Sri Lanka
                  </div>
                  <div className="text-base text-gray-500">Our Address</div>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-indigo-100">
                  <FaEnvelope className="text-indigo-600 text-lg" />
                </span>
                <div>
                  <div className="text-lg font-semibold text-gray-900">futurecthr@gmail.com</div>
                  <div className="text-base text-gray-500">Our Email</div>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4">
                <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-indigo-100">
                  <FaPhoneAlt className="text-indigo-600 text-lg" />
                </span>
                <div>
                  <div className="text-lg font-semibold text-gray-900">+94 70 487 4702</div>
                  <div className="text-base text-gray-500">Our Phone</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="bg-white rounded-2xl shadow-xl ring-1 ring-black/5 p-6 md:p-8"
          >
            <div className="mb-6">
              <h4 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
                Send us a message
              </h4>
              <p className="mt-1 text-sm text-gray-500">
                Fill out the form and our team will reach out to you shortly.
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              <Input
                label={<>Name <span className="text-red-500">*</span></>}
                id="name"
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder="Your full name"
                required
              />
              <Input
                label={<>Email <span className="text-red-500">*</span></>}
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                placeholder="you@gmail.com"
                required
              />
              <Textarea
                label={<>Message <span className="text-red-500">*</span></>}
                id="message"
                name="message"
                rows={5}
                value={form.message}
                onChange={onChange}
                placeholder="Write your message here…"
                required
              />

              <div className="pt-2">
                <Button type="submit" disabled={busy} className="w-full mt-6 mb-5 bg-indigo-600 hover:bg-indigo-700">
                  {busy ? "Submitting..." : "Make Appointment"} 
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
