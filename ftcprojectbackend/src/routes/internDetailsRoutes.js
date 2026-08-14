import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { saveMyDetails, myDetails } from "../controllers/internDetailsController.js";
import { upload } from "../middleware/uploadInternId.js";

const router = Router();

// Intern can add/update their details
router.post(
  "/details",
  requireAuth,
  requireRole("intern"),
  upload.fields([
    { name: "id_front_image", maxCount: 1 },
    { name: "id_back_image", maxCount: 1 },
  ]),
  saveMyDetails
);

// Intern can view their details
router.get("/me", requireAuth, requireRole("intern"), myDetails);

export default router;
