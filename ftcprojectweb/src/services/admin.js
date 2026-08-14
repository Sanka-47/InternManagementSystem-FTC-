import api from "./api";

// Admin Registration and OTP Verification
export const registerAdmin = async ({ username, email, password }) =>
  (await api.post("/admin/register", { username, email, password })).data;

export const verifyAdminOtp = async ({ username, email, password, otp }) =>
  (
    await api.post("/admin/register/verify-otp", {
      username,
      email,
      password,
      otp,
    })
  ).data;

// Change admin password without being logged in
export const changeAdminPassword = async ({
  identifier,
  old_password,
  new_password,
}) =>
  (
    await api.post("/admin/change-password", {
      identifier,
      old_password,
      new_password,
    })
  ).data;

// Cohorts
export const createCohort = (payload) =>
  api.post("/admin/cohorts", payload).then((r) => r.data);
export const listCohorts = () => api.get("/admin/cohorts").then((r) => r.data);
export const updateCohort = (id, payload) =>
  api.put(`/admin/cohorts/${id}`, payload).then((r) => r.data);
export const deleteCohort = (id) =>
  api.delete(`/admin/cohorts/${id}`).then((r) => r.data);

// Mentors
export const createMentor = (payload) =>
  api.post("/admin/mentors", payload).then((r) => r.data);
export const listMentors = () => api.get("/admin/mentors").then((r) => r.data);
export const updateMentor = (id, payload) =>
  api.put(`/admin/mentors/${id}`, payload).then((r) => r.data);
export const deleteMentor = (id) =>
  api.delete(`/admin/mentors/${id}`).then((r) => r.data);

// Interns
export const createIntern = (payload) =>
  api.post("/admin/interns", payload).then((r) => r.data);
export const listInterns = () => api.get("/admin/interns").then((r) => r.data);
export const updateIntern = (id, payload) =>
  api.put(`/admin/interns/${id}`, payload).then((r) => r.data);
export const deleteIntern = (id) =>
  api.delete(`/admin/interns/${id}`).then((r) => r.data);
export async function changeInternToMentor(id) {
  const { data } = await api.post(`/admin/interns/${id}/change-to-mentor`);
  return data;
}

// Cohorts for mentor (dropdown)
export const listCohortsForAdmin = async () =>
  (await api.get("/admin/cohorts")).data;

export const listInternsForProjectByAdmin = async (projectId) =>
  (await api.get(`/admin/projects/${projectId}/interns`)).data;

// Projects
export const createProject = async (data) =>
  (await api.post("/admin/projects", data)).data;

export const listProjects = async () => (await api.get("/admin/projects")).data;

export const getProject = async (projectId) =>
  (await api.get(`/admin/projects/${projectId}`)).data;

export const getProjectKanban = async (projectId) =>
  (await api.get(`/admin/projects/${projectId}/kanban`)).data;

// Tasks
export const createTask = async (data) => {
  const isFD = typeof FormData !== "undefined" && data instanceof FormData;
  const cfg = isFD
    ? { headers: { "Content-Type": "multipart/form-data" } }
    : undefined;
  return (await api.post("/admin/tasks", data, cfg)).data;
};

export const listTasks = async (projects_id) =>
  (await api.get(`/admin/tasks/${projects_id}`)).data;

// Subtasks
export const createSubtask = async (data) =>
  (await api.post("/admin/subtasks", data)).data;

export const listSubtasks = async (task_id) =>
  (await api.get(`/admin/subtasks/${task_id}`)).data;

export const rateSubtask = async (subtask_id, rating) =>
  (await api.post(`/admin/subtasks/${subtask_id}/rate`, { rating })).data;

// Comments
export const listDoneTasksForAdmin = async () =>
  (await api.get("/admin/comments/tasks-done")).data;

export const listCommentsForTask = async (task_id) =>
  (await api.get(`/admin/comments/${task_id}`)).data;

export const createCommentByAdmin = async (payload) =>
  (await api.post("/admin/comments", payload)).data;

export const getAdminStats = async () => (await api.get("/admin/stats")).data;

// Candidates (careers)
export const listCandidates = async () =>
  (await api.get("/admin/candidates")).data;

export const downloadCandidateCV = async (id) =>
  (await api.get(`/admin/candidates/${id}/cv`, { responseType: "blob" })).data;

export const deleteCandidate = async (id) =>
  (await api.delete(`/admin/candidates/${id}`)).data;

// Appointments
export const listAppointments = async () =>
  (await api.get("/admin/appointments")).data;

export const deleteAppointment = async (id) =>
  (await api.delete(`/admin/appointments/${id}`)).data;

/*---------------- Mentor Details (Admin) ---------------- */

// List all mentor details
export const listAllMentorDetails = async () =>
  (await api.get("/admin-details/mentors")).data;

// Get one mentor's details
export const getMentorDetailsById = async (mentorId) =>
  (await api.get(`/admin-details/mentors/${mentorId}`)).data;

// Approve mentor details
export const approveMentorDetails = async (id) =>
  (await api.patch(`/admin-details/mentors/${id}/approve`)).data;

// Reject mentor details
export const rejectMentorDetails = async (id) =>
  (await api.patch(`/admin-details/mentors/${id}/reject`)).data;

/*---------------- Intern Details (Admin) ---------------- */

// List all intern details
export const listAllInternDetails = async () =>
  (await api.get("/admin-details/interns")).data;

// Get one intern's details
export const getInternDetailsById = async (internId) =>
  (await api.get(`/admin-details/interns/${internId}`)).data;

// Approve intern details
export const approveInternDetails = async (id) =>
  (await api.patch(`/admin-details/interns/${id}/approve`)).data;

// Reject intern details
export const rejectInternDetails = async (id) =>
  (await api.patch(`/admin-details/interns/${id}/reject`)).data;

export const getAttendance = async () =>
  (await api.get("/admin/attendance")).data;

//Approve Leave
export async function approveLeave(id) {
  const { data } = await api.patch(`/admin/attendance/${id}/approve`);
  return data;
}

//Reject Leave
export async function rejectLeave(id) {
  const { data } = await api.patch(`/admin/attendance/${id}/reject`);
  return data;
}
