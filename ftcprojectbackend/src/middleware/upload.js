import multer from "multer";

// Use memory storage so we can write file bytes into DB
const storage = multer.memoryStorage();

export const uploadTaskAttachment = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
}).single("attachment");
