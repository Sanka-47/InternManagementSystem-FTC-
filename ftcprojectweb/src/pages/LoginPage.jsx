import { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth";
import { changeAdminPassword } from "../services/admin";
import { useAuth } from "../context/AuthContext";
import Form from "../components/Form";
import Input from "../components/input";
import Button from "../components/Button";

export default function LoginPage() {
  document.title = "FCT | Admin Login";
  const nav = useNavigate();
  const { setUser, setRole } = useAuth();
  const [emailOrUsername, setEU] = useState("");
  const [password, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const [showChange, setShowChange] = useState(false);
  const [cpIdentifier, setCpIdentifier] = useState("");
  const [cpOld, setCpOld] = useState("");
  const [cpNew, setCpNew] = useState("");
  const [cpConfirm, setCpConfirm] = useState("");
  const [cpErr, setCpErr] = useState("");
  const [cpOk, setCpOk] = useState("");
  const [cpBusy, setCpBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      const { token, user, role } = await login(emailOrUsername, password);
      localStorage.setItem("ims_token", token);
      setUser(user); setRole(role);
      await Swal.fire({
        title: 'Login Successful!',
        text: 'Welcome back, Admin!',
        icon: 'success',
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'w-[200px] sm:w-[400px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300'
        },
        buttonsStyling: false,
      });
      nav("/admin");
    } catch (e) {
      await Swal.fire({
        title: 'Login Failed!',
        text: e?.response?.data?.message || "Admin Login failed!",
        icon: 'error',
        confirmButtonText: 'Try Again!',
        customClass: {
          confirmButton: 'w-[200px] sm:w-[400px] bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300'
        },
        buttonsStyling: false,
      });
    } finally {
      setBusy(false);
    }
  }

  // handle change password
  async function onChangePw(e) {
    e.preventDefault();
    setCpErr(""); setCpOk(""); setCpBusy(true);
    try {
      if (!cpIdentifier || !cpOld || !cpNew) {
        setCpErr("All fields are required!");
        setCpBusy(false);
        return;
      }
      if (cpNew.length < 6) {
        setCpErr("New password must be at least 6 characters!");
        setCpBusy(false);
        return;
      }
      if (cpNew !== cpConfirm) {
        setCpErr("New password and confirmation do not match!");
        setCpBusy(false);
        return;
      }
      await changeAdminPassword({
        identifier: cpIdentifier,
        old_password: cpOld,
        new_password: cpNew
      });
      setCpOk("Password updated successfully. You can now sign in.");
      // Optionally prefill login fields
      setEU(cpIdentifier);
      setPw("");
      setCpOld(""); setCpNew(""); setCpConfirm("");
    } catch (e) {
      setCpErr(e?.response?.data?.message || "Failed to update password!");
    } finally {
      setCpBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col bg-gradient-to-r from-gray-300 via-white to-indigo-500 
      bg-[length:200%_200%] animate-gradient">

      <main className="flex-1 flex items-center justify-center px-4">
        <Form title="Admin Login" subtitle="Sign in to manage cohorts, projects, tasks, and more." onSubmit={onSubmit}>
          <br/>
          <Input
            label="Email or Username"
            value={emailOrUsername}
            onChange={(e) => setEU(e.target.value)}
            placeholder="admin or admin@gmail.com"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPw(e.target.value)}
            placeholder="••••••••"
          />

          {err && <div className="font-semibold text-red-600 text-sm mb-3">{err}</div>}

          {/* Change password trigger */}
          
          <div className="w-full text-center mt-6">
            <span className="text-sm text-gray-600">Need to update your password?</span>
            <button
              type="button"
              className="ml-2 text-indigo-700 hover:underline font-semibold text-sm"
              onClick={() => {
                setShowChange(true);
                setCpIdentifier(emailOrUsername || "");
              }}
            >
              Change Password
            </button>
          </div>

          <Button type="submit" disabled={busy} className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700">
            {busy ? "Signing in..." : "Sign In"}
          </Button>
          {/* Registration link */}
          <div className="w-full text-center mt-4">
            <span className="text-sm text-gray-600">New admin?</span>
            <button
              type="button"
              className="ml-2 text-indigo-700 hover:underline font-semibold text-sm"
              onClick={() => nav("/admin/register")}
            >
              Sign Up
            </button>
          </div>
        </Form>
      </main>

      {/* Change Password Modal */}
      {showChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 transform translate-y-20">
            <div className="text-lg font-semibold mb-4">Change Admin Password</div>
            <form onSubmit={onChangePw}>
              <Input
                label="Email or Username"
                value={cpIdentifier}
                onChange={(e) => setCpIdentifier(e.target.value)}
                placeholder="admin or admin@gmail.com"
              />
              <Input
                label="Current Password"
                type="password"
                value={cpOld}
                onChange={(e) => setCpOld(e.target.value)}
                placeholder="••••••••"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="New Password"
                  type="password"
                  value={cpNew}
                  onChange={(e) => setCpNew(e.target.value)}
                  placeholder="••••••••"
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={cpConfirm}
                  onChange={(e) => setCpConfirm(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              {cpErr && <div className="text-red-600 text-sm font-semibold mt-3">{cpErr}</div>}
              {cpOk && <div className="text-emerald-600 text-sm font-semibold mt-3">{cpOk}</div>}

              <Button
                type="submit"
                className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700"
                disabled={cpBusy}
              >
                {cpBusy ? "Saving..." : "Change Password"}
              </Button>

              <Button
                type="button"
                className="w-full mt-2 bg-red-600 hover:bg-red-700"
                onClick={() => { setShowChange(false); setCpErr(""); setCpOk(""); }}
              >
                Close
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
