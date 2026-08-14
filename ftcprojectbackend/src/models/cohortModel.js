import { pool } from "../config/db.js";

export async function getCohortByNameModel(name) {
  const [rows] = await pool.execute(
    "SELECT id FROM cohorts WHERE name = ? LIMIT 1",
    [name]
  );
  return rows[0] || null;
}

export async function createCohortModel({ name, start_date, end_date }) {
  const [r] = await pool.execute(
    "INSERT INTO cohorts (name, start_date, end_date) VALUES (?, ?, ?)",
    [name, start_date, end_date]
  );
  return { id: r.insertId, name, start_date, end_date };
}

export async function getAllCohortsModel() {
  const [rows] = await pool.execute(
    "SELECT id, name, start_date, end_date FROM cohorts ORDER BY id DESC"
  );
  return rows;
}

export async function getCohortByIdModel(id) {
  const [rows] = await pool.execute("SELECT id, name FROM cohorts WHERE id = ? LIMIT 1", [id]);
  return rows[0] || null;
}

export async function updateCohortModel(id, { name, start_date, end_date }) {
  const [r] = await pool.execute(
    "UPDATE cohorts SET name = ?, start_date = ?, end_date = ? WHERE id = ?",
    [name, start_date, end_date, id]
  );
  return r.affectedRows > 0;
}

export async function deleteCohortModel(id) {
  const [r] = await pool.execute("DELETE FROM cohorts WHERE id = ?", [id]);
  return r.affectedRows > 0;
}