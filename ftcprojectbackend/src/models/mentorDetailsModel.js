import { pool } from "../config/db.js";
import fs from "fs";
import path from "path";

const MENTOR_UPLOAD_DIR = path.resolve("uploads/mentors");

// Helper: safely delete a file if it exists
function deleteFileIfExists(filePath) {
  if (!filePath) return;
  const fullPath = path.resolve(filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
}

/** Insert or update mentor details */
export async function upsertMentorDetails({
  mentor_id,
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
  // Check if mentor already has details
  const [existing] = await pool.query(
    "SELECT id, id_front_image, id_back_image FROM mentor_details WHERE mentor_id = ? LIMIT 1",
    [mentor_id]
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
      `UPDATE mentor_details
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

    const [[row]] = await pool.query("SELECT * FROM mentor_details WHERE id = ?", [id]);
    return row;
  }

  // New mentor details insert
  const [r] = await pool.query(
    `INSERT INTO mentor_details
      (mentor_id, full_name, nic, email, home_address, phone,
       bank_branch, bank_account_number, id_front_image, id_back_image, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Processing')`,
    [
      mentor_id,
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

  const [[row]] = await pool.query("SELECT * FROM mentor_details WHERE id = ?", [r.insertId]);
  return row;
}

/** Get mentor details by logged-in mentor */
export async function getMentorDetailsByMentorId(mentor_id) {
  const [rows] = await pool.query(
    `SELECT id, mentor_id, full_name, nic, email, home_address, phone,
            bank_branch, bank_account_number, id_front_image, id_back_image, status
     FROM mentor_details
     WHERE mentor_id = ?
     LIMIT 1`,
    [mentor_id]
  );
  return rows[0] || null;
}

/** Admin: list all mentor details */
export async function listAllMentorDetails() {
  const [rows] = await pool.query(
    `SELECT md.id, md.mentor_id, m.username AS mentor_username,
            md.full_name, md.nic, md.email, md.home_address, md.phone,
            md.bank_branch, md.bank_account_number,
            md.id_front_image, md.id_back_image, md.status
     FROM mentor_details md
     JOIN mentor m ON m.id = md.mentor_id
     ORDER BY md.id DESC`
  );
  return rows;
}

/** Admin: Approve mentor details */
export async function approveMentorDetails(id, admin_id) {
  const [r] = await pool.query(
    `UPDATE mentor_details
     SET status = 'Approved', admin_id = ?
     WHERE id = ?`,
    [admin_id, id]
  );
  return r.affectedRows;
}

/** Admin: Reject mentor details */
export async function rejectMentorDetails(id, admin_id) {
  const [r] = await pool.query(
    `UPDATE mentor_details
     SET status = 'Rejected', admin_id = ?
     WHERE id = ?`,
    [admin_id, id]
  );
  return r.affectedRows;
}
