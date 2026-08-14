import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import { createSubtask, listInterns } from "../services/mentor";
import Form from "../components/Form";
import Input from "../components/Input"; // <-- SYNTAX ERROR FIXED HERE
import Select from "../components/Select";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import MultiSelect from "../components/MultiSelect";

export default function SubtaskAssign() {
  document.title = "FCT | Assign Subtasks";
  const { projectId, taskId } = useParams();
  const nav = useNavigate();
  const [form, setForm] = useState({
    title: "",
    intern_id: "",
    work_type: "",
    labels: [],
    due_date: "",
  });
  const [interns, setInterns] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    async function fetchInterns() {
      try {
        const res = await listInterns(projectId);
        setInterns(res);
      } catch (e) {
        console.error(e);
        setErr("Failed to load interns");
      }
    }
    fetchInterns();
  }, [projectId]);

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await createSubtask({
        ...form,
        task_id: Number(taskId),
        intern_id: Number(form.intern_id),
      });
      await Swal.fire({
        title: "Subtask Assigned!",
        text: "Subtask assigned successfully!",
        icon: "success",
        confirmButtonText: "OK",
        customClass: {
          confirmButton:
            "w-[200px] sm:w-[400px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300",
        },
        buttonsStyling: false,
      });
      nav(`/mentor/projects/`);
    } catch (e) {
      await Swal.fire({
        title: "Oops!",
        text: e?.response?.data?.message || "Subtask assign failed!",
        icon: "error",
        confirmButtonText: "Try Again!",
        customClass: {
          confirmButton:
            "w-[200px] sm:w-[400px] bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300",
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
          <div className="font-semibold text-lg text-white">
            Future Code Technology - Assign Subtask
          </div>
          <span className="text-sm text-gray-400">
            Welcome back, {user?.username}
          </span>
        </div>
      </nav>
      <div className="mt-6 p-6">
        <Form
          title="Assign Subtask"
          subtitle="Give responsibility to an intern"
          onSubmit={onSubmit}
        >
          <Input
            label="Subtask Title"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
          />
          <Select
            label="Intern"
            value={form.intern_id}
            onChange={(e) => set("intern_id", e.target.value)}
          >
            <option value="" disabled>
              -- select intern --
            </option>
            {interns.map((i) => (
              <option key={i.id} value={i.id}>
                {i.username}
              </option>
            ))}
          </Select>
          <Select
            label="Work Type"
            value={form.work_type}
            onChange={(e) => set("work_type", e.target.value)}
          >
            <option value="" disabled>
              -- select work type --
            </option>
            <option value="bug">🐛 Bug</option>
            <option value="task">📝 Task</option>
            <option value="new feature">✨ New Feature</option>
          </Select>
          <MultiSelect
            label="Labels"
            placeholder="Label"
            options={[
              { value: "ui", label: "🎨 UI" },
              { value: "backend", label: "☁️ Backend" },
              { value: "urgent", label: "🔥 Urgent" },
            ]}
            selectedOptions={form.labels}
            onChange={(v) => set("labels", v)}
          />
          <Input
            label="Due Date"
            type="date"
            value={form.due_date}
            onChange={(e) => set("due_date", e.target.value)}
          _date
          />
          {err && (
            <div className="font-semibold text-red-600 text-sm">{err}</div>
          )}
          <Button
            type="submit"
            className="w-full mt-6 mb-5 bg-indigo-600 hover:bg-indigo-700"
          >
            Assign Subtask
          </Button>
        </Form>
      </div>
    </div>
  );
}