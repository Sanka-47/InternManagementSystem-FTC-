import { useEffect, useState } from "react";
import { Pencil, Trash2, Save, X } from "lucide-react";
import { listMentors, updateMentor, deleteMentor } from "../services/admin";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/input";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Swal from 'sweetalert2';

export default function MentorList(){
  document.title = "FCT | Mentors";
  const [rows,setRows]=useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const nav = useNavigate();
  const { user } = useAuth();

  const load = async () => {
    setErr("");
    try {
      const data = await listMentors();
      setRows(data);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load mentors");
    }
  };

  useEffect(()=>{ load(); },[]);

  const startEdit = (r) => {
    setEditingId(r.id);
    setForm({ username: r.username, email: r.email, password: "" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ username: "", email: "", password: "" });
  };

  const saveEdit = async (id) => {
    try {
      await updateMentor(id, form);
      cancelEdit();
      await load();
    } catch (e) {
      await Swal.fire({
        title: 'Oops!',
        text: e?.response?.data?.message || "Mentor Updated failed!",
        icon: 'error',
        confirmButtonText: 'Try Again!',
        customClass: {
          confirmButton: 'w-[200px] sm:w-[400px] bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300'
        },
        buttonsStyling: false,
      });   
    }
  };

  const onDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this mentor?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      customClass: {
        confirmButton: 'w-[200px] sm:w-[400px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 mb-2',
        cancelButton: 'w-[200px] sm:w-[400px] bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300'
      },
      buttonsStyling: false,
    });

    if (!result.isConfirmed) return;

    try {
      await deleteMentor(id);
      await load();
      Swal.fire({
        title: 'Deleted!',
        text: 'Mentor has been deleted.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (e) {
      Swal.fire({
        title: 'Oops!',
        text: e?.response?.data?.message || 'Mentor deletion failed!',
        icon: 'error',
        confirmButtonText: 'Try Again!',
        customClass: {
          confirmButton: 'w-[200px] sm:w-[400px] bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300'
        },
        buttonsStyling: false,
      });
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 w-full bg-gray-800 border-b border-gray-200 py-3 flex items-center justify-end px-6">
        <div className="flex flex-col text-right">
          <div className="font-semibold text-lg text-white">Future Code Technology - Available Mentors</div>
          <span className="text-sm text-gray-400">Welcome back, {user?.username}</span>
        </div>
      </nav>
      <div className="flex justify-between items-center mb-4 p-6">
        <h1 className="text-xl font-semibold">Mentors</h1>
        <Button className="w-[200px] px-6 bg-green-600 hover:bg-green-700" onClick={()=>nav("/admin/mentors/new")}>+ New Mentor</Button>
      </div>

      <main className="flex-1 p-6 space-y-6">
        {err && <div className="text-red-600">{err}</div>}
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-center">
                  <th className="py-2 pr-4">ID</th>
                  <th className="py-2 pr-4">Username</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r=>(
                  <tr key={r.id} className="border-t text-center">
                    <td className="py-2 pr-4">{r.id}</td>
                    <td className="py-2 pr-4 font-medium">
                      {editingId === r.id ? (
                        <Input value={form.username} onChange={(e)=>setForm(f=>({...f, username: e.target.value}))}/>
                      ) : r.username}
                    </td>
                    <td className="py-2 pr-4">
                      {editingId === r.id ? (
                        <Input type="email" value={form.email} onChange={(e)=>setForm(f=>({...f, email: e.target.value}))}/>
                      ) : r.email}
                    </td>
                    <td className="py-2 pr-4">
                      {editingId === r.id ? (
                        <div className="flex items-center gap-2 justify-center">
                          <Input
                            type="password"
                            placeholder="(optional) new password"
                            value={form.password}
                            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                            className="w-48 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          <button
                            onClick={() => saveEdit(r.id)}
                            className="p-2 rounded-md text-green-600 hover:text-green-800 hover:bg-green-50"
                            title="Save"
                          >
                            <Save size={18} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                            title="Cancel"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => startEdit(r)}
                            className="p-2 rounded-md text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                            title="Edit"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => onDelete(r.id)}
                            className="p-2 rounded-md text-red-600 hover:text-red-800 hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td className="py-3 pr-4 text-gray-500 text-center" colSpan={4}>No mentors yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
}
