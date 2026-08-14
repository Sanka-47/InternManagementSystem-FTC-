import { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { createMentor } from "../services/admin";
import Form from "../components/Form";
import Input from "../components/input";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";

export default function MentorRegister() {
  document.title = "FCT | Mentor Registration";
  const nav = useNavigate();
  const [username,setUsername]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [err,setErr]=useState("");

  async function onSubmit(e){
    e.preventDefault(); setErr("");
    try{
      await createMentor({ username, email, password });
      await Swal.fire({
        title: 'Mentor Registered !',
        text: 'Mentor registered successfully!',
        icon: 'success',
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'w-[200px] sm:w-[400px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300'
        },
        buttonsStyling: false,
      });
      nav("/admin/mentors"); 
    }catch(e){ 
      await Swal.fire({
        title: 'Oops !',
        text: e?.response?.data?.message || "Mentor registration failed",
        icon: 'error',
        confirmButtonText: 'Try Again!',
        customClass: {
          confirmButton: 'w-[200px] sm:w-[400px] bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300'
        },
        buttonsStyling: false,
      });
    }
  }

  const { user } = useAuth();
    
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 w-full bg-gray-800 border-b border-gray-200 py-3 flex items-center justify-end px-6">
        <div className="flex flex-col text-right">
          <div className="font-semibold text-lg text-white">Future Code Technology - Register Mentors</div>
          <span className="text-sm text-gray-400">Welcome back, {user?.username}</span>
        </div>
      </nav>
      <div className="mt-6 p-6">
        <Form title="Register Mentor" subtitle="Register mentors to manage tasks and everything" onSubmit={onSubmit}>
            <Input label="Username" placeholder="Enter mentor username" value={username} onChange={e=>setUsername(e.target.value)} />
            <Input label="Email" value={email} placeholder="Enter mentor email" onChange={e=>setEmail(e.target.value)} />
            <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} />
            {err && <div className="font-semibold text-red-600 text-sm mb-3">{err}</div>}
            <Button type="submit" className="w-full mt-6 mb-5 bg-indigo-600 hover:bg-indigo-700">Register Mentor</Button>
        </Form>
      </div>
    </div> 
  );
}
