import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import CheckInCard from "../components/CheckInCard";
import CheckOutCard from "../components/CheckOutCard";
import AttendanceCard from "../components/AttendanceCard";
import {
  checkIn,
  checkOut,
  fetchMyAttendance,
  fetchTodayAttendance,
} from "../services/intern";

// A simple placeholder for the missing SuccessMessage component
const SuccessMessage = ({ message }) => (
  <div className="p-4 text-center bg-green-100 text-green-800 rounded-lg shadow">
    {message}
  </div>
);

// Helper function to calculate worked time
const calculateWorkedTime = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return '-';

  const [inHours, inMinutes] = checkIn.split(':').map(Number);
  const [outHours, outMinutes] = checkOut.split(':').map(Number);

  const inTimeInMinutes = inHours * 60 + inMinutes;
  const outTimeInMinutes = outHours * 60 + outMinutes;

  let diffMinutes = outTimeInMinutes - inTimeInMinutes;

  if (diffMinutes < 0) {
    return '-';
  }

  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

export default function InternAttendance() {
  document.title = "FCT | Mark Attendance & Request Leaves";
  const { user } = useAuth();
  const navigate = useNavigate();

  // ui state
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  // list state
  const [rows, setRows] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);

  const now = new Date(); // Moved here

  const todayDateString = useMemo(() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const load = async () => {
    setErr(""); // Clear previous errors on reload
    try {
      const [todayData, listData] = await Promise.all([
        fetchTodayAttendance(),
        fetchMyAttendance(30),
      ]);
      setTodayAttendance(todayData);
      setRows(listData);
    } catch (err) {
      setErr(err?.response?.data?.message || "Failed to load attendance");
    }
  };

  // preload list
  useEffect(() => {
    load();
  }, []);

  const handleCheckIn = async (time) => {
    setErr("");
    setBusy(true);
    try {
      await checkIn({ time });
      await load(); // Reload data to get the latest status
      Swal.fire({
        title: "Checked In!",
        text: "You have successfully checked in.",
        icon: "success",
        confirmButtonText: "OK",
        customClass: {
          confirmButton:
            "w-[200px] sm:w-[400px] bg-indigo-600 hover:indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300",
        },
        buttonsStyling: false,
      });
    } catch (e) {
      await Swal.fire({
        title: "Oops!",
        text: e?.response?.data?.message || "Check-in failed!",
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
  };

  const handleCheckOut = async (time) => {
    setErr("");
    setBusy(true);
    try {
      await checkOut({ time });
      await load(); // Reload data to get the latest status
      Swal.fire({
        title: "Checked Out!",
        text: "You have successfully checked out.",
        icon: "success",
        confirmButtonText: "OK",
        customClass: {
          confirmButton:
            "w-[200px] sm:w-[400px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300",
        },
        buttonsStyling: false,
      });
    } catch (e) {
      await Swal.fire({
        title: "Oops!",
        text: e?.response?.data?.message || "Check-out failed!",
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
  };

  // --- Helper function to contain all rendering logic ---
  const renderAttendanceActions = () => {
    // Define the necessary variables for the logic
    const now = new Date();
    const todayDateString = now.toISOString().slice(0, 10); // Format: "YYYY-MM-DD"

    const isCheckedIn = !!todayAttendance?.check_in_time;
    const isCheckedOut = !!todayAttendance?.check_out_time;
    const isFullDayLeave =
      todayAttendance &&
      (todayAttendance.leave_type === "Casual-FullDay" ||
        todayAttendance.leave_type === "Annual");
    
    const leaveEndTime = todayAttendance?.leave_end_time
      ? new Date(`${todayDateString}T${todayAttendance.leave_end_time}`)
      : null;
   
    const isLeaveActive = leaveEndTime && now < leaveEndTime;

    const isPartialLeaveToday =
      todayAttendance &&
      (todayAttendance.leave_type === "Short" ||
        todayAttendance.leave_type === "Casual-HalfDay");

    // Scenario 1: Already checked out for today, or on a full day leave.
    if (isCheckedOut || isFullDayLeave) {
      return (
        <div className="text-center text-gray-500 p-4">
          You have already checked out for today or are on leave.
        </div>
      );
    }

    // Scenario 2: Checked in, but not yet checked out.
    if (isCheckedIn && !isCheckedOut) {
      return (
        <>
          <CheckOutCard onCheckOut={handleCheckOut} busy={busy} />
          <AttendanceCard
            reportedTime={todayAttendance.check_in_time}
            checkInTime={todayAttendance.check_in_time}
            rating={0}
            progress={0}
          />
        </>
      );
    }

    // Scenario 3: On an active partial leave.
    
    if (isPartialLeaveToday && isLeaveActive) {
      return (
        <SuccessMessage
          message={`You are on ${todayAttendance.leave_type} leave until ${todayAttendance.leave_end_time}. Check-in will be available after this time.`}
        />
      );
    }

    // Scenario 4: Default case - show check-in card.
    return <CheckInCard onCheckIn={handleCheckIn} busy={busy} />;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <nav className="sticky top-0 w-full bg-gray-800 border-b border-gray-200 py-3 flex items-center justify-end px-6 z-10">
        <div className="flex flex-col text-right">
          <div className="font-semibold text-lg text-white">
            Future Code Technology - Intern Attendance
          </div>
          <span className="text-sm text-gray-400">
            Welcome back, {user?.username}
          </span>
        </div>
      </nav>

      <main className="flex-1 p-6 space-y-6">
        {err && <div className="text-red-600 text-sm mb-3">{err}</div>}

        {/* Call the helper function to render the correct actions */}
        {renderAttendanceActions()}

        {/* Attendance List */}
        <Card title="My Attendance" subtitle="Latest 30 days">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 text-center">
                  <th className="py-2 px-2">Date</th>
                  <th className="py-2 px-2">Check-in</th>
                  <th className="py-2 px-2">Check-out</th>
                  <th className="py-2 px-2">Worked Time</th>
                  <th className="py-2 px-2">Status</th>
                  <th className="py-2 px-2">Leave Type</th>
                  <th className="py-2 px-2">Approval</th>
                  <th className="py-2 px-2">Reason</th>
                  <th className="py-2 px-2">Leave Start Time</th>
                  <th className="py-2 px-2">Leave End Time</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t text-center">
                    <td className="py-2 px-2">
                      {new Date(r.date).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-2">
                      {r.check_in_time ? (
                        new Date(
                          `${r.date.slice(0, 10)}T${r.check_in_time}`
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="py-2 px-2">
                      {r.check_out_time ? (
                        new Date(
                          `${r.date.slice(0, 10)}T${r.check_out_time}`
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="py-2 px-2">
                      {calculateWorkedTime(r.check_in_time, r.check_out_time)}
                    </td>
                    <td className="py-2 px-2">
                      {r.status ? (
                        <span
                          className={`px-2 py-0.5 rounded ${
                            r.status === "Present"
                              ? "bg-green-100 text-green-700"
                              : r.status === "Leave"
                              ? "bg-yellow-100 text-yellow-700"
                              : r.status === "Half-day"
                              ? "bg-yellow-100 text-yellow-700"
                              : r.status === "Absent"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {r.status}
                        </span>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="py-2 px-2">
                      {r.leave_type || (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="py-2 px-2">
                      {r.approval ? (
                        <span
                          className={`px-2 py-0.5 rounded ${
                            r.approval === "Approved"
                              ? "bg-green-100 text-green-700"
                              : r.approval === "Processing"
                              ? "bg-yellow-100 text-yellow-800"
                              : r.approval === "Rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {r.approval}
                        </span>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="py-2 px-2">
                      {r.reason || <span className="text-gray-400">N/A</span>}
                    </td>
                    <td className="py-2 px-2">
                      {r.leave_start_time ? (
                        new Date(
                          `${r.date.slice(0, 10)}T${r.leave_start_time}`
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="py-2 px-2">
                      {r.leave_end_time ? (
                        new Date(
                          `${r.date.slice(0, 10)}T${r.leave_end_time}`
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td
                      className="py-3 px-2 text-gray-500 text-center"
                      colSpan={10} // Corrected colSpan to match header columns
                    >
                      No attendance records found.
                    </td>
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
