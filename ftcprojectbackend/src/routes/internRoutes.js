import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  listMySubtasks,
  listTeamSubtasks,
  updateSubtaskStatus,
  getMyTaskAttachmentInline, 
  listAllAdmin,
  listAllMentor,
  requestLeaveController,
  listCohortsForIntern,
  listInternsByCohort
} from "../controllers/internController.js";
import {
  checkIn,
  checkOut,
  myAttendanceList,
  myAttendanceToday,
} from "../controllers/internAttendanceController.js";
import { getInternStats } from "../controllers/internStatsController.js";

const router = Router();

// Get all admins (for intern to chat with mentors/admins)
router.get("/admins", requireAuth, requireRole("intern"), listAllAdmin);

// Get all mentors (for intern to chat with mentors/admins)
router.get("/mentors", requireAuth, requireRole("intern"), listAllMentor);

/* ---------- existing intern features (kanban) ---------- */
router.get("/subtasks", requireAuth, requireRole("intern"), listMySubtasks);
router.get("/team-subtasks", requireAuth, requireRole("intern"), listTeamSubtasks);
router.patch("/subtasks/:subtaskId/status", requireAuth, requireRole("intern"), updateSubtaskStatus);
router.get("/tasks/:taskId/attachment", requireAuth, requireRole("intern"), getMyTaskAttachmentInline);

/* ---------- attendance ---------- */
router.post("/attendance/check-in", requireAuth, requireRole("intern"), checkIn);
router.put("/attendance/check-out", requireAuth, requireRole("intern"), checkOut);
router.get("/attendance", requireAuth, requireRole("intern"), myAttendanceList);
router.get("/attendance/today", requireAuth, requireRole("intern"), myAttendanceToday);

router.get("/stats", requireAuth, requireRole("intern"), getInternStats);

/* ---------- Leave Request ---------- */
router.post("/leave/request", requireAuth, requireRole("intern"), requestLeaveController);

// New routes for leave application form
router.get("/cohorts", requireAuth, requireRole("intern"), listCohortsForIntern);
router.get("/cohorts/:cohortId/interns", requireAuth, requireRole("intern"), listInternsByCohort);

export default router;
