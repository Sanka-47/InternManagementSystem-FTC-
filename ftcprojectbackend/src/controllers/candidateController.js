import path from "path";
import { insertCandidate, listCandidatesModel, getCandidateByIdModel, deleteCandidateModel } from "../models/candidateModel.js";
import { uploadCandidateCV, persistCandidateFile } from "../middleware/uploadCandidate.js";

// util for filename
function pickFilename(name, mime) {
  const map = {
    "application/pdf": ".pdf",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    "image/png": ".png",
    "image/jpeg": ".jpg",
  };
  let base = (name && name.trim()) || "cv";
  if (!/\.[a-z0-9]+$/i.test(base)) base += (map[mime] || "");
  return base;
}

/* -------- submit candidate application -------- */
export async function submitCandidate(req, res) {
  uploadCandidateCV(req, res, async (err) => {
    try {
      if (err) return res.status(400).json({ message: err.message || "Upload error" });

      const { name, email, phone } = req.body || {};
      if (!name || !email || !phone || !req.file)
        return res.status(400).json({ message: "Name, Email, Phone and CV are required" });

      const { buffer, originalname, mimetype, size } = req.file;

      const { storedName, storedPath } = await persistCandidateFile(buffer, originalname);

      const row = await insertCandidate({
        name, email, phone,
        cv_original_name: originalname,
        cv_mime: mimetype,
        cv_size: size,
        cv_stored_name: storedName,
        cv_stored_path: storedPath,
        cv_data: buffer, // also store in DB
      });

      res.json({ message: "Application received!", candidate: { id: row.id, name: row.name } });
    } catch (e) {
      console.error("submitCandidate error:", e);
      res.status(500).json({ message: "Server error!" });
    }
  });
}

/* -------- admin: list candidates -------- */
export async function listCandidates(_req, res) {
  try {
    const rows = await listCandidatesModel();
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error!" });
  }
}

/* -------- admin: download CV from DB -------- */
export async function downloadCandidateCV(req, res) {
  try {
    const { id } = req.params;
    const row = await getCandidateByIdModel(id);
    if (!row || !row.cv_data) return res.status(404).json({ message: "CV not found!" });

    const filename = pickFilename(row.cv_original_name, row.cv_mime);
    res.setHeader("Content-Type", row.cv_mime || "application/octet-stream");
    res.setHeader("Content-Length", row.cv_data.length);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`
    );
    return res.end(row.cv_data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error!" });
  }
}

/* -------- admin: delete candidate -------- */
export async function deleteCandidate(req, res) {
  try {
    const { id } = req.params;
    const ok = await deleteCandidateModel(id);
    if (!ok) return res.status(404).json({ message: "Not found!" });
    res.json({ message: "Deleted!" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error!" });
  }
}
