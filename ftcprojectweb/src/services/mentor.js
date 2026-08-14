import api from "./api";

// Cohorts for mentor (dropdown)
export const listCohortsForMentor = async () =>
  (await api.get("/mentor/cohorts")).data;

export const listInterns = async (projectId) =>
  (await api.get(`/mentor/projects/${projectId}/interns`)).data;

// Projects
export const createProject = async (data) =>
  (await api.post("/mentor/projects", data)).data;

export const listProjects = async () =>
  (await api.get("/mentor/projects")).data;

// Tasks
export const createTask = async (data) => {
  const isFD = typeof FormData !== "undefined" && data instanceof FormData;
  const cfg = isFD
    ? { headers: { "Content-Type": "multipart/form-data" } }
    : undefined;
  return (await api.post("/mentor/tasks", data, cfg)).data;
};

export const listTasks = async (projects_id) =>
  (await api.get(`/mentor/tasks/${projects_id}`)).data;

export const getProjectKanban = async (projectId) =>
  (await api.get(`/mentor/projects/${projectId}/kanban`)).data;

// Subtasks
export const createSubtask = async (data) =>
  (await api.post("/mentor/subtasks", data)).data;

export const listSubtasks = async (task_id) =>
  (await api.get(`/mentor/subtasks/${task_id}`)).data;

export const rateSubtask = async (subtask_id, rating) =>
  (await api.post(`/mentor/subtasks/${subtask_id}/rate`, { rating })).data;

// Interns (for chat) - Mentor can get all interns
export const getAllInternsForMentor = () =>
  api.get("/mentor/interns").then((r) => r.data);

// Admins (for chat) - Mentor can get all admins
export const getAllAdminsForMentor = () =>
  api.get("/mentor/admins").then((r) => r.data);

// Attendance
export const listAllAttendance = async () =>
  (await api.get("/mentor/attendance")).data;

export const approveLeave = async (attendance_id) =>
  (await api.patch(`/mentor/attendance/${attendance_id}/approve`)).data;

export const rejectLeave = async (attendance_id) =>
  (await api.patch(`/mentor/attendance/${attendance_id}/reject`)).data;

export const checkInMentor = async (payload) =>
  (await api.post("/mentor/attendance/check-in", payload)).data;

export const checkOutMentor = async (payload) =>
  (await api.put("/mentor/attendance/check-out", payload)).data;

export const fetchMyAttendanceMentor = async (limit = 30) =>
  (await api.get(`/mentor/attendance/me?limit=${limit}`)).data;

export const fetchTodayAttendanceMentor = async () =>
  (await api.get("/mentor/attendance/today")).data;

// Comments
export const listDoneTasksForMentor = async () =>
  (await api.get("/mentor/comments/tasks-done")).data;

export const listCommentsForTask = async (task_id) =>
  (await api.get(`/mentor/comments/${task_id}`)).data;

export const createComment = async (payload) =>
  (await api.post("/mentor/comments", payload)).data;

export const getMentorStats = async () => (await api.get("/mentor/stats")).data;

// Submit or update personal/bank/ID details
export const saveMyDetails = async (formData) =>
  (
    await api.post("/mentor-details/details", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  ).data;

// Get logged-in mentor’s details
export const myDetails = async () => (await api.get("/mentor-details/me")).data;

export const submitLeaveRequestMentor = async (payload) =>
  (await api.post("/mentor/leave/request", payload)).data;
