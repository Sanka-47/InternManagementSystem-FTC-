import { pool } from "../config/db.js";
import { updateTaskStatusIfComplete } from "./taskModel.js";

export async function createSubtaskModel({ task_id, intern_id, title, work_type, labels, due_date }) {
  const [r] = await pool.execute(
    `INSERT INTO subtasks (task_id, intern_id, title, status, work_type, labels, due_date)
     VALUES (?, ?, ?, 'In Progress', ?, ?, ?)`,
    [task_id, intern_id, title, work_type, JSON.stringify(labels), due_date]
  );

  // Parent task must be In Progress
  await pool.execute(`UPDATE tasks SET status = 'In Progress' WHERE id = ?`, [task_id]);

  // Flip project to In Progress too
  const [[t]] = await pool.execute(`SELECT projects_id FROM tasks WHERE id = ?`, [task_id]);
  if (t?.projects_id) {
    await pool.execute(`UPDATE projects SET status = 'In Progress' WHERE id = ?`, [t.projects_id]);
  }

  return { id: r.insertId, task_id, intern_id, title, status: "In Progress", work_type, labels, due_date };
}

export async function getSubtasksByTaskModel(task_id) {
  const [rows] = await pool.execute(
    `SELECT s.*, i.username AS intern_name
     FROM subtasks s
     JOIN intern i ON i.id = s.intern_id
     WHERE s.task_id = ?
     ORDER BY s.id DESC`,
    [task_id]
  );
  return rows.map(row => {
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

export async function getSubtasksByInternModel(intern_id) {
  const [rows] = await pool.query(
    `SELECT s.id, s.task_id, s.title AS subtask_title, s.status,
            t.title AS task_title, t.due_date, t.priority,
            t.attachment_name, t.attachment_mime, (t.attachment_data IS NOT NULL) AS has_attachment,
            p.name AS project_name
     FROM subtasks s
     JOIN tasks t ON s.task_id = t.id
     JOIN projects p ON t.projects_id = p.id
     WHERE s.intern_id = ?`,
    [intern_id]
  );
  return rows.map(row => {
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

export async function getSubtasksByCohortModel(cohort_id) {
  const [rows] = await pool.query(
    `SELECT s.id, s.task_id, s.intern_id, s.title AS subtask_title, s.status, s.work_type, s.labels, s.due_date,
            i.username AS intern_name,
            t.title AS task_title, t.priority,
            t.attachment_name, t.attachment_mime, (t.attachment_data IS NOT NULL) AS has_attachment,
            p.name AS project_name
     FROM subtasks s
     JOIN tasks t ON s.task_id = t.id
     JOIN projects p ON t.projects_id = p.id
     JOIN intern i ON s.intern_id = i.id
     WHERE i.cohorts_id = ?`,
    [cohort_id]
  );
  return rows.map(row => {
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

/** Used by intern Kanban to move subtask status */
export async function updateSubtaskStatusModel(subtask_id, status) {
  await pool.execute(
    `UPDATE subtasks SET status = ? WHERE id = ?`,
    [status, subtask_id]
  );

  const [[sub]] = await pool.execute(
    `SELECT task_id FROM subtasks WHERE id = ?`,
    [subtask_id]
  );

  if (sub?.task_id) {
    // Recompute task status; will also roll up project status
    await updateTaskStatusIfComplete(sub.task_id);
  }
}

export async function updateSubtaskRatingModel(subtaskId, rating) {
  const [result] = await pool.query(
    "UPDATE subtasks SET rating = ? WHERE id = ?",
    [rating, subtaskId]
  );
  return result;
}

