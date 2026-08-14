import { useEffect, useState } from "react";
import { Pencil, Trash2, Save, X } from "lucide-react";
import { listCohorts, updateCohort, deleteCohort } from "../services/admin";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/input";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Swal from 'sweetalert2';
import SuccessMessage from "../components/SuccessMessage";
import CheckOutCard from "../components/CheckOutCard";
import AttendanceCard from "../components/AttendanceCard";
import CheckInCard from "../components/CheckInCard";
import AttendanceTable from "../components/AttendanceTable";
import LeaveApplicationForm from "../components/LeaveApplicationForm";

export default function CohortList() {
  document.title = "FCT | Cohorts";
  const [rows, setRows] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", start_date: "", end_date: "" });
  const [err, setErr] = useState("");
  const nav = useNavigate();
  const { user } = useAuth();

  const load = async () => {
    setErr("");
    try {
      const data = await listCohorts();
      setRows(data);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load cohorts");
    }
  };

  useEffect(() => { load(); }, []);

  const startEdit = (r) => {
    setEditingId(r.id);
    setForm({
      name: r.name,
      start_date: r.start_date?.slice(0, 10) || "",
      end_date: r.end_date?.slice(0, 10) || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name: "", start_date: "", end_date: "" });
  };

  const saveEdit = async (id) => {
    try {
      await updateCohort(id, form);
      cancelEdit();
      await load();
    } catch (e) {
      await Swal.fire({
        title: 'Oops!',
        text: e?.response?.data?.message || "Cohort Updated failed!",
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
      text: 'Do you really want to delete this cohort?',
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
      await deleteCohort(id);
      await load();
      Swal.fire({
        title: 'Deleted!',
        text: 'Cohort has been deleted.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (e) {
      Swal.fire({
        title: 'Oops!',
        text: e?.response?.data?.message || 'Cohort deletion failed!S',
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
          <div className="font-semibold text-lg text-white">Future Code Technology - Available Cohorts</div>
          <span className="text-sm text-gray-400">Welcome back, {user?.username}</span>
        </div>
      </nav>
      <div className="flex justify-between items-center mb-4 p-6">
        <h1 className="text-xl font-semibold">Cohorts</h1>
        <Button className="w-[200px] px-6 bg-green-600 hover:bg-green-700" onClick={() => nav("/admin/cohorts/new")}>+ New Cohort</Button>
      </div>

      <main className="flex-1 p-6 space-y-6">
        {err && <div className="text-red-600">{err}</div>}
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-center">
                  <th className="py-2 pr-4">ID</th>
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Start Date</th>
                  <th className="py-2 pr-4">End Date</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id} className="border-t text-center">
                    <td className="py-2 pr-4">{r.id}</td>
                    <td className="py-2 pr-4 font-medium">
                      {editingId === r.id ? (
                        <Input value={form.name} onChange={(e)=>setForm(f=>({...f, name: e.target.value}))}/>
                      ) : r.name}
                    </td>
                    <td className="py-2 pr-4">
                      {editingId === r.id ? (
                        <Input type="date" value={form.start_date} onChange={(e)=>setForm(f=>({...f, start_date: e.target.value}))}/>
                      ) : (r.start_date ? new Date(r.start_date).toLocaleDateString() : "-")}
                    </td>
                    <td className="py-2 pr-4">
                      {editingId === r.id ? (
                        <Input type="date" value={form.end_date} onChange={(e)=>setForm(f=>({...f, end_date: e.target.value}))}/>
                      ) : (r.end_date ? new Date(r.end_date).toLocaleDateString() : "-")}
                    </td>
                    <td className="py-2 pr-4 space-x-2 flex justify-center">
                      {editingId === r.id ? (
                        <>
                          <button
                            onClick={() => saveEdit(r.id)}
                            className="p-2 text-green-600 hover:text-green-800"
                            title="Save"
                          >
                            <Save size={18} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-2 text-gray-500 hover:text-gray-700"
                            title="Cancel"
                          >
                            <X size={18} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(r)}
                            className="p-2 text-indigo-600 hover:text-indigo-800"
                            title="Edit"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => onDelete(r.id)}
                            className="p-2 text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td className="py-3 pr-4 text-gray-500 text-center" colSpan={5}>No cohorts yet.</td>
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
