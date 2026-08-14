import { useEffect, useState, useMemo } from "react";
import { getAttendance } from "../services/admin";
import AttendanceTable from "../components/AttendanceTable";
import Select from "../components/Select";
import Input from "../components/input";
import AttendanceCard from "../components/AttendanceCard";
import CheckInCard from "../components/CheckInCard";
import CheckOutCard from "../components/CheckOutCard";
import LeaveApplicationForm from "../components/LeaveApplicationForm";
import SuccessMessage from "../components/SuccessMessage";
import { useAuth } from "../context/AuthContext";

export default function AdminAttendance() {
  document.title = "FCT | Admin Attendance";
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const data = await getAttendance();
        setAttendance(data);
        console.log("data1", data);
      } catch (err) {
        setError("Failed to fetch attendance");
      }
      setLoading(false);
    };
    fetchAttendance();
  }, []);

  const users = useMemo(() => {
    const userSet = new Set(attendance.map((item) => item.name));
    return ["", ...Array.from(userSet)];
  }, [attendance]);

  const filteredAttendance = useMemo(() => {
    let filtered = attendance;

    if (selectedUser) {
      filtered = filtered.filter((item) => item.name === selectedUser);
    }

    if (startDate) {
      filtered = filtered.filter(
        (item) => new Date(item.date) >= new Date(startDate)
      );
    }

    if (endDate) {
      filtered = filtered.filter(
        (item) => new Date(item.date) <= new Date(endDate)
      );
    }

    return filtered;
  }, [attendance, selectedUser, startDate, endDate]);

  const handleClearFilters = () => {
    setSelectedUser("");
    setStartDate("");
    setEndDate("");
  };

  const handleUpdateAttendance = (id, newApprovalStatus) => {
    setAttendance((prevAttendance) =>
      prevAttendance.map((record) =>
        record.id === id ? { ...record, approval: newApprovalStatus } : record
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="sticky top-0 w-full bg-gray-800 border-b border-gray-200 py-3 flex items-center justify-end px-6">
        <div className="flex flex-col text-right">
          <div className="font-semibold text-lg text-white">
            Future Code Technology - Available Cohorts
          </div>
          <span className="text-sm text-gray-400">
            Welcome back, {user?.username}
          </span>
        </div>
      </nav>
      <main className="flex-1 p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Attendance</h1>
          <div className="flex items-center space-x-4">
            <div className="w-64">
              <Select
                label="Filter by Intern/Mentor"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                {users.map((user) => (
                  <option key={user} value={user}>
                    {user || "All Interns/Mentor"}
                  </option>
                ))}
              </Select>
            </div>
            <div className="w-40">
              <Input
                type="date"
                label="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="w-40">
              <Input
                type="date"
                label="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 mt-4 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Clear All
            </button>
          </div>
        </div>
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {!loading && !error && (
          <div>
            <AttendanceTable
              attendance={filteredAttendance}
              onUpdateAttendance={handleUpdateAttendance}
            />
            {/* ... other components */}
          </div>
        )}
      </main>
    </div>
  );
}
