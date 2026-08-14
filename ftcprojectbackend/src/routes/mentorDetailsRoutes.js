// mentorDetailsRoutes.js
import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { saveMyDetails, myDetails } from "../controllers/mentorDetailsController.js";
import { upload } from "../middleware/uploadId.js";

const router = Router();

// Mentor can add/update their details
router.post(
  "/details",
  requireAuth,
  requireRole("mentor"),
  upload.fields([
    { name: "id_front_image", maxCount: 1 },
    { name: "id_back_image", maxCount: 1 },
  ]),
  saveMyDetails
);

// Mentor can view their details
router.get("/me", requireAuth, requireRole("mentor"), myDetails);

export default router;
