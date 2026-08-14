import { Router } from "express";
import { loginAdmin, loginMentor, loginIntern, me } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Separate login endpoints per role
router.post("/admin/login", loginAdmin);
router.post("/mentor/login", loginMentor);
router.post("/intern/login", loginIntern);

// Role-aware "me" (token decides which table to query)
router.get("/me", requireAuth, me);

export default router;
