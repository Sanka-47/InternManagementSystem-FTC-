import { pool } from "../config/db.js";

export async function findInternByEmailOrUsername(input) {
  const [rows] = await pool.query(
    "SELECT id, username, email, password FROM intern WHERE email = ? OR username = ? LIMIT 1",
    [input, input]
  );
  return rows[0] || null;
}

export async function findInternById(id) {
  const [rows] = await pool.query(
    `SELECT i.id, i.username, i.email, i.cohorts_id, c.name as cohort_name
     FROM intern i
     LEFT JOIN cohorts c ON c.id = i.cohorts_id
     WHERE i.id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

export async function createInternModel({ username, position, email, password, cohorts_id }) {
  const [r] = await pool.execute(
    "INSERT INTO intern (cohorts_id, username, position, email, password) VALUES (?, ?, ?, ?, ?)",
    [cohorts_id, username, position, email, password]
  );
  return { id: r.insertId, cohorts_id, username, position, email };
}

export async function getAllInternsModel() {
  const [rows] = await pool.execute(
    `SELECT i.id, i.cohorts_id, c.name AS cohort_name, i.username, i.position, i.email
     FROM intern i
     LEFT JOIN cohorts c ON c.id = i.cohorts_id
     ORDER BY i.id DESC`
  );
  return rows;
}

export async function updateInternModel(id, { cohorts_id, username, position, email, password }) {
  if (password && password.trim()) {
    const [r] = await pool.execute(
      "UPDATE intern SET cohorts_id = ?, username = ?, position = ?, email = ?, password = ? WHERE id = ?",
      [cohorts_id, username, position, email, password, id]
    );
    return r.affectedRows > 0;
  } else {
    const [r] = await pool.execute(
      "UPDATE intern SET cohorts_id = ?, username = ?, position = ?, email = ? WHERE id = ?",
      [cohorts_id, username, position, email, id]
    );
    return r.affectedRows > 0;
  }
}

export async function deleteInternModel(id) {
  const [r] = await pool.execute("DELETE FROM intern WHERE id = ?", [id]);
  return r.affectedRows > 0;
}

export async function getInternWithPasswordModel(id) {
  const [rows] = await pool.execute(
    "SELECT id, username, email, password FROM intern WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0] || null;
}

export async function getInternsByCohortModel(cohortId) {
  const [rows] = await pool.execute(
    `SELECT i.id, i.username, i.email
     FROM intern i
     WHERE i.cohorts_id = ?
     ORDER BY i.username ASC`,
    [cohortId]
  );
  return rows;
}
