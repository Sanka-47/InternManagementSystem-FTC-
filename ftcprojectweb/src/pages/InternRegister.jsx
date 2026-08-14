import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { createIntern, listCohorts } from "../services/admin";
import Form from "../components/Form";
import Input from "../components/input";
import Select from "../components/Select";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";

export default function InternRegister(){
  document.title = "FCT | Intern Registration";
  const nav = useNavigate();
  const [cohorts,setCohorts]=useState([]);
  const [form,setForm]=useState({cohorts_id:"", username:"", position:"", email:"", password:""});
  const [err,setErr]=useState("");

  useEffect(()=>{ listCohorts().then(setCohorts); },[]);

  function set(k,v){ setForm((f)=>({ ...f, [k]:v })); }

  async function onSubmit(e){
    e.preventDefault(); setErr("");
    try{
      await createIntern({ ...form, cohorts_id: Number(form.cohorts_id) });
      await Swal.fire({
        title: 'Intern Registered!',
        text: 'Intern registered succesfully!',
        icon: 'success',
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'w-[200px] sm:w-[400px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300'
        },
        buttonsStyling: false,
      });
      nav("/admin/interns");
    }catch(e){ 
      await Swal.fire({
        title: 'Oops!',
        text: e?.response?.data?.message || "Intern registration failed!",
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
          <div className="font-semibold text-lg text-white">Future Code Technology - Register Interns</div>
          <span className="text-sm text-gray-400">Welcome back, {user?.username}</span>
        </div>
      </nav>
      <div className="mt-6 p-6">
        <Form title="Register Intern" subtitle="Assign the intern to an existing cohort" onSubmit={onSubmit}>
            <Select label="Select Cohort" value={form.cohorts_id} onChange={e=>set("cohorts_id", e.target.value)}>
            <option value="" disabled>-- choose cohort --</option>
            {cohorts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <Input label="Username" value={form.username} placeholder="Enter intern username" onChange={e=>set("username", e.target.value)} />
            <Input label="Position" value={form.position} placeholder="Enter intern position" onChange={e=>set("position", e.target.value)} />
            <Input label="Email" value={form.email} placeholder="Enter intern email" onChange={e=>set("email", e.target.value)} />
            <Input label="Password" type="password" value={form.password} placeholder="••••••••" onChange={e=>set("password", e.target.value)} />
            
            {err && <div className="font-semibold text-red-600 text-sm mb-3">{err}</div>}
            <div>
            <Button type="submit" className="w-full mt-6 mb-5 bg-indigo-600 hover:bg-indigo-700">Register Intern</Button><br/>
            <p className="text-sm text-gray-600 text-center">No any cohorts created yet?</p>
            <Button className="w-full mt-5 bg-indigo-600 hover:bg-indigo-700" onClick={()=>nav("/admin/cohorts/new")} type="button">Create Cohort</Button>
            </div>
        </Form>
      </div>
    </div>
  );
}
