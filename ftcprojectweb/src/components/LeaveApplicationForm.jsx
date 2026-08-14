import React, { useState, forwardRef, useEffect } from "react";
import emailjs from "@emailjs/browser";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./LeaveApplicationForm.css";

import { submitLeaveRequest, getCohorts, getInternsByCohort, fetchMyAttendance } from "../services/intern.js";
import { submitLeaveRequestMentor, fetchMyAttendanceMentor } from "../services/mentor.js";
import { useAuth } from "../context/AuthContext.jsx";
import MultiSelect from "./MultiSelect.jsx";

// --- ICON COMPONENTS (Replaced react-icons) ---
const FaRegCalendarAlt = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const FaRegClock = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

// --- CUSTOM INPUT COMPONENTS ---
const CustomDatePickerInput = forwardRef(
  ({ value, onClick, placeholder }, ref) => (
    <div
      className="bg-slate-700 rounded-xl px-4 py-2 border border-slate-600 text-white w-full flex items-center justify-between cursor-pointer"
      onClick={onClick}
      ref={ref}
    >
      <span className={value ? "text-white" : "text-white/40"}>
        {value || placeholder}
      </span>
      <FaRegCalendarAlt className="text-white/60" />
    </div>
  )
);

const CustomTimePickerInput = forwardRef(
  ({ value, onClick, placeholder }, ref) => (
    <div
      className="bg-slate-700 rounded-xl px-4 py-2 border border-slate-600 text-white w-full flex items-center justify-between cursor-pointer"
      onClick={onClick}
      ref={ref}
    >
      <span className={value ? "text-white" : "text-white/40"}>
        {value || placeholder}
      </span>
      <FaRegClock className="text-white/60" />
    </div>
  )
);

// --- MAIN COMPONENT ---
const LeaveApplicationForm = ({ userType }) => {
  const { user } = useAuth();
  // --- STATE MANAGEMENT ---
  const [leaveType, setLeaveType] = useState("Casual");
  const [leaveDuration, setLeaveDuration] = useState("Full Day");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [reason, setReason] = useState("");
  const [cohorts, setCohorts] = useState([]);
  const [interns, setInterns] = useState([]);
  const [selectedCohort, setSelectedCohort] = useState("");
  const [selectedInterns, setSelectedInterns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Sample data for demonstration
  const leaveTypes = [
    { name: "Short Leave", isAllocated: true },
    { name: "Casual", isAllocated: true },
    { name: "Annual", isAllocated: true },
    { name: "Unpaid", isAllocated: false },
  ];

  useEffect(() => {
    if (userType === 'intern') {
      const fetchCohorts = async () => {
        try {
          const response = await getCohorts();
          setCohorts(response);
        } catch (error) {
          console.error("Failed to fetch cohorts:", error);
        }
      };
      fetchCohorts();
    }
  }, [userType]);

  useEffect(() => {
    if (userType === 'intern' && selectedCohort) {
      const fetchInterns = async () => {
        try {
          const response = await getInternsByCohort(selectedCohort);
          setInterns(response);
        } catch (error) {
          console.error("Failed to fetch interns:", error);
        }
      };
      fetchInterns();
    } else {
      setInterns([]);
    }
  }, [userType, selectedCohort]);

  // --- EVENT HANDLERS ---
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    // --- Form Validation ---
    if (!leaveType || !reason || !startDate) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    if (
      (leaveType === "Short Leave" ||
        (leaveType === "Casual" && leaveDuration === "Half Day")) &&
      (!startTime || !endTime)
    ) {
      setError("Please select start and end times for your leave.");
      setLoading(false);
      return;
    }

    if ((leaveType === "Annual" || leaveType === "Unpaid") && !endDate) {
      setError("Please select an end date for your leave range.");
      setLoading(false);
      return;
    }

    if (endDate && startDate && new Date(endDate) < new Date(startDate)) {
      setError("End date cannot be before the start date.");
      setLoading(false);
      return;
    }

    // --- Leave Conflict Validation ---
    const fetchAttendance = userType === 'intern' ? fetchMyAttendance : fetchMyAttendanceMentor;
    const existingAttendance = await fetchAttendance();
    const newLeaveStartDate = new Date(startDate);
    const newLeaveEndDate = new Date(endDate || startDate); // Use endDate or startDate if endDate is null

    for (let d = newLeaveStartDate; d <= newLeaveEndDate; d.setDate(d.getDate() + 1)) {
      const dateString = formatDate(d); // Reuse the formatDate helper

      const conflictingRecord = existingAttendance.find(record =>
        formatDate(new Date(record.date)) === dateString && record.status === "Leave"
      );

      if (conflictingRecord) {
        setError(`You already have a leave request for ${dateString}. Please cancel the existing leave or choose different dates.`);
        setLoading(false);
        return;
      }
    }

    // --- Payload Preparation (values from state are already strings) ---
    console.log("Selected Cohort:", selectedCohort);
    console.log("Selected Interns:", selectedInterns);

    let finalLeaveType = "";
    const finalLeaveStatus = "Leave"; // Always "Leave" as per requirement

    if (leaveType === "Short Leave") {
      finalLeaveType = "Short";
    } else if (leaveType === "Casual") {
      if (leaveDuration === "Full Day") {
        finalLeaveType = "Casual-FullDay";
      } else if (leaveDuration === "Half Day") {
        finalLeaveType = "Casual-HalfDay";
      }
    } else if (leaveType === "Annual") {
      finalLeaveType = "Annual";
    } else {
      // Default for other types like "Unpaid"
      finalLeaveType = leaveType;
    }

    const payload = {
      leave_type: finalLeaveType,
      status: finalLeaveStatus,
      reason,
      startDate: formatDate(startDate),
      endDate: formatDate(endDate || startDate),
      startTime: startTime
        ? new Date(startTime).toLocaleTimeString("en-US", { hour12: false })
        : null,
      endTime: endTime
        ? new Date(endTime).toLocaleTimeString("en-US", { hour12: false })
        : null,
    };

    // --- API Call ---
    try {
      if (userType === 'intern') {
        await submitLeaveRequest(payload);
      } else {
        await submitLeaveRequestMentor(payload);
      }

      if (selectedInterns.length > 0) {
        console.log("Selected interns found, preparing to send emails.");
        console.log(
          "EmailJS Service ID:",
          import.meta.env.VITE_APP_EMAILJS_SERVICE_ID
        );
        console.log(
          "EmailJS Template ID:",
          import.meta.env.VITE_APP_EMAILJS_TEMPLATE_ID
        );
        console.log(
          "EmailJS Public Key:",
          import.meta.env.VITE_APP_EMAILJS_PUBLIC_KEY
        );

        const time = new Date().toLocaleString();

        for (const internId of selectedInterns) {
          console.log(`Processing intern with ID: ${internId}`);
          const intern = interns.find((i) => i.id === parseInt(internId));
          console.log("Found intern:", intern);

          if (intern) {
            const message = generateMessage(
              leaveType,
              startDate,
              endDate,
              startTime,
              endTime,
              user.username,
              user.cohort_name
            );
            const templateParams = {
              name: intern.username,
              time: time,
              title: "Employee Leave Notice",
              email: intern.email,
              message: message,
            };
            console.log("Template Params:", templateParams);

            try {
              const response = await emailjs.send(
                import.meta.env.VITE_APP_EMAILJS_SERVICE_ID,
                import.meta.env.VITE_APP_EMAILJS_TEMPLATE_ID,
                templateParams,
                import.meta.env.VITE_APP_EMAILJS_PUBLIC_KEY
              );
              console.log("SUCCESS!", response.status, response.text);
            } catch (err) {
              console.log("FAILED...", err);
            }
          }
        }
      }

      setSuccess("Leave request submitted successfully!");
      // Clear form on success
      setStartDate(null);
      setEndDate(null);
      setStartTime(null);
      setEndTime(null);
      setReason("");
      setSelectedCohort("");
      setSelectedInterns([]);
    } catch (err) {
      console.error("Leave request error:", err);
      setError(
        err.response?.data?.message || "Failed to submit leave request."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveTypeChange = (typeName) => {
    setLeaveType(typeName);
    // Reset fields to avoid invalid states
    setStartDate(null);
    setEndDate(null);
    setStartTime(null);
    setEndTime(null);
    setError(null);
    setSuccess(null);
  };

  const generateMessage = (
    leaveType,
    startDate,
    endDate,
    startTime,
    endTime,
    internName,
    cohortName
  ) => {
    const formatDate = (date) => new Date(date).toLocaleDateString();
    const formatTime = (time) =>
      new Date(time).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

    switch (leaveType) {
      case "Annual":
        return `This is to inform you that ${internName} in team ${cohortName} will be on annual leave from ${formatDate(
          startDate
        )} to ${formatDate(endDate)}.`;
      case "Short Leave":
        return `This is to inform you that ${internName} in team ${cohortName} will be on a short leave on ${formatDate(
          startDate
        )} from ${formatTime(startTime)} to ${formatTime(endTime)}.`;
      case "Casual":
        if (leaveDuration === "Half Day") {
          return `This is to inform you that ${internName} in team ${cohortName} will be on a half-day leave on ${formatDate(
            startDate
          )} from ${formatTime(startTime)} to ${formatTime(endTime)}.`;
        }
        return `This is to inform you that ${internName} in team ${cohortName} will be on leave on ${formatDate(
          startDate
        )}.`;
      default:
        return `This is to inform you that ${internName} in team ${cohortName} will be on leave.`;
    }
  };

  const renderDateInputs = () => {
    switch (leaveType) {
      case "Short Leave":
        return (
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-col flex-1 min-w-[200px]">
              <label htmlFor="date" className="text-white/60 mb-2">
                Date
              </label>
              <DatePicker
                selected={startDate}
                onChange={setStartDate}
                dateFormat="dd/MM/yyyy"
                customInput={
                  <CustomDatePickerInput placeholder="Select date" />
                }
              />
            </div>
            <div className="flex flex-col flex-1 min-w-[150px]">
              <label htmlFor="from" className="text-white/60 mb-2">
                From
              </label>
              <DatePicker
                selected={startTime}
                onChange={setStartTime}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="Time"
                dateFormat="h:mm aa"
                calendarClassName="short-leave-time-picker"
                customInput={
                  <CustomTimePickerInput placeholder="Select time" />
                }
              />
            </div>
            <div className="flex flex-col flex-1 min-w-[150px]">
              <label htmlFor="to" className="text-white/60 mb-2">
                To
              </label>
              <DatePicker
                selected={endTime}
                onChange={setEndTime}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="Time"
                dateFormat="h:mm aa"
                calendarClassName="short-leave-time-picker"
                customInput={
                  <CustomTimePickerInput placeholder="Select time" />
                }
              />
            </div>
          </div>
        );
      case "Casual":
        return (
          <div className="flex flex-col md:flex-row items-end gap-4">
            <div className="flex-1 w-full">
              <label htmlFor="dateRange" className="text-white/60 mb-2 block">
                Date
              </label>
              <DatePicker
                selected={startDate}
                onChange={(date) => {
                  setStartDate(date);
                  setEndDate(date);
                }}
                dateFormat="dd/MM/yyyy"
                customInput={
                  <CustomDatePickerInput placeholder="Select date" />
                }
              />
            </div>
            {leaveDuration === "Half Day" && (
              <>
                <div className="flex flex-col flex-1 min-w-[150px]">
                  <label htmlFor="from" className="text-white/60 mb-2">
                    From
                  </label>
                  <DatePicker
                    selected={startTime}
                    onChange={setStartTime}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="h:mm aa"
                    customInput={
                      <CustomTimePickerInput placeholder="Select time" />
                    }
                  />
                </div>
                <div className="flex flex-col flex-1 min-w-[150px]">
                  <label htmlFor="to" className="text-white/60 mb-2">
                    To
                  </label>
                  <DatePicker
                    selected={endTime}
                    onChange={setEndTime}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="h:mm aa"
                    customInput={
                      <CustomTimePickerInput placeholder="Select time" />
                    }
                  />
                </div>
              </>
            )}
          </div>
        );
      case "Annual":
      case "Unpaid":
        const days =
          startDate && endDate
            ? Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
            : 0;
        return (
          <div className="flex flex-col md:flex-row items-end gap-4">
            <div className="flex-1 w-full">
              <label htmlFor="dateRange" className="text-white/60 mb-2 block">
                Date Range
              </label>
              <DatePicker
                selected={startDate}
                onChange={([start, end]) => {
                  setStartDate(start);
                  setEndDate(end);
                }}
                startDate={startDate}
                endDate={endDate}
                selectsRange
                dateFormat="dd/MM/yyyy"
                customInput={
                  <CustomDatePickerInput placeholder="Start date → End date" />
                }
              />
            </div>
            <div className="flex-shrink-0 text-white/60">
              <span className="text-lg">No of Days: </span>
              <span className="text-white text-xl font-bold">{days}</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // --- JSX RENDER ---
  return (
    <div className="bg-[#1f2937] rounded-2xl p-6 shadow-lg w-full max-w-2xl mx-auto font-sans text-white">
      <h1 className="text-2xl font-bold mb-6 text-white/90">
        Leave Application
      </h1>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        {leaveTypes.map((type) => (
          <button
            key={type.name}
            onClick={() => handleLeaveTypeChange(type.name)}
            className={`relative py-2 px-4 rounded-full text-sm font-semibold transition-all duration-200 ${
              leaveType === type.name
                ? "text-[#3b82f6] border border-blue-500"
                : "text-white/60 border border-transparent"
            } ${
              !type.isAllocated
                ? "bg-gray-500/20 text-white/50 cursor-not-allowed"
                : "hover:text-white hover:border-white/50"
            }`}
            disabled={!type.isAllocated}
          >
            {type.name}
            {/* {type.count !== null && (
              <span
                className={`absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 inline-flex items-center justify-center h-5 w-5 rounded-full text-xs font-bold ${
                  !type.isAllocated ? "bg-gray-400" : "bg-[#48b040]"
                }`}
              >
                {type.count}
              </span>
            )} */}
          </button>
        ))}
      </div>

      {leaveType === "Casual" && (
        <div className="flex gap-4 mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="leaveDuration"
              value="Full Day"
              checked={leaveDuration === "Full Day"}
              onChange={(e) => {
                setLeaveDuration(e.target.value);
                setStartTime(null);
                setEndTime(null);
              }}
              className="form-radio h-4 w-4 text-blue-500 focus:ring-blue-500 bg-transparent border-white/50"
            />
            <span>Full Day</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="leaveDuration"
              value="Half Day"
              checked={leaveDuration === "Half Day"}
              onChange={(e) => {
                setLeaveDuration(e.target.value);
                setStartTime(null);
                setEndTime(null);
              }}
              className="form-radio h-4 w-4 text-blue-500 focus:ring-blue-500 bg-transparent border-white/50"
            />
            <span>Half Day</span>
          </label>
        </div>
      )}

      <div className="space-y-6">
        {renderDateInputs()}

        <div>
          <label htmlFor="reason" className="text-white/60 mb-2 block">
            Reason
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows="4"
            className="bg-slate-700 rounded-xl p-4 border border-slate-600 text-white w-full outline-none resize-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your reason here..."
          ></textarea>
        </div>

        {userType === 'intern' && (
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="notifyTeams" className="text-white/60 mb-2 block">
                Notify Teams
              </label>
              <select
                id="notifyTeams"
                value={selectedCohort}
                onChange={(e) => setSelectedCohort(e.target.value)}
                className="bg-slate-700 rounded-xl px-4 py-2 border border-slate-600 text-white w-full outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a cohort</option>
                {cohorts.map((cohort) => (
                  <option key={cohort.id} value={cohort.id}>
                    {cohort.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="notifyPeople" className="text-white/60 mb-2 block">
                Notify People
              </label>
              <MultiSelect
                options={interns.map((intern) => ({
                  value: intern.id,
                  label: intern.username,
                }))}
                selectedOptions={selectedInterns}
                onChange={setSelectedInterns}
                placeholder="Select Notifying People"
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#3b82f6] text-white py-3 px-8 rounded-full font-semibold flex items-center gap-2 transition-all duration-200 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Apply Leave"}{" "}
            <span className="text-lg">&gt;</span>
          </button>

          {error && <p className="text-red-600 text-sm font-medium">{error}</p>}
          {success && (
            <p className="text-green-600 text-sm font-medium">{success}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveApplicationForm;
