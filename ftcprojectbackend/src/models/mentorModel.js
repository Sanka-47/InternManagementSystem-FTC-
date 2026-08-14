import { pool } from "../config/db.js";

export async function findMentorByEmailOrUsername(input) {
  const [rows] = await pool.query(
    "SELECT id, username, email, password FROM mentor WHERE email = ? OR username = ? And status = 'Active' LIMIT 1",
    [input, input]
  );
  return rows[0] || null;
}

export async function findMentorById(id) {
  const [rows] = await pool.query(
    "SELECT id, username, email FROM mentor WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0] || null;
}

export async function createMentorModel({ username, email, password }) {
  const [r] = await pool.execute(
    "INSERT INTO mentor (username, email, password) VALUES (?, ?, ?)",
    [username, email, password]
  );
  return { id: r.insertId, username, email };
}

export async function getAllMentorsModel() {
  const [rows] = await pool.execute(
    "SELECT id, username, email FROM mentor ORDER BY id DESC"
  );
  return rows;
}

export async function updateMentorModel(id, { username, email, password }) {
  if (password && password.trim()) {
    const [r] = await pool.execute(
      "UPDATE mentor SET username = ?, email = ?, password = ? WHERE id = ?",
      [username, email, password, id]
    );
    return r.affectedRows > 0;
  } else {
    const [r] = await pool.execute(
      "UPDATE mentor SET username = ?, email = ? WHERE id = ?",
      [username, email, id]
    );
    return r.affectedRows > 0;
  }
}

export async function deleteMentorModel(id) {
  const [r] = await pool.execute(
    "UPDATE mentor SET status = 'Deactive' WHERE id = ?",
    [id]
  );
  return r.affectedRows > 0;
}
