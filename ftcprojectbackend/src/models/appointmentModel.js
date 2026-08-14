import { pool } from "../config/db.js";

export async function createAppointmentModel({ name, email, message }) {
  const [r] = await pool.query(
    `INSERT INTO appointments (name, email, message)
     VALUES (?, ?, ?)`,
    [name, email, message]
  );
  const [[row]] = await pool.query(
    `SELECT id, name, email, message, created_at
     FROM appointments WHERE id = ?`,
    [r.insertId]
  );
  return row;
}

export async function listAppointmentsModel() {
  const [rows] = await pool.query(
    `SELECT id, name, email, message, created_at
     FROM appointments
     ORDER BY created_at DESC, id DESC`
  );
  return rows;
}

export async function deleteAppointmentModel(id) {
  const [r] = await pool.query(`DELETE FROM appointments WHERE id = ?`, [id]);
  return r.affectedRows > 0;
}
