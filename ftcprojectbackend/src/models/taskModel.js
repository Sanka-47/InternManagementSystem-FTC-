import { pool } from "../config/db.js";
import { updateProjectStatusIfComplete } from "./projectModel.js";

export async function createTaskModel({ projects_id, mentor_id, admin_id, title, description, priority, due_date, attachment,}) {
  const [r] = await pool.execute(
    `INSERT INTO tasks (projects_id, mentor_id, admin_id, title, description, status, priority, due_date, attachment_name, attachment_mime, attachment_data)
     VALUES (?, ?, ?, ?, ?, 'In Progress', ?, ?, ?, ?, ?)`,
    [projects_id, mentor_id ?? null, admin_id ?? null, title, description, priority, due_date, attachment?.name ?? null, attachment?.mime ?? null, attachment?.buffer ?? null]
  );

  // New task exists → project cannot be Done
  await pool.execute(`UPDATE projects SET status = 'In Progress' WHERE id = ?`, [projects_id]);

  return { id: r.insertId, projects_id, mentor_id, admin_id, title, description, priority, due_date, status: "In Progress", attachment_name: attachment?.name ?? null};
}

export async function getTasksByProjectModel(projects_id) {
  const [rows] = await pool.execute(
    `SELECT id, projects_id, mentor_id, admin_id, title, description, status, priority, due_date,
            attachment_name, (attachment_data IS NOT NULL) AS has_attachment
     FROM tasks
     WHERE projects_id = ?
     ORDER BY id DESC`,
    [projects_id]
  );
  return rows;
}

export async function getTaskAttachmentModel(task_id) {
  const [[row]] = await pool.execute(
    `SELECT attachment_name, attachment_mime, attachment_data
     FROM tasks WHERE id = ? LIMIT 1`,
    [task_id]
  );
  return row || null;
}

/** Recalculate a task's status from its subtasks and then update project status */
export async function updateTaskStatusIfComplete(task_id) {
  // get parent project id
  const [[taskRow]] = await pool.execute(
    `SELECT projects_id FROM tasks WHERE id = ?`,
    [task_id]
  );
  const project_id = taskRow?.projects_id;

  // recompute task status from its subtasks
  const [subs] = await pool.execute(
    `SELECT status FROM subtasks WHERE task_id = ?`,
    [task_id]
  );

  if (subs.length > 0) {
    const allDone = subs.every(s => s.status === "Done");
    const nextTaskStatus = allDone ? "Done" : "In Progress";
    await pool.execute(`UPDATE tasks SET status = ? WHERE id = ?`, [nextTaskStatus, task_id]);
  }
  // if no subtasks, we leave task status as-is

  // finally, roll up to project
  if (project_id) {
    await updateProjectStatusIfComplete(project_id);
  }
}
