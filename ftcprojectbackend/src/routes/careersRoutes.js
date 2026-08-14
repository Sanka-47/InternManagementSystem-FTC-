import { Router } from "express";
import { submitCandidate } from "../controllers/candidateController.js";

const router = Router();

// POST /api/careers/apply  (multipart/form-data)
router.post("/apply", submitCandidate);

export default router;