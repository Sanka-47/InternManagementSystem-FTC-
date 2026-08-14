import { useEffect, useState } from "react";
import Card from "../components/Card";
import { listAppointments, deleteAppointment } from "../services/admin";
import { Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext";

export default function AdminAppointments() {
  document.title = "IMS | Admin · Appointments";
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const { user } = useAuth();

  async function load() {
    try {
      setErr("");
      const data = await listAppointments();
      setRows(data);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load appointments");
    }
  }

  useEffect(() => { load(); }, []);

  const onDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this Appointment?',
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
      await deleteAppointment(id);
      setRows((r) => r.filter((x) => x.id !== id));
      Swal.fire({
        title: 'Deleted!',
        text: 'Appointment has been deleted!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (e) {
      Swal.fire({
        title: 'Error!',
        text: e?.response?.data?.message || 'Delete failed!',
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
      {/* Navbar */}
      <nav className="sticky top-0 w-full bg-gray-800 border-b border-gray-200 py-3 flex items-center justify-end px-6">
        <div className="flex flex-col text-right">
          <div className="font-semibold text-lg text-white">Future Code Technology - Appointments</div>
          <span className="text-sm text-gray-400">Welcome back, {user?.username}</span>
        </div>
      </nav>
      
      <div className="p-6 space-y-6">
        <Card title="Appointments" subtitle="Requested Appointments">
            {err && <div className="text-red-600 mb-3">{err}</div>}
            <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
                <thead>
                <tr className="text-left text-gray-500 text-center">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2 pr-4">Message</th>
                    <th className="py-2 pr-4">Submitted On</th>
                    <th className="py-2 pr-4">Actions</th>
                </tr>
                </thead>
                <tbody>
                {rows.map((r) => (
                    <tr key={r.id} className="border-t text-center">
                    <td className="py-2 pr-4 font-medium">{r.name}</td>
                    <td className="py-2 pr-4">{r.email}</td>
                    <td className="py-2 pr-4 max-w-[420px] whitespace-pre-wrap break-words">{r.message}</td>
                    <td className="py-2 pr-4">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="py-2 pr-4">
                        <button
                            type="button"
                            className="p-2 rounded-md text-red-600 hover:text-red-800 hover:bg-red-50"
                            onClick={() => onDelete(r.id)}
                            >
                            <Trash2 size={18} />
                        </button>
                    </td>
                    </tr>
                ))}
                {rows.length === 0 && (
                    <tr>
                    <td className="py-4 text-gray-500 text-center" colSpan={5}>No appointments yet.</td>
                    </tr>
                )}
                </tbody>
            </table>
            </div>
        </Card>
      </div>
    </div>
  );
}
