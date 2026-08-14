import { pool } from "../config/db.js";

// Create a comment as a mentor
export async function createCommentModel({ task_id, mentor_id, comment_text }) {
  // Insert
  const [r] = await pool.execute(
    `INSERT INTO comments (comment_text, task_id, mentor_id, admin_id)
     VALUES (?, ?, ?, NULL)`,
    [comment_text, task_id, mentor_id]
  );

  // Fetch the inserted comment with names
  const [[row]] = await pool.execute(
    `SELECT c.id, c.comment_text, c.task_id, c.mentor_id, c.admin_id, c.created_at,
            m.username AS mentor_name,
            a.username AS admin_name
     FROM comments c
     LEFT JOIN mentor m ON m.id = c.mentor_id
     LEFT JOIN admin  a ON a.id = c.admin_id
     WHERE c.id = ?`,
    [r.insertId]
  );

  // Normalize created_at to ISO so the client can format it reliably
  return {
    ...row,
    created_at: row?.created_at ? new Date(row.created_at).toISOString() : null,
  };
}

// Create a comment as a admin
export async function createCommentModelByAdmin({ task_id, admin_id, comment_text }) {
  // Insert
  const [r] = await pool.execute(
    `INSERT INTO comments (comment_text, task_id, mentor_id, admin_id)
     VALUES (?, ?, NULL, ?)`,
    [comment_text, task_id, admin_id]
  );

  // Fetch the inserted comment with names
  const [[row]] = await pool.execute(
    `SELECT c.id, c.comment_text, c.task_id, c.mentor_id, c.admin_id, c.created_at,
            m.username AS mentor_name,
            a.username AS admin_name
     FROM comments c
     LEFT JOIN mentor m ON m.id = c.mentor_id
     LEFT JOIN admin  a ON a.id = c.admin_id
     WHERE c.id = ?`,
    [r.insertId]
  );

  // Normalize created_at to ISO so the client can format it reliably
  return {
    ...row,
    created_at: row?.created_at ? new Date(row.created_at).toISOString() : null,
  };
}

// Get all comments for a task (both mentor and admin comments)
export async function getCommentsByTaskModel(task_id) {
  const [rows] = await pool.execute(
    `SELECT c.id, c.comment_text, c.task_id, c.mentor_id, c.admin_id, c.created_at,
            m.username AS mentor_name,
            a.username AS admin_name
     FROM comments c
     LEFT JOIN mentor m ON m.id = c.mentor_id
     LEFT JOIN admin  a ON a.id = c.admin_id
     WHERE c.task_id = ?
     ORDER BY c.created_at ASC, c.id ASC`,
    [task_id]
  );

  return rows.map(r => ({
    ...r,
    created_at: r?.created_at ? new Date(r.created_at).toISOString() : null,
  }));
}

// List all DONE tasks for a specific mentor, with project name
export async function listDoneTasksForMentorModel(mentor_id) {
  const [rows] = await pool.execute(
    `SELECT t.id AS task_id, t.title AS task_title, t.status AS task_status,
            t.priority, t.due_date,
            p.id AS project_id, p.name AS project_name
     FROM tasks t
     JOIN projects p ON p.id = t.projects_id
     WHERE t.status = 'Done'
       AND p.mentor_id = ?
     ORDER BY t.id DESC`,
    [mentor_id]
  );
  return rows;
}

// List all DONE tasks for a specific admin, with project name
export async function listDoneTasksForAdminModel(admin_id) {
  const [rows] = await pool.execute(
    `SELECT t.id AS task_id, t.title AS task_title, t.status AS task_status,
            t.priority, t.due_date,
            p.id AS project_id, p.name AS project_name
     FROM tasks t
     JOIN projects p ON p.id = t.projects_id
     WHERE t.status = 'Done'
       AND p.admin_id = ?
     ORDER BY t.id DESC`,
    [admin_id]
  );
  return rows;
}

// Ensure the task belongs to the logged mentor (security guard)
export async function ensureTaskOwnedByMentor(task_id, mentor_id) {
  const [[row]] = await pool.execute(
    `SELECT t.id
     FROM tasks t
     JOIN projects p ON p.id = t.projects_id
     WHERE t.id = ? AND p.mentor_id = ?`,
    [task_id, mentor_id]
  );
  return !!row;
}

// Ensure the task belongs to the logged admin (security guard)
export async function ensureTaskOwnedByAdmin(task_id, admin_id) {
  const [[row]] = await pool.execute(
    `SELECT t.id
     FROM tasks t
     JOIN projects p ON p.id = t.projects_id
     WHERE t.id = ? AND p.admin_id = ?`,
    [task_id, admin_id]
  );
  return !!row;
}

