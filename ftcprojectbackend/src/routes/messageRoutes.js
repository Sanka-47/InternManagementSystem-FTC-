import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { sendMessage, getChatHistory } from "../controllers/messageController.js";
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/messages"), // ✅ correct folder
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

const router = Router();

router.use(requireAuth);

// Send message (with optional file upload)
router.post("/send", upload.single("file"), sendMessage);

// Get chat history
router.get("/history/:user1_id/:user1_role/:user2_id/:user2_role", getChatHistory);

export default router;
