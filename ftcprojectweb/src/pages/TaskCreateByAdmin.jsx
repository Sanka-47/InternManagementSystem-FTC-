import { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import { createTask } from "../services/admin";
import Form from "../components/Form";
import Input from "../components/input";
import Textarea from "../components/Textarea";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";

export default function TaskCreate() {
  document.title = "FCT | Assign Tasks";
  const { projectId } = useParams();
  const nav = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "",
    due_date: "",
  });
  const [file, setFile] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("projects_id", String(projectId));
      fd.append("title", form.title.trim());
      if (form.description) fd.append("description", form.description.trim());
      if (form.priority) fd.append("priority", form.priority);
      if (form.due_date) fd.append("due_date", form.due_date);
      if (file) fd.append("attachment", file);

      await createTask(fd);

      const result = await Swal.fire({
        title: "Task Created!",
        text: "Task created successfully! Would you like to go to the Kanban board?",
        icon: "success",
        showCancelButton: true,
        confirmButtonText: "Go to Kanban",
        cancelButtonText: "Create Another",
        customClass: {
          confirmButton:
            "bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg mr-2 transition duration-300",
          cancelButton:
            "bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-300",
        },
        buttonsStyling: false,
      });

      if (result.isConfirmed) {
        nav(`/admin/projects/${projectId}/kanban`);
      } else {
        // Reset form for creating another task
        setForm({ title: "", description: "", priority: "", due_date: "" });
        setFile(null);
      }
    } catch (e) {
      await Swal.fire({
        title: "Oops!",
        text: e?.response?.data?.message || "Task create failed!",
        icon: "error",
        confirmButtonText: "Try Again!",
        customClass: {
          confirmButton:
            "w-[200px] sm:w-[400px] bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300",
        },
        buttonsStyling: false,
      });
    } finally {
      setBusy(false);
    }
  }

  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 w-full bg-gray-800 border-b border-gray-200 py-3 flex items-center justify-end px-6">
        <div className="flex flex-col text-right">
          <div className="font-semibold text-lg text-white">
            Future Code Technology - Create Task
          </div>
          <span className="text-sm text-gray-400">
            Welcome back, {user?.username}
          </span>
        </div>
      </nav>
      <div className="mt-6 p-6">
        <Form
          title="Create Task"
          subtitle="Attach a task to this project"
          onSubmit={onSubmit}
        >
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Priority"
              placeholder="High / Medium / Low"
              value={form.priority}
              onChange={(e) => set("priority", e.target.value)}
            />
            <Input
              type="date"
              label="Due Date"
              value={form.due_date}
              onChange={(e) => set("due_date", e.target.value)}
            />
          </div>

          {/* NEW: Attachment */}
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attachment (optional)
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          {err && (
            <div className="font-semibold text-red-600 text-sm mt-3">{err}</div>
          )}
          <Button
            type="submit"
            className="w-full mt-6 mb-5 bg-indigo-600 hover:bg-indigo-700"
            disabled={busy}
          >
            {busy ? "Saving..." : "Create Task"}
          </Button>
        </Form>
      </div>
    </div>
  );
}
