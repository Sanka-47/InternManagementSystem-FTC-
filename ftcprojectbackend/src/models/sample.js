import { pool } from "../config/db.js";

const ABSENT_IN_TIME = "00:00";  
const ABSENT_OUT_TIME = "00:00";

export async function ensureYesterdayAbsent(intern_id) {
  await pool.query(
    `
    INSERT INTO attendance
      (date, check_in_time, check_out_time, status, leave_type, approval, intern_id, mentor_id, admin_id)
    SELECT
      (CURDATE() - INTERVAL 1 DAY), ?, ?, 'Absent', NULL, NULL, ?, NULL, NULL
    FROM DUAL
    WHERE NOT EXISTS (
      SELECT 1
      FROM attendance a
      WHERE a.intern_id = ?
        AND a.date = (CURDATE() - INTERVAL 1 DAY)
    )
    `,
    [ABSENT_IN_TIME, ABSENT_OUT_TIME, intern_id, intern_id]
  );
}

export async function upsertInternAttendance({
  intern_id,
  // check_in_time, // we use fixed below
  check_out_time,
  status,      // "Present" | "Absent" | "Half-day" | "Leave"
  leave_type,  // null | "Casual" | "Sick" | "Unpaid"
}) {
  const FIXED_IN_TIME = "08:30";
  const effectiveLeaveType = status === "Leave" ? (leave_type || "Casual") : null;
  const approval = status === "Leave" ? "Processing" : null;

  const [existing] = await pool.query(
    "SELECT id FROM attendance WHERE intern_id = ? AND date = CURDATE() LIMIT 1",
    [intern_id]
  );

  if (existing.length) {
    const id = existing[0].id;
    await pool.query(
      `UPDATE attendance
         SET check_in_time = ?, check_out_time = ?, status = ?, leave_type = ?, approval = ?
       WHERE id = ?`,
      [FIXED_IN_TIME, check_out_time || null, status, effectiveLeaveType, approval, id]
    );
    const [[row]] = await pool.query("SELECT * FROM attendance WHERE id = ?", [id]);
    return row;
  }

  const [r] = await pool.query(
    `INSERT INTO attendance
       (date, check_in_time, check_out_time, status, leave_type, approval, intern_id, mentor_id, admin_id)
     VALUES (CURDATE(), ?, ?, ?, ?, ?, ?, NULL, NULL)`,
    [FIXED_IN_TIME, check_out_time || null, status, effectiveLeaveType, approval, intern_id]
  );

  const [[row]] = await pool.query("SELECT * FROM attendance WHERE id = ?", [r.insertId]);
  return row;
}

export async function listAttendanceForIntern(intern_id, limit = 30) {
  const [rows] = await pool.query(
    `SELECT id, date, check_in_time, check_out_time, status, leave_type, approval
     FROM attendance
     WHERE intern_id = ?
     ORDER BY date DESC, id DESC
     LIMIT ?`,
    [intern_id, Number(limit)]
  );
  return rows;
}

export async function getTodayAttendance(intern_id) {
  const [rows] = await pool.query(
    `SELECT id, date, check_in_time, check_out_time, status, leave_type, approval
     FROM attendance
     WHERE intern_id = ? AND date = CURDATE()
     LIMIT 1`,
    [intern_id]
  );
  return rows[0] || null;
}

/** List all attendance records (all interns, no auth filtering) */
export async function listAllAttendance() {
  const [rows] = await pool.query(
    `
    SELECT
      a.id, a.date, a.check_in_time, a.check_out_time,
      a.status, a.leave_type, a.approval,
      i.id AS intern_id, i.username AS intern_username,
      c.name AS cohort_name
    FROM attendance a
    JOIN intern i ON i.id = a.intern_id
    LEFT JOIN cohorts c ON c.id = i.cohorts_id
    ORDER BY a.date DESC, a.id DESC
    `
  );
  return rows;
}

export async function approveAttendanceById(attendance_id, mentor_id) {
  const [r] = await pool.query(
    `UPDATE attendance
     SET approval = 'Approved', mentor_id = ?
     WHERE id = ? AND status = 'Leave'`,
    [mentor_id, attendance_id]
  );
  return r.affectedRows;
}

export async function rejectAttendanceById(attendance_id, mentor_id) {
  const [r] = await pool.query(
    `UPDATE attendance
     SET approval = 'Rejected', mentor_id = ?
     WHERE id = ? AND status = 'Leave'`,
    [mentor_id, attendance_id]
  );
  return r.affectedRows;
}
