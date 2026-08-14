import { pool } from "../config/db.js";
import { createProjectModel, getProjectsByMentorModel } from "../models/projectModel.js";
import { createTaskModel, getTasksByProjectModel, getTaskAttachmentModel } from "../models/taskModel.js";
import { createSubtaskModel, getSubtasksByTaskModel, updateSubtaskRatingModel} from "../models/subtaskModel.js";
import { getAllInternsModel } from "../models/internModel.js";
import { getAllAdminModel } from "../models/adminModel.js"

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

/* ---- Cohorts visible to mentor (used by ProjectCreate dropdown) ---- */
export async function listCohortsForMentor(_req, res) {
  try {
    const [rows] = await pool.execute("SELECT id, name FROM cohorts ORDER BY id DESC");
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error!" });
  }
}

/* ---------------- Interns (for chat) ---------------- */
// export async function getAllInternsForMentor() {
//   const [rows] = await pool.execute(
//     `SELECT i.id, i.cohorts_id, c.name AS cohort_name, i.username, i.position, i.email
//      FROM intern i
//      LEFT JOIN cohorts c ON c.id = i.cohorts_id
//      ORDER BY i.id DESC`
//   );
//   return rows;
// }

export async function listInternsByProject(req, res) {
  try {
    const { projectId } = req.params;

    // Get the cohort for this project
    const [[project]] = await pool.query(
      "SELECT cohorts_id FROM projects WHERE id = ?",
      [projectId]
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Now get interns from that cohort
    const [rows] = await pool.query(
      "SELECT id, username FROM intern WHERE cohorts_id = ? ORDER BY id DESC",
      [project.cohorts_id]
    );

    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error!" });
  }
}

/* ---------------- Projects ---------------- */
export async function createProject(req, res) {
  try {
    const mentor_id = req.user.sub;
    const { cohorts_id, name, description, start_date, end_date } = req.body;

    if (!cohorts_id || !name) {
      return res.status(400).json({ message: "cohorts_id and name are required" });
    }

    const project = await createProjectModel({
      cohorts_id,
      mentor_id,
      admin_id: null,
      name,
      description,
      start_date,
      end_date
    });

    res.json(project);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error!" });
  }
}

export async function listProjects(req, res) {
  try {
    const mentor_id = req.user.sub;
    const rows = await getProjectsByMentorModel(mentor_id);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error!" });
  }
}

/* ---------------- Tasks ---------------- */
export async function createTask(req, res) {
  try {
    const mentor_id = req.user.sub;
    const { projects_id, title, description, priority, due_date } = req.body;

    if (!projects_id || !title) {
      return res.status(400).json({ message: "project_id and title are required" });
    }

    // If a file was uploaded, capture bytes in DB
    const attachment = req.file
      ? {
          name: req.file.originalname,
          mime: req.file.mimetype,
          buffer: req.file.buffer,
        }
      : null;

    const task = await createTaskModel({
      projects_id: Number(projects_id),
      mentor_id,
      admin_id: null,
      title,
      description,
      priority,
      due_date,
      attachment,
    });

    res.json(task);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error!" });
  }
}

export async function getTaskAttachment(req, res) {
  try {
    const { taskId } = req.params;
    const row = await getTaskAttachmentModel(taskId);
    if (!row || !row.attachment_data) {
      return res.status(404).json({ message: "No attachment" });
    }

    const mime = row.attachment_mime || "application/octet-stream";
    const filename = pickFilename(row.attachment_name, mime);

    res.setHeader("Content-Type", mime);
    res.setHeader("Content-Length", Buffer.byteLength(row.attachment_data));
    // Force a download with a proper filename (RFC 5987 for UTF-8)
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`
    );

    return res.end(row.attachment_data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}

export async function listTasks(req, res) {
  try {
    const { projects_id } = req.params;
    const rows = await getTasksByProjectModel(projects_id);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}

/* ---------------- Subtasks ---------------- */
export async function createSubtask(req, res) {
  try {
    const { task_id, intern_id, title, work_type, labels, due_date } = req.body;
    if (!task_id || !intern_id || !title || !work_type) {
      return res.status(400).json({ message: "Task ID, Intern ID, title, and work type are required!" });
    }

    // Optional safety: ensure intern belongs to the same cohort as the project
    const [[row]] = await pool.query(
      `SELECT p.cohorts_id AS cohort_of_project, i.cohorts_id AS cohort_of_intern
       FROM tasks t
       JOIN projects p ON p.id = t.projects_id
       JOIN intern i ON i.id = ?
       WHERE t.id = ?`,
      [intern_id, task_id]
    );

    if (!row) return res.status(400).json({ message: "Invalid task or intern" });
    if (row.cohort_of_project !== row.cohort_of_intern) {
      return res.status(400).json({ message: "Intern is not in the project's cohort" });
    }

    const subtask = await createSubtaskModel({ task_id, intern_id, title, work_type, labels, due_date });
    res.json(subtask);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error!" });
  }
}

export async function listSubtasks(req, res) {
  try {
    const { task_id } = req.params;
    const rows = await getSubtasksByTaskModel(task_id);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error!" });
  }
}

// Update rating for a subtask
export async function rateSubtask(req, res) {
  try {
    const { subtaskId } = req.params;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 10) {
      return res.status(400).json({ message: "Rating must be between 1 and 10" });
    }

    // Ensure subtask is done before allowing rating
    const [[subtask]] = await pool.query(
      "SELECT status FROM subtasks WHERE id = ?",
      [subtaskId]
    );
    if (!subtask) return res.status(404).json({ message: "Subtask not found" });
    if (subtask.status !== "Done") {
      return res.status(400).json({ message: "Can only rate completed subtasks" });
    }

    await updateSubtaskRatingModel(subtaskId, rating);
    res.json({ message: "Rating saved successfully!" });
  } catch (e) {
    console.error("Error in rateSubtask:", e);
    res.status(500).json({ message: "Server error" });
  }
}

/* ---------------- Admins (for chat) ---------------- */
export async function listAllAdmin(_req, res) {
  try {
    const rows = await getAllAdminModel();
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error!" });
  }
}

/* ---------------- Interns (for chat) ---------------- */
export async function listAllInterns(_req, res) {
  try {
    const rows = await getAllInternsModel();
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error!" });
  }
}
