import { pool } from "../config/db.js";

// Insert new candidate
export async function insertCandidate(payload) {
  const {
    name, email, phone,
    cv_original_name, cv_mime, cv_size,
    cv_stored_name, cv_stored_path, cv_data
  } = payload;

  const [r] = await pool.query(
    `INSERT INTO candidates
     (name, email, phone,
      cv_original_name, cv_mime, cv_size,
      cv_stored_name, cv_stored_path, cv_data)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, email, phone,
     cv_original_name, cv_mime, cv_size,
     cv_stored_name, cv_stored_path, cv_data]
  );

  const [[row]] = await pool.query("SELECT * FROM candidates WHERE id = ?", [r.insertId]);
  return row;
}

// List all candidates (admin)
export async function listCandidatesModel() {
  const [rows] = await pool.query(
    `SELECT id, name, email, phone, created_at,
            cv_original_name, cv_size
     FROM candidates
     ORDER BY id DESC`
  );
  return rows;
}

// Get candidate by ID
export async function getCandidateByIdModel(id) {
  const [[row]] = await pool.query(
    `SELECT *
     FROM candidates
     WHERE id = ?
     LIMIT 1`,
    [id]
  );
  return row || null;
}

// Delete candidate by ID (admin)
export async function deleteCandidateModel(id) {
  const [r] = await pool.query("DELETE FROM candidates WHERE id = ?", [id]);
  return r.affectedRows > 0;
}
