import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  registerAdmin,
  verifyAdminOtp
} from "../controllers/adminController.js";
import {
  createCohort, listCohorts, updateCohort, deleteCohort,          
  createMentor, listMentors, updateMentor, deleteMentor,         
  createIntern, listInterns, updateIntern, deleteIntern,
  listCohortsForAdmin,
  createProject, listProjects, getProjectById,
  createTask, listTasks, getTaskAttachment,
  createSubtask, listSubtasks,
  getSubtasksForProject,
  getProjectKanban,
  listInternsByProject, rateSubtask,
  changeAdminPasswordPublic, changeInternToMentor,
  approveLeave, rejectLeave 
} from "../controllers/adminController.js";
import {
  listDoneTasksForAdmin,
  listCommentsForTask,
  createCommentByAdmin,
} from "../controllers/adminCommentController.js";
import { getAdminStats } from "../controllers/adminStatsController.js";
import { uploadTaskAttachment } from "../middleware/upload.js";
import { listCandidates, downloadCandidateCV, deleteCandidate } from "../controllers/candidateController.js";
import { adminListAppointments, adminDeleteAppointment} from "../controllers/appointmentController.js";
import { getAttendance } from "../controllers/adminController.js";

const router = Router();

// Admin registration
router.post("/register", registerAdmin);
router.post("/register/verify-otp", verifyAdminOtp);
// Change Password
router.post("/change-password", changeAdminPasswordPublic);

router.use(requireAuth, requireRole("admin"));

// cohorts
router.post("/cohorts", createCohort);
router.get("/cohorts", listCohorts);
router.put("/cohorts/:id", updateCohort);       
router.delete("/cohorts/:id", deleteCohort);

// mentors
router.post("/mentors", createMentor);
router.get("/mentors", listMentors);
router.put("/mentors/:id", updateMentor);       
router.delete("/mentors/:id", deleteMentor);

// interns
router.post("/interns", createIntern);
router.get("/interns", listInterns);
router.put("/interns/:id", updateIntern);       
router.delete("/interns/:id", deleteIntern);
router.post("/interns/:id/change-to-mentor", changeInternToMentor);

// cohorts for project creation
router.get("/cohorts", listCohortsForAdmin);
router.get("/projects/:projectId/interns", requireAuth, requireRole("admin"), listInternsByProject);

router.get("/projects/:id", getProjectById);

// projects
router.post("/projects", createProject);
router.get("/projects", listProjects);

router.get("/projects/:projectId/kanban", getProjectKanban);

// tasks
router.post("/tasks", uploadTaskAttachment, createTask);
router.get("/tasks/:projects_id", listTasks);
router.get("/tasks/:taskId/attachment", getTaskAttachment);

// subtasks
router.post("/subtasks", createSubtask);
router.get("/subtasks/:task_id", listSubtasks);
router.post("/subtasks/:subtaskId/rate", rateSubtask);

// Comments
router.get("/comments/tasks-done", listDoneTasksForAdmin);
router.get("/comments/:task_id", listCommentsForTask);
router.post("/comments", createCommentByAdmin);

router.get("/stats", getAdminStats);

// candidates (careers)
router.get("/candidates", listCandidates);
router.get("/candidates/:id/cv", downloadCandidateCV);
router.delete("/candidates/:id", deleteCandidate);

// appointments
router.get("/appointments", adminListAppointments);
router.delete("/appointments/:id", adminDeleteAppointment);

// attendance
router.get("/attendance", getAttendance);

// attendance leave approval
router.patch("/attendance/:id/approve", approveLeave);
router.patch("/attendance/:id/reject", rejectLeave);

export default router;
