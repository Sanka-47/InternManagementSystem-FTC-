import { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Form from "../components/Form";
import Button from "../components/Button";
import { verifyAdminOtp } from "../services/admin";

export default function AdminRegisterOtpPage() {
  const nav = useNavigate();
  const location = useLocation();
  const { username, email, password } = location.state || {};
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const inputsRef = useRef([]);

  if (!username || !email || !password) {
    nav("/admin/register");
    return null;
  }

  // Handle OTP input
  const handleChange = (e, idx) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    if (!val) return;
    const newOtp = [...otp];
    newOtp[idx] = val[0];
    setOtp(newOtp);
    // Move to next input
    if (idx < 5 && val) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace") {
      if (otp[idx]) {
        // Clear current
        const newOtp = [...otp];
        newOtp[idx] = "";
        setOtp(newOtp);
      } else if (idx > 0) {
        // Move to previous
        inputsRef.current[idx - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    } else if (e.key === "ArrowRight" && idx < 5) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "");
    if (paste.length === 6) {
      setOtp(paste.split(""));
      // Focus the last input
      setTimeout(() => {
        inputsRef.current[5]?.focus();
      }, 0);
      e.preventDefault();
    }
  };

  async function onSubmit(e) {
    e.preventDefault();
    setErr(""); setBusy(true);
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setErr("Please enter the 6-digit OTP.");
      setBusy(false);
      return;
    }
    try {
      await verifyAdminOtp({ username, email, password, otp: otpValue });
      await Swal.fire({
        title: "Registration Successful!",
        text: "Admin registered successfully. You can now login.",
        icon: "success",
        confirmButtonText: "Go to Login",
        customClass: {
          confirmButton: 'w-[200px] sm:w-[400px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300'
        },
        buttonsStyling: false,
      });
      nav("/admin/login");
    } catch (e) {
      setErr(e?.response?.data?.message || "OTP verification failed!");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 bg-gradient-to-r from-gray-300 via-white to-indigo-500 
      bg-[length:200%_200%] animate-gradient">
        
      <Form title="Admin OTP Verification" subtitle="Enter the 6-digit OTP sent to the company email" onSubmit={onSubmit}>
        <div className="flex justify-center gap-2 my-4">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={el => inputsRef.current[idx] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(e, idx)}
              onKeyDown={e => handleKeyDown(e, idx)}
              onPaste={idx === 0 ? handlePaste : undefined} // <-- Add this line
              className="w-12 h-12 text-2xl text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus={idx === 0}
            />
          ))}
        </div>
        {err && <div className="text-red-600 text-sm font-semibold mt-3">{err}</div>}
        <Button type="submit" className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700" disabled={busy}>
          {busy ? "Verifying..." : "Verify OTP"}
        </Button>
        <div className="w-full text-center mt-4">
          <span className="text-sm text-gray-600">Already have an account?</span>
          <button
            type="button"
            className="ml-2 text-indigo-700 hover:underline font-semibold text-sm"
            onClick={() => nav("/admin/login")}
          >
            Back to Login
          </button>
        </div>
      </Form>
    </div>
  );
}