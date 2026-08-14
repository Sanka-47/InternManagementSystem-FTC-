import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Card from "../components/Card";
import Button from "../components/Button";
import {
  listAllMentorDetails,
  approveMentorDetails,
  rejectMentorDetails,
} from "../services/admin";
import { Download } from "lucide-react";

const AdminMentorDetails = () => {
  document.title = "FCT | Mentor Details";
  const { user } = useAuth();

  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listAllMentorDetails();
      setMentors(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch mentor details");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (mentorId) => {
    try {
      const res = await approveMentorDetails(mentorId);
      setMentors((prev) =>
        prev.map((m) => (m.id === mentorId ? { ...m, status: "Approved" } : m))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to approve mentor details");
    }
  };

  const handleReject = async (mentorId) => {
    try {
      const res = await rejectMentorDetails(mentorId);
      setMentors((prev) =>
        prev.map((m) => (m.id === mentorId ? { ...m, status: "Rejected" } : m))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to reject mentor details");
    }
  };

  const getStaticUrl = (relativePath) => {
    const baseUrl = import.meta.env.VITE_API_URL.replace("/api", "");
    return `${baseUrl}/uploads/mentors/${relativePath}`;
  };

  const handleDownload = (fileUrl) => {
    if (!fileUrl) return;
    window.open(getStaticUrl(fileUrl), "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="sticky top-0 w-full bg-gray-800 border-b border-gray-200 py-3 flex items-center justify-end px-6">
        <div className="flex flex-col text-right">
          <div className="font-semibold text-lg text-white">
            Future Code Technology - Mentor Details
          </div>
          <span className="text-sm text-gray-400">Welcome back, {user?.username}</span>
        </div>
      </nav>

      <main className="flex-1 p-6 space-y-6">
        <Card title="All Mentor Details">
          {loading ? (
            <div className="py-3">Loading mentors...</div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : (
            <div className="overflow-x-auto">
                <div className="inline-block min-w-full">
                    <table className="min-w-full text-sm whitespace-nowrap">
                    <thead className="text-gray-500 text-center">
                        <tr>
                        <th className="py-2 pr-8">Mentor Username</th>
                        <th className="py-2 pr-8">Full Name</th>
                        <th className="py-2 pr-8">NIC</th>
                        <th className="py-2 pr-8">Email</th>
                        <th className="py-2 pr-8">Phone</th>
                        <th className="py-2 pr-8">Home Address</th>
                        <th className="py-2 pr-8">Bank Branch</th>
                        <th className="py-2 pr-8">Bank Account</th>
                        <th className="py-2 pr-8">ID Front</th>
                        <th className="py-2 pr-8">ID Back</th>
                        <th className="py-2 pr-8">Status</th>
                        <th className="py-2 pr-8">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mentors.map((mentor) => (
                        <tr key={mentor.id} className="border-t text-center">
                            <td className="py-2 pr-8">{mentor.mentor_username}</td>
                            <td className="py-2 pr-8 font-medium">{mentor.full_name}</td>
                            <td className="py-2 pr-8">{mentor.nic}</td>
                            <td className="py-2 pr-8">{mentor.email}</td>
                            <td className="py-2 pr-8">{mentor.phone}</td>
                            <td className="py-2 pr-8">{mentor.home_address}</td>
                            <td className="py-2 pr-8">{mentor.bank_branch}</td>
                            <td className="py-2 pr-8">{mentor.bank_account_number}</td>
                            <td className="py-2 pr-8">
                                {mentor.id_front_image ? (
                                    <div className="flex flex-col items-center space-y-1">
                                    <button
                                      type="button"
                                      className="p-2 rounded-md text-green-600 hover:text-green-800 hover:bg-green-50"
                                      onClick={() => handleDownload(mentor.id_front_image)}
                                    >
                                      <Download size={18}/>
                                    </button>
                                    </div>
                                ) : (
                                    <span className="text-gray-400">Not uploaded</span>
                                )}
                                </td>

                                <td className="py-2 pr-4">
                                {mentor.id_back_image ? (
                                    <div className="flex flex-col items-center space-y-1">
                                    
                                    <button
                                        type="button"
                                        className="p-2 rounded-md text-green-600 hover:text-green-800 hover:bg-green-50"
                                        onClick={() => handleDownload(mentor.id_back_image)}
                                    >
                                        <Download size={18}/>
                                    </button>
                                    </div>
                                ) : (
                                    <span className="text-gray-400">Not uploaded</span>
                                )}
                                </td>
                            <td className="py-2 pr-4">
                            <span
                                className={`px-2 py-0.5 rounded ${
                                mentor.status === "Approved"
                                    ? "bg-green-100 text-green-700"
                                    : mentor.status === "Rejected"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                            >
                                {mentor.status}
                            </span>
                            </td>
                            <td className="py-2 pr-4 space-x-2">
                            {mentor.status === "Processing" ? (
                                <>
                                <Button
                                    className="w-auto px-3 py-1 bg-green-600 hover:bg-green-700"
                                    onClick={() => handleApprove(mentor.id)}
                                >
                                    Approve
                                </Button>
                                <Button
                                    className="w-auto px-3 py-1 bg-red-600 hover:bg-red-700"
                                    onClick={() => handleReject(mentor.id)}
                                >
                                    Reject
                                </Button>
                                </>
                            ) : (
                                <span className="text-gray-400">N/A</span>
                            )}
                            </td>
                        </tr>
                        ))}
                        {mentors.length === 0 && (
                        <tr>
                            <td className="py-3 pr-4 text-gray-500 text-center" colSpan={12}>
                            No mentors found
                            </td>
                        </tr>
                        )}
                    </tbody>
                    </table>
                </div>
                </div>
          )}
        </Card>
      </main>
    </div>
  );
};

export default AdminMentorDetails;
