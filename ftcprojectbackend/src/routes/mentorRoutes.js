import { Router } from "express";
import {
  listCohortsForMentor,
  createProject, listProjects,
  createTask, listTasks, getTaskAttachment,
  createSubtask, listSubtasks,
  listInternsByProject, rateSubtask, listAllInterns,
  listAllAdmin
} from "../controllers/mentorController.js";
import {
  getAllAttendance,
  approveLeave,
  rejectLeave,
  checkInMentorController,
  checkOutMentorController,
  myAttendanceTodayMentor,
  myAttendanceListMentor,
  requestLeaveController,
} from "../controllers/mentorAttendanceController.js";
import {
  listDoneTasksForMentor,
  listCommentsForTask,
  createComment,
} from "../controllers/mentorCommentController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { getMentorStats } from "../controllers/mentorStatsController.js";
import { uploadTaskAttachment } from "../middleware/upload.js";
import { listInterns } from "../controllers/adminController.js";

const router = Router();
router.use(requireAuth, requireRole("mentor"));

// cohorts for project creation
router.get("/cohorts", listCohortsForMentor);
router.get("/projects/:projectId/interns", requireAuth, requireRole("mentor"), listInternsByProject);

// Mentor can get all interns
router.get("/interns", requireAuth, requireRole("mentor"), listInterns);

// projects
router.post("/projects", createProject);
router.get("/projects", listProjects);

// tasks
router.post("/tasks", uploadTaskAttachment, createTask);
router.get("/tasks/:projects_id", listTasks);
router.get("/tasks/:taskId/attachment", getTaskAttachment);

// subtasks
router.post("/subtasks", createSubtask);
router.get("/subtasks/:task_id", listSubtasks);
router.post("/subtasks/:subtaskId/rate", rateSubtask);

// interns (for chat) - Mentor can get all interns
router.get("/interns", listAllInterns);

// admins (for chat) - Mentor can get all admins
router.get("/admins", listAllAdmin);

// Attendance
router.get("/attendance", getAllAttendance);
router.patch(
  "/attendance/:id/approve",
  requireAuth,
  requireRole("mentor"),
  approveLeave
);
router.patch(
  "/attendance/:id/reject",
  requireAuth,
  requireRole("mentor"),
  rejectLeave
);

// Mentor's own attendance
router.post("/attendance/check-in", checkInMentorController);
router.put("/attendance/check-out", checkOutMentorController);
router.get("/attendance/today", myAttendanceTodayMentor);
router.get("/attendance/me", myAttendanceListMentor);

// Comments
router.get("/comments/tasks-done", listDoneTasksForMentor);
router.get("/comments/:task_id", listCommentsForTask);
router.post("/comments", createComment);

router.get("/stats", getMentorStats);

router.post("/leave/request", requireAuth, requireRole("mentor"), requestLeaveController);

export default router;
