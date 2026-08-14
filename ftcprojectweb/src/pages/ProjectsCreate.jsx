import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { createProject, listCohortsForMentor } from "../services/mentor";
import Form from "../components/Form";
import Input from "../components/input";
import Textarea from "../components/Textarea";
import Select from "../components/Select";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";

export default function ProjectCreate() {
  document.title = "FCT | Create Project";
  const nav = useNavigate();
  const [form, setForm] = useState({ cohorts_id:"", name:"", description:"", start_date:"", end_date:"" });
  const [cohorts, setCohorts] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    listCohortsForMentor().then(setCohorts).catch(() => setCohorts([]));
  }, []);

  function set(k,v){ setForm(f => ({ ...f, [k]:v })); }

  async function onSubmit(e) {
    e.preventDefault(); setErr("");
    try {
      await createProject({ ...form, cohorts_id: Number(form.cohorts_id) });
      await Swal.fire({
        title: 'Project Created !',
        text: 'Project created successfully!',
        icon: 'success',
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'w-[200px] sm:w-[400px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300'
        },
        buttonsStyling: false,
      });
      nav("/mentor/projects");
    } catch(e) {
      await Swal.fire({
        title: 'Oops!',
        text: e?.response?.data?.message || "Project creation failed!",
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
          <div className="font-semibold text-lg text-white">Future Code Technology - Create Project</div>
          <span className="text-sm text-gray-400">Welcome back, {user?.username}</span>
        </div>
      </nav>
      <div className="mt-6 p-6">
        <Form title="Create Project" subtitle="Assign project to a cohort" onSubmit={onSubmit}>
          <Input label="Project Name" value={form.name} onChange={e=>set("name", e.target.value)} />
          <Textarea label="Description" value={form.description} onChange={e=>set("description", e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <Input type="date" label="Start Date" value={form.start_date} onChange={e=>set("start_date", e.target.value)} />
            <Input type="date" label="End Date" value={form.end_date} onChange={e=>set("end_date", e.target.value)} />
          </div>
          <Select label="Select Cohort" value={form.cohorts_id} onChange={e=>set("cohorts_id", e.target.value)}>
            <option value="" disabled>-- choose cohort --</option>
            {cohorts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          {err && <div className="text-red-600 text-sm">{err}</div>}
          <Button type="submit" className="w-full mt-6 mb-5 bg-indigo-600 hover:bg-indigo-700">Create Project</Button>
        </Form>
      </div>
    </div>
  );
}
