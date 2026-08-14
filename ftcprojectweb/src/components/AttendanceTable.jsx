import React, { useState } from 'react';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import "react-datepicker/dist/react-datepicker.css";
import "./AttendanceTable.css";
import { approveLeave, rejectLeave } from "../services/admin";

// Assuming a basic Card component structure for styling purposes
const Card = ({ children }) => (
  <div className="bg-white rounded-2xl p-4 shadow-lg w-full mx-auto font-sans flex flex-col gap-4 text-gray-800">
    {children}
  </div>
);

// Helper function to determine row color based on status
const getRowColor = (record) => {
  if (record.leave_type) {
    return 'bg-red-100';
  }
  switch (record.status) {
    case 'present':
      return 'bg-blue-100';
    case 'weekend':
      return 'bg-gray-100';
    case 'missing':
    default:
      return 'bg-gray-50';
  }
};

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

export default function AttendanceTable({ attendance: initialAttendance, onUpdateAttendance }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [attendance, setAttendance] = useState(initialAttendance);

  React.useEffect(() => {
    setAttendance(initialAttendance);
  }, [initialAttendance]);

  const handleApprove = async (id) => {
    try {
      await approveLeave(id);
      setAttendance(prevAttendance =>
        prevAttendance.map(record =>
          record.id === id ? { ...record, approval: 'Approved' } : record
        )
      );
      if (onUpdateAttendance) onUpdateAttendance(id, 'Approved');
    } catch (error) {
      console.error("Error approving leave:", error);
      alert("Failed to approve leave.");
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectLeave(id);
      setAttendance(prevAttendance =>
        prevAttendance.map(record =>
          record.id === id ? { ...record, approval: 'Rejected' } : record
        )
      );
      if (onUpdateAttendance) onUpdateAttendance(id, 'Rejected');
    } catch (error) {
      console.error("Error rejecting leave:", error);
      alert("Failed to reject leave.");
    }
  };

  const mappedAttendance = attendance.map(record => ({
    ...record,
    date: new Date(record.date).toLocaleDateString('en-GB'),
    inTime: record.check_in_time,
    outTime: record.check_out_time,
    status: record.status.toLowerCase(),
    workedTime: calculateWorkedTime(record.check_in_time, record.check_out_time),
  }));

  const rowsPerPage = 5;
  const totalPages = Math.ceil(mappedAttendance.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRows = mappedAttendance.slice(startIndex, endIndex);

  return (
    <Card>
      <div className="overflow-x-auto rounded-lg">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="text-gray-500 text-xs uppercase bg-gray-50">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Role</th>
              <th className="p-4">Date</th>
              <th className="p-4">Check-in</th>
              <th className="p-4">Check-out</th>
              <th className="p-4">Worked Time</th>
              <th className="p-4">Status</th>
              <th className="p-4">Leave Type</th>
              <th className="p-4">Leave Start</th>
              <th className="p-4">Leave End</th>
              <th className="p-4">Reason</th>
              <th className="p-4 rounded-tr-lg">Approval</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.map((record) => (
              <tr key={record.id} className={getRowColor(record)}>
                <td className="p-4 font-medium text-gray-900">{record.name}</td>
                <td className="p-4">{record.role}</td>
                <td className="p-4">{record.date}</td>
                <td className="p-4">{record.inTime || '-'}</td>
                <td className="p-4">{record.outTime || '-'}</td>
                <td className="p-4">{record.workedTime}</td>
                <td className="p-4">{record.status}</td>
                <td className="p-4">{record.leave_type || '-'}</td>
                <td className="p-4">{record.leave_start_time || '-'}</td>
                <td className="p-4">{record.leave_end_time || '-'}</td>
                <td className="p-4">{record.reason || '-'}</td>
                <td className="p-4">
                  {record.approval === 'Processing' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(record.id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-xs"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(record.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs ${
                        record.approval === 'Approved' ? 'bg-green-100 text-green-700' :
                        record.approval === 'Rejected' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {record.approval || 'N/A'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {currentRows.length === 0 && (
              <tr>
                <td className="py-3 pr-4 text-gray-500 text-center" colSpan={12}>
                  No attendance records yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-2 text-sm">
        <span className="text-gray-400 mr-2">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaAngleLeft />
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`w-8 h-8 rounded-full ${currentPage === i + 1 ? 'bg-indigo-600 text-white' : 'hover:bg-gray-200'}`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaAngleRight />
        </button>
      </div>
    </Card>
  );
}
