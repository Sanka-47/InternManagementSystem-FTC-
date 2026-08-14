import api from "./api";

// Interns (for chat) - Mentor can get all interns
export const listAllAdmin  = () => api.get("/intern/admins").then(r => r.data);

// Mentors (for chat) - Intern can get all mentors
export const listAllMentor  = () => api.get("/intern/mentors").then(r => r.data);

// subtasks
export const listMySubtasks = async () =>
  (await api.get("/intern/subtasks")).data;

export const listTeamSubtasks = async () =>
  (await api.get("/intern/team-subtasks")).data;

export const updateSubtaskStatus = async (subtaskId, status) =>
  (await api.patch(`/intern/subtasks/${subtaskId}/status`, { status })).data;

// attendance
export const checkIn = async (payload) =>
  (await api.post("/intern/attendance/check-in", payload)).data;

export const checkOut = async (payload) =>
  (await api.put("/intern/attendance/check-out", payload)).data;

export const fetchMyAttendance = async (limit = 30) =>
  (await api.get(`/intern/attendance?limit=${limit}`)).data;

export const fetchTodayAttendance = async () =>
  (await api.get("/intern/attendance/today")).data;

// Intern dashboard
export const getInternStats = async () =>
  (await api.get("/intern/stats")).data;

// Submit or update personal/bank/ID details
export const saveMyDetails = async (formData) =>
  (
    await api.post("/intern-details/details", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  ).data;

// Get logged-in intern's details
export const myDetails = async () => (await api.get("/intern-details/me")).data;

export const submitLeaveRequest = async (payload) =>
  (await api.post("/intern/leave/request", payload)).data;

export const getCohorts = () => api.get("/intern/cohorts").then(r => r.data);

export const getInternsByCohort = (cohortId) => api.get(`/intern/cohorts/${cohortId}/interns`).then(r => r.data);

