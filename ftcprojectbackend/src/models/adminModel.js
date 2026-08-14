import { pool } from "../config/db.js";

export async function findAdminByEmailOrUsername(input) {
  const [rows] = await pool.query(
    "SELECT id, username, email, password FROM admin WHERE email = ? OR username = ? LIMIT 1",
    [input, input]
  );
  return rows[0] || null;
}

export async function findAdminById(id) {
  const [rows] = await pool.query(
    "SELECT id, username, email FROM admin WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0] || null;
}

// Now password should be already hashed before calling this function!
export async function createAdmin({ username, email, password }) {
  await pool.query(
    "INSERT INTO admin (username, email, password) VALUES (?, ?, ?)",
    [username, email, password]
  );
  return true;
}


export async function updateAdminPassword(id, newPassword) {
  await pool.query("UPDATE admin SET password = ? WHERE id = ?", [newPassword, id]);
  return true;
}

// Get all admins without password
export async function getAllAdminModel() {
  const [rows] = await pool.execute(
    "SELECT id, username, email FROM admin ORDER BY id DESC"
  );
  return rows;
}