import React from "react";
import LeaveApplicationForm from "../components/LeaveApplicationForm";
import { useAuth } from "../context/AuthContext";

const MentorRequestLeave = () => {
  const { user } = useAuth();
  return (
    <div>
      <nav className="sticky top-0 w-full bg-gray-800 border-b border-gray-200 py-3 flex items-center justify-end px-6">
        <div className="flex flex-col text-right">
          <div className="font-semibold text-lg text-white">
            Future Code Technology - Mentor Attendance
          </div>
          <span className="text-sm text-gray-400">
            Welcome back, {user?.username}
          </span>
        </div>
      </nav>
      <main className="p-6">
        <LeaveApplicationForm userType="mentor" />
      </main>
    </div>
  );
};

export default MentorRequestLeave;
