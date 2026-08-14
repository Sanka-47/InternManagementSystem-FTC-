import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Form from "../components/Form";
import Input from "../components/input";
import Button from "../components/Button";
import { registerAdmin } from "../services/admin";

export default function AdminRegisterPage() {
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      await registerAdmin({ username, email, password });
      await Swal.fire({
        title: "OTP Sent!",
        text: "A 6-digit OTP has been sent to the company email. To get it, please contact us.",
        icon: "info",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: 'w-[200px] sm:w-[400px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300'
        },
        buttonsStyling: false,
      });
      nav("/admin/register/otp", { state: { username, email, password } });
    } catch (e) {
      setErr(e?.response?.data?.message || "Registration failed!");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 bg-gradient-to-r from-gray-300 via-white to-indigo-500 
      bg-[length:200%_200%] animate-gradient">

      <Form title="Admin Registration" subtitle="Register a new admin account" onSubmit={onSubmit}>
        <Input label="Username" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter Username (admin)" />
        <Input label="Email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter Email (admin@gmail.com)" />
        <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
        {err && <div className="text-red-600 text-sm font-semibold mt-3">{err}</div>}
        <Button type="submit" className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700" disabled={busy}>
          {busy ? "Signing Up..." : "Sign Up"}
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