import { motion } from "framer-motion";
import { useState } from "react";
import WelcomeNavbar from "../components/WelcomeNavbar";
import Footer from "../components/WelcomeFooter";
import Input from "../components/input";
import Button from "../components/Button";
import careerImg from "../assets/CareerImg.png";
import Swal from "sweetalert2";
import { submitCareerApplication } from "../services/careers";

export default function CareersPage() {
  document.title = "FCT | Careers";

  const [form, setForm] = useState({ name: "", email: "", phone: ""});
  const [cv, setCv] = useState(null);
  const [busy, setBusy] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.id]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!cv) {
      Swal.fire({ icon: "warning", 
        title: "Please attach your CV",
        confirmButtonText: 'Try Again!',
        customClass: {
          confirmButton: 'w-[200px] sm:w-[400px] bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300'
        },
        buttonsStyling: false,
      });
      return;
    }
    try {
      setBusy(true);
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("email", form.email);
      fd.append("phone", form.phone);
      fd.append("cv", cv);

      await submitCareerApplication(fd);

      Swal.fire({
        icon: "success",
        title: "Application submitted!",
        text: "Thank you! We’ll get back to you soon.",
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'w-[200px] sm:w-[400px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300'
        },
        buttonsStyling: false,
      });

      setForm({ name: "", email: "", phone: ""});
      setCv(null);
      const fileInput = document.getElementById("cv");
      if (fileInput) fileInput.value = "";
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Failed to send your application!",
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
          style={{
            letterSpacing: "1px",
            textShadow: "0 2px 8px rgba(45,23,77,0.12)",
          }}
        >
          Careers
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-lg md:text-xl text-gray-600 mb-8 z-10"
        >
          Unlock Your Potential with Exciting Career Opportunities
        </motion.p>
      </section>

      {/* Apply Form Section */}
      <section className="relative w-full px-6 md:px-10 lg:px-20 py-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="rounded-2xl overflow-hidden">
              <img
                src={careerImg}
                alt="Join our internship program"
                className="w-full h-[700px] object-cover hover:scale-[1.02] transition-transform duration-500 p-6 md:p-8"
              />
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
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
                Apply as an Intern
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Share your details and upload your CV. We’ll get back to you soon.
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              <Input
                label={<>Full Name <span className="text-red-500">*</span></>}
                id="name"
                value={form.name}
                onChange={onChange}
                required
                placeholder="Your name"
              />
              <Input
                label={<>Email <span className="text-red-500">*</span></>}
                id="email"
                type="email"
                value={form.email}
                onChange={onChange}
                required
                placeholder="you@gmail.com"
              />
              <Input
                label={<>Phone Number <span className="text-red-500">*</span></>}
                id="phone"
                type="tel"
                value={form.phone}
                onChange={onChange}
                required
                inputMode="tel"
                placeholder="+94 7X XXX XXXX"
              />
              <div>
                <Input
                  label={<>Upload CV <span className="text-red-500">*</span></>}
                  id="cv"
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  required
                  onChange={(e) => setCv(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-700 file:mr-3 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />
                <p className="mt-1 text-xs text-gray-500 mb-6">
                  Accepted: PDF, DOC, DOCX, PNG, JPG (max 10MB).
                </p>
              </div>
              
              <Button type="submit" disabled={busy} className="w-full mt-6 mb-5 bg-indigo-600 hover:bg-indigo-700">
                {busy ? "Submitting..." : "Submit Application"}
              </Button>
            </form>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
