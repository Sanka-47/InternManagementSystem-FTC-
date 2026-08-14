import { useEffect, useState, useMemo } from "react";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext";
import Card from "../components/Card";
import Button from "../components/Button";
import CheckInCard from "../components/CheckInCard";
import CheckOutCard from "../components/CheckOutCard";
import AttendanceCard from "../components/AttendanceCard";
import SuccessMessage from "../components/SuccessMessage";
import {
  listAllAttendance,
  approveLeave,
  rejectLeave,
  checkInMentor,
  checkOutMentor,
  fetchTodayAttendanceMentor,
  fetchMyAttendanceMentor,
} from "../services/mentor";

// Helper function to calculate worked time
const calculateWorkedTime = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return "-";

  const [inHours, inMinutes] = checkIn.split(":").map(Number);
  const [outHours, outMinutes] = checkOut.split(":").map(Number);

  const inTimeInMinutes = inHours * 60 + inMinutes;
  const outTimeInMinutes = outHours * 60 + outMinutes;

  let diffMinutes = outTimeInMinutes - inTimeInMinutes;

  if (diffMinutes < 0) {
    return "-"; // Handles overnight cases simply, can be improved if needed
  }

  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}`;
};

export default function MentorAttendance() {
  document.title = "FCT | Mentor Attendance";
  const { user } = useAuth();

  // ui state
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  // list state
  const [rows, setRows] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [mentorHistory, setMentorHistory] = useState([]);

  const now = new Date();

  const todayDateString = useMemo(() => {
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, [now]);

  const load = async () => {
    setErr(""); // Clear previous errors on reload
    try {
      const [todayData, listData, mentorData] = await Promise.all([
        fetchTodayAttendanceMentor(),
        listAllAttendance(30), // Corrected: Fetches all intern attendance
        fetchMyAttendanceMentor(30), // Fetch mentor's own history
      ]);
      setTodayAttendance(todayData);
      setRows(listData);
      setMentorHistory(mentorData); // Set mentor's history
    } catch (err) {
      setErr(err?.response?.data?.message || "Failed to load attendance");
    }
  };

  // preload list
  useEffect(() => {
    load();
  }, []);

  // --- ADDED: Handler functions for approving/rejecting leave ---
  const handleApprove = async (id) => {
    setBusy(true);
    try {
      await approveLeave(id);
      await load(); // Refresh the list
      Swal.fire("Approved!", "The leave request has been approved.", "success");
    } catch (e) {
      Swal.fire(
        "Error!",
        e?.response?.data?.message || "Failed to approve leave.",
        "error"
      );
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async (id) => {
    setBusy(true);
    try {
      await rejectLeave(id);
      await load(); // Refresh the list
      Swal.fire("Rejected!", "The leave request has been rejected.", "success");
    } catch (e) {
      Swal.fire(
        "Error!",
        e?.response?.data?.message || "Failed to reject leave.",
        "error"
      );
    } finally {
      setBusy(false);
    }
  };

  const handleCheckIn = async (time) => {
    setErr("");
    setBusy(true);
    try {
      await checkInMentor({ time });
      await load(); // Reload data to get the latest status
      Swal.fire({
        title: "Checked In!",
        text: "You have successfully checked in.",
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
      await checkOutMentor({ time });
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

  // --- Helper function to contain all rendering logic for mentor's actions ---
  const renderAttendanceActions = () => {
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

    const isShortOrHalfDayLeaveToday =
      todayAttendance &&
      (todayAttendance.leave_type === "Short" ||
        todayAttendance.leave_type === "Casual-HalfDay");

    if (isCheckedOut || isFullDayLeave) {
      return (
        <div className="text-center text-gray-500 p-4">
          You have already checked out for today or are on leave.
        </div>
      );
    }

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

    if (isShortOrHalfDayLeaveToday && isLeaveActive) {
      return (
        <SuccessMessage
          message={`You are on ${todayAttendance.leave_type} leave until ${todayAttendance.leave_end_time}. Check-in will be available after this time.`}
        />
      );
    }

    return <CheckInCard onCheckIn={handleCheckIn} busy={busy} />;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="sticky top-0 w-full bg-gray-800 border-b border-gray-200 py-3 flex items-center justify-end px-6 z-10">
        <div className="flex flex-col text-right">
          <div className="font-semibold text-lg text-white">
            Future Code Technology - Mentor Attendance
          </div>
          <span className="text-sm text-gray-400">
            Welcome back, {user?.username}
          </span>
        </div>
      </nav>

      <main className="flex-1 p-6 space-y-6">
        {err && <div className="text-red-600 text-sm mb-3">{err}</div>}

        {renderAttendanceActions()}

        <Card title="My Attendance" subtitle="Your recent attendance history">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 text-center">
                  <th className="py-2 pr-4">Date</th>

                  <th className="py-2 pr-4">Check-in</th>
                  <th className="py-2 pr-4">Check-out</th>
                  <th className="py-2 pr-4">Worked Time</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Leave Type</th>
                  <th className="py-2 pr-4">Approval</th>
                  {/* <th className="py-2 pr-4">Action</th> */}
                </tr>
              </thead>
              <tbody>
                {mentorHistory.map((r) => (
                  <tr key={r.id} className="border-t text-center">
                    <td className="py-2 pr-4">
                      {new Date(r.date).toLocaleDateString()}
                    </td>

                    <td className="py-2 pr-4">
                      {r.check_in_time || (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="py-2 pr-4">
                      {r.check_out_time || (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="py-2 pr-4">
                      {calculateWorkedTime(r.check_in_time, r.check_out_time)}
                    </td>
                    <td className="py-2 pr-4">
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
                    <td className="py-2 pr-4">
                      {r.leave_type || (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="py-2 pr-4">
                      {r.approval ? (
                        <span
                          className={`px-2 py-0.5 rounded ${
                            r.approval === "Approved"
                              ? "bg-green-100 text-green-700"
                              : r.approval === "Processing"
                              ? "bg-yellow-100 text-yellow-700"
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
                    {/* <td className="py-2 pr-4 space-x-2">
                      <span className="text-gray-400">N/A</span>
                    </td> */}
                  </tr>
                ))}
                {mentorHistory.length === 0 && (
                  <tr>
                    <td
                      className="py-3 pr-4 text-gray-500 text-center"
                      colSpan={9}
                    >
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Intern Attendance" subtitle="Latest 30 days">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 text-center">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Intern</th>
                  <th className="py-2 pr-4">Cohort</th>
                  <th className="py-2 pr-4">Check-in</th>
                  <th className="py-2 pr-4">Check-out</th>
                  <th className="py-2 pr-4">Worked Time</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Leave Type</th>
                  <th className="py-2 pr-4">Approval</th>
                  {/* <th className="py-2 pr-4">Action</th> */}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t text-center">
                    <td className="py-2 pr-4">
                      {new Date(r.date).toLocaleDateString()}
                    </td>
                    <td className="py-2 pr-4">{r.intern_username}</td>
                    <td className="py-2 pr-4">
                      {r.cohort_name || (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="py-2 pr-4">
                      {r.check_in_time || (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="py-2 pr-4">
                      {r.check_out_time || (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="py-2 pr-4">
                      {calculateWorkedTime(r.check_in_time, r.check_out_time)}
                    </td>
                    <td className="py-2 pr-4">
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
                    <td className="py-2 pr-4">
                      {r.leave_type || (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="py-2 pr-4">
                      {r.approval ? (
                        <span
                          className={`px-2 py-0.5 rounded ${
                            r.approval === "Approved"
                              ? "bg-green-100 text-green-700"
                              : r.approval === "Processing"
                              ? "bg-yellow-100 text-yellow-700"
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
                    {/* <td className="py-2 pr-4 space-x-2">
                      {r.status === "Leave" && r.approval === "Processing" ? (
                        <>
                          <Button
                            className="w-auto px-3 py-1 bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprove(r.id)}
                            disabled={busy}
                          >
                            Approve
                          </Button>
                          <Button
                            className="w-auto px-3 py-1 bg-red-600 hover:bg-red-700"
                            onClick={() => handleReject(r.id)}
                            disabled={busy}
                          >
                            Reject
                          </Button>
                        </>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td> */}
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td
                      className="py-3 pr-4 text-gray-500 text-center"
                      colSpan={10}
                    >
                      No records found
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
