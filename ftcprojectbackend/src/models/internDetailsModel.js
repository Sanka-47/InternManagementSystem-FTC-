import { pool } from "../config/db.js";
import fs from "fs";
import path from "path";

const INTERN_UPLOAD_DIR = path.resolve("uploads/interns");

// Helper: safely delete a file if it exists
function deleteFileIfExists(filePath) {
  if (!filePath) return;
  const fullPath = path.resolve(filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
}

/** Insert or update intern details */
export async function upsertInternDetails({
  intern_id,
  full_name,
  nic,
  email,
  home_address,
  phone,
  bank_branch,
  bank_account_number,
  id_front_image,
  id_back_image,
}) {
  // Check if intern already has details
  const [existing] = await pool.query(
    "SELECT id, id_front_image, id_back_image FROM intern_details WHERE intern_id = ? LIMIT 1",
    [intern_id]
  );

  if (existing.length) {
    const { id, id_front_image: oldFront, id_back_image: oldBack } = existing[0];

    // Delete old files if new ones are uploaded
    if (id_front_image && oldFront && oldFront !== id_front_image) {
      deleteFileIfExists(oldFront);
    }
    if (id_back_image && oldBack && oldBack !== id_back_image) {
      deleteFileIfExists(oldBack);
    }

    await pool.query(
      `UPDATE intern_details
       SET full_name = ?, nic = ?, email = ?, home_address = ?, phone = ?,
           bank_branch = ?, bank_account_number = ?, 
           id_front_image = COALESCE(?, id_front_image),
           id_back_image = COALESCE(?, id_back_image),
           status = 'Processing'
       WHERE id = ?`,
      [
        full_name,
        nic,
        email,
        home_address,
        phone,
        bank_branch,
        bank_account_number,
        id_front_image,
        id_back_image,
        id,
      ]
    );

    const [[row]] = await pool.query("SELECT * FROM intern_details WHERE id = ?", [id]);
    return row;
  }

  // New intern details insert
  const [r] = await pool.query(
    `INSERT INTO intern_details
      (intern_id, full_name, nic, email, home_address, phone,
       bank_branch, bank_account_number, id_front_image, id_back_image, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Processing')`,
    [
      intern_id,
      full_name,
      nic,
      email,
      home_address,
      phone,
      bank_branch,
      bank_account_number,
      id_front_image,
      id_back_image,
    ]
  );

  const [[row]] = await pool.query("SELECT * FROM intern_details WHERE id = ?", [r.insertId]);
  return row;
}

/** Get intern details by logged-in intern */
export async function getInternDetailsByInternId(intern_id) {
  const [rows] = await pool.query(
    `SELECT id, intern_id, full_name, nic, email, home_address, phone,
            bank_branch, bank_account_number, id_front_image, id_back_image, status
     FROM intern_details
     WHERE intern_id = ?
     LIMIT 1`,
    [intern_id]
  );
  return rows[0] || null;
}

/** Admin: list all intern details */
export async function listAllInternDetails() {
  const [rows] = await pool.query(
    `SELECT md.id, md.intern_id, m.username AS intern_username,
            md.full_name, md.nic, md.email, md.home_address, md.phone,
            md.bank_branch, md.bank_account_number,
            md.id_front_image, md.id_back_image, md.status
     FROM intern_details md
     JOIN intern m ON m.id = md.intern_id
     ORDER BY md.id DESC`
  );
  return rows;
}

/** Admin: Approve intern details */
export async function approveInternDetails(id, admin_id) {
  const [r] = await pool.query(
    `UPDATE intern_details
     SET status = 'Approved', admin_id = ?
     WHERE id = ?`,
    [admin_id, id]
  );
  return r.affectedRows;
}

/** Admin: Reject intern details */
export async function rejectInternDetails(id, admin_id) {
  const [r] = await pool.query(
    `UPDATE intern_details
     SET status = 'Rejected', admin_id = ?
     WHERE id = ?`,
    [admin_id, id]
  );
  return r.affectedRows;
}
