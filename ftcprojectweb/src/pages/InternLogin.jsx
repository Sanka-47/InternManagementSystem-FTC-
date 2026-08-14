import { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { loginIntern } from "../services/auth";
import { useAuth } from "../context/AuthContext";
import Form from "../components/Form";
import Input from "../components/input";
import Button from "../components/Button";

export default function InternLogin() {
  document.title = "FCT | Intern Login";
  const nav = useNavigate();
  const { setUser, setRole } = useAuth();
  const [emailOrUsername, setEU] = useState("");
  const [password, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      const { token, user, role } = await loginIntern(emailOrUsername, password);
      localStorage.setItem("ims_token", token);
      setUser(user); setRole(role);
      await Swal.fire({
        title: 'Login Successful!',
        text: 'Welcome back, intern',
        icon: 'success',
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'w-[200px] sm:w-[400px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300'
        },
        buttonsStyling: false,
      });
      nav("/intern");
    } catch (e) {
      await Swal.fire({
        title: 'Login Failed!',
        text: e?.response?.data?.message || "Intern Login failed!",
        icon: 'error',
        confirmButtonText: 'Try Again!',
        customClass: {
          confirmButton: 'w-[200px] sm:w-[400px] bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300'
        },
        buttonsStyling: false,
      });
      setErr(e?.response?.data?.message || "Intern Login failed!");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col bg-gradient-to-r from-gray-300 via-white to-indigo-500 
      bg-[length:200%_200%] animate-gradient">
      <main className="flex-1 flex items-center justify-center px-4">
        <Form title="Intern Login" subtitle="Sign in to view tasks, attendance, and feedback." onSubmit={onSubmit}><br/>
          <Input label="Email or Username" value={emailOrUsername} onChange={(e) => setEU(e.target.value)} placeholder="intern or intern@gmail.com" />
          <Input label="Password" type="password" value={password} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" />
          {err && <div className="font-semibold text-red-600 text-sm mb-3">{err}</div>}
          <Button type="submit" disabled={busy} className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700">{busy ? "Signing in..." : "Sign In"}</Button>
        </Form>
      </main>
    </div>
  );
}
