import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

const storage = multer.memoryStorage();

export const uploadCandidateCV = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const okTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/png",
      "image/jpeg",
    ];
    if (okTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Unsupported file type"));
  },
}).single("cv");

// helper to persist buffer to /uploads/candidates
export async function persistCandidateFile(buffer, originalname) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const root = path.join(__dirname, "../../");
  const dir = path.join(root, "uploads", "candidates");
  await fs.mkdir(dir, { recursive: true });

  // create unique name
  const ts = Date.now();
  const ext = path.extname(originalname) || "";
  const base = path.basename(originalname, ext).replace(/[^\w\-]+/g, "_").slice(0, 80);
  const storedName = `${base}_${ts}${ext || ""}`;
  const storedPath = path.join(dir, storedName);

  await fs.writeFile(storedPath, buffer);
  return { storedName, storedPath };
}
