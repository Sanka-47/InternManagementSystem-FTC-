import { pool } from "../config/db.js";
import {
  getSubtasksByInternModel,
  updateSubtaskStatusModel,
  getSubtasksByCohortModel,
} from "../models/subtaskModel.js";
import { getTaskAttachmentModel } from "../models/taskModel.js";
import { getAllAdminModel } from "../models/adminModel.js";
import { getAllMentorsModel } from "../models/mentorModel.js";
import { requestLeave } from "../models/attendanceModel.js";
import { getAllCohortsModel } from "../models/cohortModel.js";
import { getInternsByCohortModel } from "../models/internModel.js";

function pickFilename(name, mime) {
  const map = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "application/pdf": ".pdf",
  };
  let base = (name && name.trim()) || "attachment";
  // if no dot/extension in base, try to add from mime
  if (!/\.[a-z0-9]+$/i.test(base)) {
    const ext = map[mime] || "";
    base += ext;
  }
  return base;
}

function toBuffer(maybeBuf) {
  if (!maybeBuf) return null;
  if (Buffer.isBuffer(maybeBuf)) return maybeBuf;
  try {
    return Buffer.from(maybeBuf);
  } catch {}
  try {
    return Buffer.from(maybeBuf, "base64");
  } catch {}
  return null;
}

/* --- Get all subtasks assigned to logged intern --- */
export async function listMySubtasks(req, res) {
  try {
    const intern_id = req.user.sub;
    const rows = await getSubtasksByInternModel(intern_id);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}

/* --- Get all subtasks for the team --- */
export async function listTeamSubtasks(req, res) {
  try {
    const intern_id = req.user.sub;
    const [[intern]] = await pool.query(
      `SELECT cohorts_id FROM intern WHERE id = ?`,
      [intern_id]
    );
    if (!intern) {
      return res.status(404).json({ message: "Intern not found" });
    }
    const rows = await getSubtasksByCohortModel(intern.cohorts_id);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}

/* --- Update subtask status --- */
export async function updateSubtaskStatus(req, res) {
  try {
    const intern_id = req.user.sub;
    const { subtaskId } = req.params;
    const { status } = req.body;

    if (!["In Progress", "In Review", "Done"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Ensure subtask belongs to intern
    const subtasks = await getSubtasksByInternModel(intern_id);
    const found = subtasks.find((s) => s.id == subtaskId);
    if (!found) return res.status(403).json({ message: "Unauthorized" });

    await updateSubtaskStatusModel(subtaskId, status);
    res.json({ message: "OK" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}

/* --- INLINE preview --- */
export async function getMyTaskAttachmentInline(req, res) {
  try {
    const intern_id = req.user.sub;
    const { taskId } = req.params;

    // ensure this intern has a subtask under this task
    const [rows] = await pool.query(
      `SELECT 1 FROM subtasks WHERE task_id = ? AND intern_id = ? LIMIT 1`,
      [taskId, intern_id]
    );
    if (!rows.length) return res.status(403).json({ message: "Unauthorized" });

    const att = await getTaskAttachmentModel(taskId);
    if (!att || !att.attachment_data) {
      return res.status(404).json({ message: "No attachment" });
    }

    const mime = att.attachment_mime || "application/octet-stream";
    const buf = toBuffer(att.attachment_data);
    if (!buf)
      return res.status(500).json({ message: "Attachment data corrupted" });

    res.setHeader("Content-Type", mime);
    res.setHeader("Content-Length", buf.length);
    // For images, let it render inline; for other types browsers will download or show plugin
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${pickFilename(att.attachment_name, mime)}"`
    );
    return res.end(buf);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}

// Get all admins (for intern to chat with mentors/admins)
export async function listAllAdmin(_req, res) {
  try {
    const rows = await getAllAdminModel();
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error!" });
  }
}

// Get all mentors (for intern to chat with mentors/admins)
export async function listAllMentor(_req, res) {
  try {
    const rows = await getAllMentorsModel();
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error!" });
  }
}

export async function requestLeaveController(req, res) {
  try {
    const intern_id = req.user.sub;
    const { leave_type, status, reason, startDate, endDate, startTime, endTime } =
      req.body;

    if (!leave_type || !status || !reason || !startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "Missing required leave details." });
    }

    const affectedRows = await requestLeave(
      intern_id,
      null, // mentor_id is null for interns
      leave_type,
      status,
      reason,
      startDate,
      endDate,
      startTime,
      endTime
    );

    if (affectedRows > 0) {
      res
        .status(201)
        .json({ message: "Leave request submitted successfully." });
    } else {
      res.status(500).json({ message: "Failed to submit leave request." });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error!" });
  }
}

export async function listCohortsForIntern(_req, res) {
  try {
    const rows = await getAllCohortsModel();
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error!" });
  }
}

export async function listInternsByCohort(req, res) {
  try {
    const { cohortId } = req.params;
    const rows = await getInternsByCohortModel(cohortId);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error!" });
  }
}
