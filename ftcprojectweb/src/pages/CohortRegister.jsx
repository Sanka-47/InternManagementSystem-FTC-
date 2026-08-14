import { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { createCohort } from "../services/admin";
import Form from "../components/Form";
import Input from "../components/input";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";

export default function CohortRegister() {
  document.title = "FCT | Cohorts Registration";
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault(); setErr("");
    try {
      await createCohort({ name, start_date: start, end_date: end });
      await Swal.fire({
        title: 'Cohort Created!',
        text: 'Cohort Created Successfully!',
        icon: 'success',
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'w-[200px] sm:w-[400px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300'
        },
        buttonsStyling: false,
      });
      nav("/admin/cohorts"); 
    } catch (e) {
      await Swal.fire({
        title: 'Oops!',
        text: e?.response?.data?.message || "Cohort Create failed!",
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
          <div className="font-semibold text-lg text-white">Future Code Technology - Create Cohorts</div>
          <span className="text-sm text-gray-400">Welcome back, {user?.username}</span>
        </div>
      </nav>
      <div className="mt-6 p-6">
        <Form title="Create Cohort" subtitle="Create to response for all the projects" onSubmit={onSubmit}>
          <Input label="Name" value={name} placeholder="Enter cohort name" onChange={e=>setName(e.target.value)} />
          <Input label="Start Date" type="date" value={start} placeholder="Enter start date" onChange={e=>setStart(e.target.value)} />
          <Input label="End Date" type="date" value={end} placeholder="Enter end date" onChange={e=>setEnd(e.target.value)} />
          {err && <div className="font-semibold text-red-600 text-sm mb-3">{err}</div>}
          <Button type="submit" className="w-full mt-6 mb-5 bg-indigo-600 hover:bg-indigo-700">Create Cohort</Button>
        </Form>
      </div>
    </div>
  );
}
