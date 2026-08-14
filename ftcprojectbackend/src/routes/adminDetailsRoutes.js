// adminDetailsRoutes.js
import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  getAllMentorDetails,
  approveMentor,
  rejectMentor,
  getAllInternDetails,
  approveIntern,
  rejectIntern
} from "../controllers/adminDetailsController.js";

const router = Router();

// Admin can view all mentor details
router.get("/mentors", requireAuth, requireRole("admin"), getAllMentorDetails);

// Admin can view all intern details
router.get("/interns", requireAuth, requireRole("admin"), getAllInternDetails);

// Admin can approve mentor details
router.patch(
  "/mentors/:id/approve",
  requireAuth,
  requireRole("admin"),
  approveMentor
);

// Admin can approve intern details
router.patch(
  "/interns/:id/approve",
  requireAuth,
  requireRole("admin"),
  approveIntern
);

// Admin can reject mentor details
router.patch(
  "/mentors/:id/reject",
  requireAuth,
  requireRole("admin"),
  rejectMentor
);

// Admin can reject intern details
router.patch(
  "/interns/:id/reject",
  requireAuth,
  requireRole("admin"),
  rejectIntern
);

export default router;
