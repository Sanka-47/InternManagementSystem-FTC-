import { pool } from "../config/db.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import { updateAdminPassword, findAdminByEmailOrUsername, createAdmin } from "../models/adminModel.js";
import {
  getCohortByNameModel,
  createCohortModel,
  getAllCohortsModel,
  getCohortByIdModel,
  updateCohortModel,
  deleteCohortModel,
} from "../models/cohortModel.js";

import {
  findMentorByEmailOrUsername,
  createMentorModel,
  getAllMentorsModel,
  updateMentorModel,       
  deleteMentorModel 
} from "../models/mentorModel.js";

import {
  findInternByEmailOrUsername,
  createInternModel,
  getAllInternsModel,
  updateInternModel,        
  deleteInternModel ,
  getInternWithPasswordModel
} from "../models/internModel.js";

import { createProjectModel, getProjectsByAdminModel, getProjectByIdModel } from "../models/projectModel.js";
import { createTaskModel, getTasksByProjectModel, getTaskAttachmentModel } from "../models/taskModel.js";
import { createSubtaskModel, getSubtasksByTaskModel, updateSubtaskRatingModel} from "../models/subtaskModel.js";
import { listAllAttendanceForAdmin, approveLeaveRequest, rejectLeaveRequest } from "../models/attendanceModel.js";

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

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || "1d" });
}

/* ---------------- Public: Admin Registration ---------------- */
// In-memory store for OTPs
const otpStore = new Map();
const COMPANY_EMAIL = "futurecthr@gmail.com";


// Helper to send OTP email
async function sendOtpEmail(otp) {
  // Configure nodemailer (use your SMTP config)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "thisalfernando39@gmail.com",
      pass: "dxdu rnoc wzwg vvub"
    }
  });

  await transporter.sendMail({
    from: '"Future Code Technology - OTP Verification" <thisalfernando39@gmail.com>',
    to: COMPANY_EMAIL,
    subject: "New Admin Registration OTP",
    text: `Your OTP for admin registration is: ${otp}`,
    html: `
      <div>
        <p>Your OTP for admin registration is:</p>
        <p style="font-size:1.8em;font-weight:bold;margin:16px 0;">${otp}</p>
      </div>
    `
  });
}

// Registration: Request registration, send OTP
export async function registerAdmin(req, res) {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ message: "Username, email, and password are required!" });

    // Check if username/email already exists
    const existing = await findAdminByEmailOrUsername(email) || await findAdminByEmailOrUsername(username);
    if (existing)
      return res.status(400).json({ message: "Username or email already exists!" });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
    otpStore.set(email, { otp, username, email, password, created: Date.now() });

    await sendOtpEmail(otp);

    res.json({ message: "OTP sent to company email." });
  } catch (e) {
    console.error("registerAdmin error:", e);
    res.status(500).json({ message: "Server error" });
  }
}

// Registration: Verify OTP and create admin
export async function verifyAdminOtp(req, res) {
  try {
    const { username, email, password, otp } = req.body;
    if (!username || !email || !password || !otp)
      return res.status(400).json({ message: "All fields are required!" });

    const entry = otpStore.get(email);
    if (!entry || entry.otp !== otp)
      return res.status(400).json({ message: "Invalid or expired OTP!" });

    // Optional: check OTP expiry (e.g., 10 min)
    if (Date.now() - entry.created > 10 * 60 * 1000)
      return res.status(400).json({ message: "OTP expired!" });

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save admin to DB with hashed password
    await createAdmin({ username, email, password: hashedPassword });

    // Fetch the newly created admin
    const admin = await findAdminByEmailOrUsername(email);

    otpStore.delete(email);

    // Issue JWT token
    const token = signToken({ sub: admin.id, role: "admin" });

    res.json({
      message: "Admin registered successfully!",
      token,
      user: { id: admin.id, username: admin.username, email: admin.email },
      role: "admin"
    });
  } catch (e) {
    console.error("verifyAdminOtp error:", e);
    res.status(500).json({ message: "Server error" });
  }
}

/* ---------------- Public: change admin password (pre‑login) ---------------- */
export async function changeAdminPasswordPublic(req, res) {
  try {
    const { identifier, old_password, new_password } = req.body;

    if (!identifier || !old_password || !new_password) {
      return res.status(400).json({ message: "Email/Username, current password and new password are required!" });
    }
    if (String(new_password).length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters!" });
    }

    const admin = await findAdminByEmailOrUsername(identifier);
    if (!admin) return res.status(404).json({ message: "Admin not found!" });

    // Compare old_password with hashed password in DB
    const valid = await bcrypt.compare(old_password, admin.password);
    if (!valid) {
      return res.status(400).json({ message: "Current password is incorrect!" });
    }

    // Hash new password before saving
    const hashedNewPassword = await bcrypt.hash(new_password, 10);
    await updateAdminPassword(admin.id, hashedNewPassword);
    return res.json({ message: "Password updated successfully!" });
  } catch (e) {
    console.error("changeAdminPasswordPublic error:", e);
    res.status(500).json({ message: "Server error" });
  }
}

/* ---- Cohorts visible to admin (used by ProjectCreate dropdown) ---- */
export async function listCohortsForAdmin(_req, res) {
  try {
    const [rows] = await pool.execute("SELECT id, name FROM cohorts ORDER BY id DESC");
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error!" });
  }
}

/* ----------------------- COHORTS ----------------------- */
export async function createCohort(req, res) {
  try {
    const { name, start_date, end_date } = req.body;
    if (!name || !start_date || !end_date) {
      return res.status(400).json({ message: "Name, Start date, End ate are required!" });
    }

    // Check for existing cohort name
    const existing = await getCohortByNameModel(name);
    if (existing) {
      return res.status(400).json({ message: "Cohort with the same name already exists" });
    }

    const cohort = await createCohortModel({ name, start_date, end_date });
    res.json(cohort);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error!" });
  }
}

export async function listCohorts(_req, res) {
  try {
    const rows = await getAllCohortsModel();
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error!" });
  }
}

export async function updateCohort(req, res) {
  try {
    const { id } = req.params;
    const { name, start_date, end_date } = req.body;
    if (!name || !start_date || !end_date) {
      return res.status(400).json({ message: "Name, Start date, End date are required!" });
    }

    // Check for existing cohort name
    const existing = await getCohortByNameModel(name);
    if (existing) {
      return res.status(400).json({ message: "Cohort with the same name already exists" });
    }

    const ok = await updateCohortModel(Number(id), { name, start_date, end_date });
    if (!ok) return res.status(404).json({ message: "Cohort not found!" });
    res.json({ message: "Cohort updated" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error!" });
  }
}

export async function deleteCohort(req, res) {
  try {
    const { id } = req.params;
    const ok = await deleteCohortModel(Number(id));
    if (!ok) return res.status(404).json({ message: "Cohort not found!" });
    res.json({ message: "Cohort deleted" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error!" });
  }
}

/* ----------------------- MENTORS ----------------------- */
export async function createMentor(req, res) {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, Email, Password are required!" });
    }

    // Check if intern with same username or email exists
    const existingMentor = await findMentorByEmailOrUsername(username) || await findMentorByEmailOrUsername(email);
    if (existingMentor) {
      return res.status(400).json({ message: "Mentor with the same email/username already exists" });
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);
    const mentor = await createMentorModel({ username, email, password: hashedPassword });
    res.json(mentor);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error!" });
  }
}

export async function listMentors(_req, res) {
  try {
    const rows = await getAllMentorsModel();
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error!" });
  }
}

export async function updateMentor(req, res) {
  try {
    const { id } = req.params;
    const { username, email, password } = req.body;
    if (!username || !email) {
      return res.status(400).json({ message: "Username and Email are required!" });
    }

    // Check if intern with same username or email exists
    const existingMentor = await findMentorByEmailOrUsername(username) || await findMentorByEmailOrUsername(email);
    if (existingMentor) {
      return res.status(400).json({ message: "Mentor with the same email/username already exists" });
    }

    const ok = await updateMentorModel(Number(id), { username, email, password });
    if (!ok) return res.status(404).json({ message: "Mentor not found!" });
    res.json({ message: "Mentor updated" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error!" });
  }
}

export async function deleteMentor(req, res) {
  try {
    const { id } = req.params;
    const ok = await deleteMentorModel(Number(id));
    if (!ok) return res.status(404).json({ message: "Mentor not found!" });
    res.json({ message: "Mentor deleted" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error!" });
  }
}

/* ----------------------- INTERNS ----------------------- */
export async function createIntern(req, res) {
  try {
    const { username, position, email, password, cohorts_id } = req.body;
    if (!username || !position || !email || !password || !cohorts_id) {
      return res.status(400).json({
        message: "Username, Position, Email, Password, Cohort are required!"
      });
    }
    // verify cohort exists
    const cohort = await getCohortByIdModel(cohorts_id);
    if (!cohort) return res.status(400).json({ message: "Invalid cohort!" });

    // Check if intern with same username or email exists
    const existingIntern = await findInternByEmailOrUsername(username) || await findInternByEmailOrUsername(email);
    if (existingIntern) {
      return res.status(400).json({ message: "Intern with the same email/username already exists" });
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);
    const intern = await createInternModel({ username, position, email, password: hashedPassword, cohorts_id });
    res.json(intern);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server erro!r" });
  }
}

export async function listInterns(_req, res) {
  try {
    const rows = await getAllInternsModel();
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error!" });
  }
}

export async function listInternsByProject(req, res) {
  try {
    const { projectId } = req.params;

    // Get the cohort for this project
    const [[project]] = await pool.query(
      "SELECT cohorts_id FROM projects WHERE id = ?",
      [projectId]
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found!" });
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

export async function updateIntern(req, res) {
  try {
    const { id } = req.params;
    const { cohorts_id, username, position, email, password } = req.body;
    if (!cohorts_id || !username || !position || !email) {
      return res.status(400).json({ message: "Cohort, Username, Position, Email are required!" });
    }
    // Ensure cohort exists
    const cohort = await getCohortByIdModel(cohorts_id);
    if (!cohort) return res.status(400).json({ message: "Invalid cohort!" });

    // Check if intern with same username or email exists
    const existingIntern = await findInternByEmailOrUsername(username) || await findInternByEmailOrUsername(email);
    if (existingIntern) {
      return res.status(400).json({ message: "Intern with the same email/username already exists" });
    }

    const ok = await updateInternModel(Number(id), { cohorts_id, username, position, email, password });
    if (!ok) return res.status(404).json({ message: "Intern not found!" });
    res.json({ message: "Intern updated" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error!" });
  }
}

export async function deleteIntern(req, res) {
  try {
    const { id } = req.params;
    const ok = await deleteInternModel(Number(id));
    if (!ok) return res.status(404).json({ message: "Intern not found!" });
    res.json({ message: "Intern deleted" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error!" });
  }
}

export async function changeInternToMentor(req, res) {
  try {
    const { id } = req.params;
    const intern = await getInternWithPasswordModel(id);
    if (!intern) return res.status(404).json({ message: "Intern not found!" });

    // Insert into mentor table
    await createMentorModel({
      username: intern.username,
      email: intern.email,
      password: intern.password, // already hashed in DB
    });

    // Remove from intern table
    await deleteInternModel(id);

    res.json({ message: "Intern successfully converted to Mentor!" });
  } catch (e) {
    console.error("Error in changeInternToMentor:", e);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getProjectById(req, res) {
  try {
    const { id } = req.params;
    const project = await getProjectByIdModel(id);
    if (!project) return res.status(404).json({ message: "Project not found!" });
    res.json(project);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error!" });
  }
}

/* ---------------- Projects ---------------- */
export async function createProject(req, res) {
  try {
    const admin_id = req.user.sub;
    const { cohorts_id, name, description, start_date, end_date } = req.body;

    if (!cohorts_id || !name) {
      return res.status(400).json({ message: "Cohorts ID and name are required!" });
    }

    const project = await createProjectModel({
      cohorts_id,
      mentor_id: null,
      admin_id,
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
    const admin_id = req.user.sub;
    const rows = await getProjectsByAdminModel(admin_id);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error!" });
  }
}

/* ---------------- Tasks ---------------- */
export async function createTask(req, res) {
  try {
    const admin_id = req.user.sub;
    const { projects_id, title, description, priority, due_date } = req.body;

    if (!projects_id || !title) {
      return res.status(400).json({ message: "Project ID and title are required!" });
    }

    const attachment = req.file
      ? {
          name: req.file.originalname,
          mime: req.file.mimetype,
          buffer: req.file.buffer,
        }
      : null;

    const task = await createTaskModel({
      projects_id: Number(projects_id),
      mentor_id: null,
      admin_id,
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
    res.status(500).json({ message: "Server error!" });
  }
}

export async function getSubtasksForProject(req, res) {
  try {
    const { projectId } = req.params;
    const [rows] = await pool.query(
      `SELECT s.*, i.username AS intern_name
       FROM subtasks s
       JOIN tasks t ON s.task_id = t.id
       JOIN intern i ON i.id = s.intern_id
       WHERE t.projects_id = ?
       ORDER BY s.id DESC`,
      [projectId]
    );
    res.json(rows.map(row => {
      let labels = [];
      if (row.labels) {
        if (typeof row.labels === 'string') {
          try {
            labels = JSON.parse(row.labels);
          } catch (e) {
            labels = row.labels.split(',').map(l => l.trim());
          }
        } else {
          labels = row.labels;
        }
      }
      return { ...row, labels };
    }));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error!" });
  }
}

export async function getProjectKanban(req, res) {
  try {
    const { projectId } = req.params;
    const [tasks] = await pool.query(
      `SELECT * FROM tasks WHERE projects_id = ? ORDER BY id DESC`,
      [projectId]
    );

    for (const task of tasks) {
      const [subtasks] = await pool.query(
        `SELECT s.*, i.username AS intern_name
         FROM subtasks s
         JOIN intern i ON i.id = s.intern_id
         WHERE s.task_id = ?
         ORDER BY s.id DESC`,
        [task.id]
      );
      task.subtasks = subtasks.map(row => {
        let labels = [];
        if (row.labels) {
          if (typeof row.labels === 'string') {
            try {
              labels = JSON.parse(row.labels);
            } catch (e) {
              labels = row.labels.split(',').map(l => l.trim());
            }
          } else {
            labels = row.labels;
          }
        }
        return { ...row, labels };
      });
    }

    res.json(tasks);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error!" });
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

    if (!row) return res.status(400).json({ message: "Invalid task or intern!" });
    if (row.cohort_of_project !== row.cohort_of_intern) {
      return res.status(400).json({ message: "Intern is not in the project's cohort!" });
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
    res.status(500).json({ message: "Server error" });
  }
}

/* ---------------- Attendance ---------------- */
export async function getAttendance(req, res) {
  try {
    const attendance = await listAllAttendanceForAdmin();
    res.json(attendance);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error!" });
  }
}

export async function approveLeave(req, res) {
  try {
    const { id } = req.params;
    const admin_id = req.user.sub;

    const affectedRows = await approveLeaveRequest(Number(id), admin_id);

    if (affectedRows > 0) {
      res.json({ message: "Leave request approved successfully." });
    } else {
      res.status(404).json({ message: "Leave request not found or not eligible for approval." });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error!" });
  }
}

export async function rejectLeave(req, res) {
  try {
    const { id } = req.params;
    const admin_id = req.user.sub;

    const affectedRows = await rejectLeaveRequest(Number(id), admin_id);

    if (affectedRows > 0) {
      res.json({ message: "Leave request rejected successfully." });
    } else {
      res.status(404).json({ message: "Leave request not found or not eligible for rejection." });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error!" });
  }
}
