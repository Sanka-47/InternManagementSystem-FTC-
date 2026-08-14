import { pool } from "../config/db.js";

export async function createProjectModel({ cohorts_id, mentor_id, admin_id, name, description, start_date, end_date }) {
  const [r] = await pool.execute(
    `INSERT INTO projects (cohorts_id, mentor_id, admin_id, name, description, start_date, end_date, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'In Progress')`,
    [cohorts_id, mentor_id ?? null, admin_id ?? null, name, description, start_date, end_date]
  );
  return { id: r.insertId, cohorts_id, mentor_id, admin_id, name, description, start_date, end_date, status: "In Progress" };
}

export async function getProjectsByMentorModel(mentor_id) {
  const [rows] = await pool.execute(
    `SELECT p.*, c.name AS cohort_name
     FROM projects p
     JOIN cohorts c ON c.id = p.cohorts_id
     WHERE p.mentor_id = ?
     ORDER BY p.id DESC`,
    [mentor_id]
  );
  return rows;
}

export async function getProjectByIdModel(id) {
  const [rows] = await pool.execute(
    `SELECT p.*, c.name AS cohort_name
     FROM projects p
     JOIN cohorts c ON c.id = p.cohorts_id
     WHERE p.id = ?`,
    [id]
  );
  return rows[0];
}

export async function getProjectsByAdminModel(admin_id) {
  const [rows] = await pool.execute(
    `SELECT p.*, c.name AS cohort_name
     FROM projects p
     JOIN cohorts c ON c.id = p.cohorts_id
     WHERE p.admin_id = ?
     ORDER BY p.id DESC`,
    [admin_id]
  );
  return rows;
}

export async function updateProjectStatusIfComplete(projects_id) {
  const [tasks] = await pool.execute(
    `SELECT status FROM tasks WHERE projects_id = ?`,
    [projects_id]
  );

  if (tasks.length === 0) {
    // No tasks: keep whatever status you already have
    return;
  }

  const allDone = tasks.every(t => t.status === "Done");
  const next = allDone ? "Done" : "In Progress";

  await pool.execute(
    `UPDATE projects SET status = ? WHERE id = ?`,
    [next, projects_id]
  );
}
