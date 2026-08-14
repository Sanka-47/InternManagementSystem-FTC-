import { useEffect, useState } from "react";
import { Download, Trash2 } from "lucide-react";
import Card from "../components/Card";
import { listCandidates, downloadCandidateCV, deleteCandidate } from "../services/admin";
import { useAuth } from "../context/AuthContext";
import Swal from 'sweetalert2';

export default function AdminCandidates() {
  document.title = "FCT | Candidates";
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState(null);
  const { user } = useAuth();

  const load = async () => {
    try {
      setErr("");
      const data = await listCandidates();
      setRows(data);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load candidates");
    }
  };

  useEffect(() => { load(); }, []);

  const onDownload = async (id, name, original) => {
    try {
      setBusyId(id);
      const blob = await downloadCandidateCV(id);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const a = document.createElement("a");
      a.href = url;
      const safeName = (original || "cv").replace(/[^\w.\-]+/g, "_");
      a.download = `${name || "candidate"}_${safeName}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setBusyId(null);
    }
  };

  const onDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this candidate?',
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
      setBusyId(id);
      await deleteCandidate(id);
      setRows((rs) => rs.filter(r => r.id !== id));
      Swal.fire({
        title: 'Deleted!',
        text: 'Candidate has been deleted!',
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
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="sticky top-0 w-full bg-gray-800 border-b border-gray-200 py-3 flex items-center justify-end px-6">
        <div className="flex flex-col text-right">
          <div className="font-semibold text-lg text-white">Future Code Technology - Candidates</div>
          <span className="text-sm text-gray-400">Welcome back, {user?.username}</span>
        </div>
      </nav>

      <div className="p-6 space-y-6">
        <Card title="Career Applications" subtitle="Submitted CVs and contact details">
            {err && <div className="text-red-600 mb-3">{err}</div>}
            <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
                <thead>
                <tr className="text-left text-gray-500 text-center">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2 pr-4">Phone</th>
                    <th className="py-2 pr-4">CV</th>
                    <th className="py-2 pr-4">Submitted On</th>
                    <th className="py-2 pr-4">Actions</th>
                </tr>
                </thead>
                <tbody>
                {rows.map((r) => (
                    <tr key={r.id} className="border-t text-center">
                    <td className="py-2 pr-4 font-medium">{r.name}</td>
                    <td className="py-2 pr-4">{r.email}</td>
                    <td className="py-2 pr-4">{r.phone}</td>
                    <td className="py-2 pr-4">{r.cv_original_name} <span className="text-xs text-gray-400">({Math.round((r.cv_size || 0)/1024)} KB)</span></td>
                    <td className="py-2 pr-4">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="py-2 pr-4">
                        <div className="flex items-center gap-3 justify-center">
                            <button
                                type="button"
                                className="p-2 rounded-md text-green-600 hover:text-green-800 hover:bg-green-50"
                                onClick={() => onDownload(r.id, r.name, r.cv_original_name)}
                                disabled={busyId === r.id}
                            >
                                <Download size={18}/>
                            </button>
                            <button
                                type="button"
                                className="p-2 rounded-md text-red-600 hover:text-red-800 hover:bg-red-50"
                                onClick={() => onDelete(r.id)}
                                disabled={busyId === r.id}
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </td>
                    </tr>
                ))}
                {rows.length === 0 && (
                    <tr>
                        <td colSpan={6} className="py-6 text-center text-gray-500">No applications yet.</td>
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
