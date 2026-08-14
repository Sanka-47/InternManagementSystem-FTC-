import { pool } from "../config/db.js";

const ABSENT_IN_TIME = "00:00";

/** Fill all missing past days (up to yesterday) as Absent */
export async function ensureMissingAbsents(intern_id) {
  // Find the last recorded attendance date (before today)
  const [[last]] = await pool.query(
    `
    SELECT MAX(date) AS last_date
    FROM attendance
    WHERE intern_id = ? AND date < CURDATE()
    `,
    [intern_id]
  );

  const lastDate = last?.last_date ? new Date(last.last_date) : null;

  // yesterday
  const y = new Date();
  y.setHours(0, 0, 0, 0);
  y.setDate(y.getDate() - 1);

  if (!lastDate) {
    // No prior record
    return;
  }

  // Start from (lastDate + 1)
  const d = new Date(lastDate);
  d.setDate(d.getDate() + 1);

  // If start after yesterday, nothing to fill
  if (d > y) return;

  // Helper to format YYYY-MM-DD
  const fmt = (dt) => dt.toISOString().slice(0, 10);

  // Insert one day at a time
  while (d <= y) {
    const dateStr = fmt(d);
    await pool.query(
      `
      INSERT INTO attendance
        (date, check_in_time, check_out_time, status, leave_type, approval, intern_id, mentor_id, admin_id)
      SELECT
        ?, ?, NULL, 'Absent', NULL, NULL, ?, NULL, NULL
      FROM DUAL
      WHERE NOT EXISTS (
        SELECT 1 FROM attendance a
        WHERE a.intern_id = ? AND a.date = ?
      )
      `,
      [dateStr, ABSENT_IN_TIME, intern_id, intern_id, dateStr]
    );

    d.setDate(d.getDate() + 1);
  }
}

export async function checkIn(intern_id, time) {
  const [r] = await pool.query(
    `INSERT INTO attendance
       (date, check_in_time, status, intern_id)
     VALUES (CURDATE(), ?, 'Present', ?)`,
    [time, intern_id]
  );

  const [[row]] = await pool.query("SELECT * FROM attendance WHERE id = ?", [
    r.insertId,
  ]);
  return row;
}

export async function checkOut(intern_id, time) {
  const [r] = await pool.query(
    `UPDATE attendance
     SET check_out_time = ?
     WHERE intern_id = ? AND date = CURDATE()`,
    [time, intern_id]
  );

  return r.affectedRows > 0;
}

export async function updateCheckInForLeave(attendance_id, time) {
  const [r] = await pool.query(
    `UPDATE attendance
     SET check_in_time = ?, status = 'Present'
     WHERE id = ?`,
    [time, attendance_id]
  );
  return r.affectedRows;
}

/** Fix: Completed the missing checkOut update function for leave */
export async function updateCheckOutForLeave(attendance_id, time) {
  const [r] = await pool.query(
    `UPDATE attendance
     SET check_out_time = ?
     WHERE id = ?`,
    [time, attendance_id]
  );
  return r.affectedRows;
}

export async function updateCheckInForLeaveMentor(attendance_id, time) {
  const [r] = await pool.query(
    `UPDATE attendance
     SET check_in_time = ?, status = 'Present'
     WHERE id = ?`,
    [time, attendance_id]
  );
  return r.affectedRows;
}

export async function updateCheckOutForLeaveMentor(attendance_id, time) {
  const [r] = await pool.query(
    `UPDATE attendance
     SET check_out_time = ?
     WHERE id = ?`,
    [time, attendance_id]
  );
  return r.affectedRows;
}

export async function listAttendanceForIntern(intern_id, limit = 30) {
  const [rows] = await pool.query(
    `SELECT id, date, check_in_time, check_out_time, status, leave_type, approval, reason, leave_start_time, leave_end_time
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
    `SELECT id, date, check_in_time, check_out_time, status, leave_type, approval, leave_start_time, leave_end_time
     FROM attendance
     WHERE intern_id = ? AND date = CURDATE()
     LIMIT 1`,
    [intern_id]
  );
  return rows[0] || null;
}

/** List all attendance records **/
export async function listAllAttendance() {
  const [rows] = await pool.query(
    `
    SELECT
      a.id, a.date, a.check_in_time, a.check_out_time,
      a.status, a.leave_type, a.approval, a.reason, a.leave_start_time, a.leave_end_time,
      i.id AS intern_id, i.username AS intern_username,
      m.username AS mentor_username,
      c.name AS cohort_name
    FROM attendance a
    JOIN intern i ON i.id = a.intern_id
    LEFT JOIN mentor m ON m.id = a.mentor_id
    LEFT JOIN cohorts c ON c.id = i.cohorts_id
    ORDER BY a.date DESC, a.id DESC
    `
  );
  return rows;
}

export async function approveAttendanceById(attendance_id, mentor_id) {
  await pool.query(
    `UPDATE attendance
     SET approval = 'Approved', mentor_id = ?
     WHERE id = ? AND status = 'Leave'`,
    [mentor_id, attendance_id]
  );
  const [[row]] = await pool.query(
    "SELECT approval FROM attendance WHERE id = ?",
    [attendance_id]
  );
  return row; // Return the updated approval status
}

export async function rejectAttendanceById(attendance_id, mentor_id) {
  await pool.query(
    `UPDATE attendance
     SET approval = 'Rejected', mentor_id = ?
     WHERE id = ? AND status = 'Leave'`,
    [mentor_id, attendance_id]
  );
  const [[row]] = await pool.query(
    "SELECT approval FROM attendance WHERE id = ?",
    [attendance_id]
  );
  return row; // Return the updated approval status
}

export async function approveLeaveRequest(attendance_id, admin_id) {
  const [r] = await pool.query(
    `UPDATE attendance
     SET approval = 'Approved', admin_id = ?
     WHERE id = ?`,
    [admin_id, attendance_id]
  );
  return r.affectedRows;
}

export async function rejectLeaveRequest(attendance_id, admin_id) {
  const [r] = await pool.query(
    `UPDATE attendance
     SET approval = 'Rejected', admin_id = ?
     WHERE id = ?`,
    [admin_id, attendance_id]
  );
  return r.affectedRows;
}

export async function requestLeave(
  intern_id,
  mentor_id,
  leave_type,
  status,
  reason,
  startDate,
  endDate,
  startTime = null,
  endTime = null
) {
  const fmt = (dt) => dt.toISOString().slice(0, 10); // Helper to format YYYY-MM-DD
  const recordsToInsert = [];

  let current_date = new Date(startDate);
  const end_date_obj = new Date(endDate);

  while (current_date <= end_date_obj) {
    const dateStr = fmt(current_date);
    let check_in_time = null;
    let check_out_time = null;
    let leave_start_time = null;
    let leave_end_time = null;

    if (leave_type === "Short" || leave_type === "Casual-HalfDay") {
      leave_start_time = startTime;
      leave_end_time = endTime;
    }

    recordsToInsert.push([
      dateStr,
      check_in_time,
      check_out_time,
      status,
      leave_type,
      "Processing", // Initial approval status
      intern_id,
      mentor_id,
      null, // admin_id
      reason,
      leave_start_time,
      leave_end_time,
    ]);

    current_date.setDate(current_date.getDate() + 1);
  }

  if (recordsToInsert.length > 0) {
    const placeholders = recordsToInsert
      .map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .join(",");
    const values = recordsToInsert.flat();

    const [r] = await pool.query(
      `INSERT INTO attendance
         (date, check_in_time, check_out_time, status, leave_type, approval, intern_id, mentor_id, admin_id, reason, leave_start_time, leave_end_time)
       VALUES ${placeholders}`,
      values
    );
    return r.affectedRows;
  }
  return 0;
}

export async function checkInMentor(mentor_id, time) {
  const [r] = await pool.query(
    `INSERT INTO attendance
       (date, check_in_time, status, mentor_id)
     VALUES (CURDATE(), ?, 'Present', ?)`,
    [time, mentor_id]
  );

  const [[row]] = await pool.query("SELECT * FROM attendance WHERE id = ?", [
    r.insertId,
  ]);
  return row;
}

export async function checkOutMentor(mentor_id, time) {
  const [r] = await pool.query(
    `UPDATE attendance
     SET check_out_time = ?
     WHERE mentor_id = ? AND date = CURDATE()`,
    [time, mentor_id]
  );

  return r.affectedRows > 0;
}

export async function getTodayAttendanceMentor(mentor_id) {
  const [rows] = await pool.query(
    `SELECT id, date, check_in_time, check_out_time, status, leave_type, approval, leave_start_time, leave_end_time
     FROM attendance
     WHERE mentor_id = ? AND date = CURDATE()
     LIMIT 1`,
    [mentor_id]
  );
  return rows[0] || null;
}

export async function listAttendanceForMentor(mentor_id, limit = 30) {
  const [rows] = await pool.query(
    `SELECT a.id, a.date, a.check_in_time, a.check_out_time, a.status, a.leave_type, a.approval, a.reason, a.leave_start_time, a.leave_end_time, m.username as mentor_username
     FROM attendance a
     LEFT JOIN mentor m ON m.id = a.mentor_id
     WHERE a.mentor_id = ?
     ORDER BY a.date DESC, a.id DESC
     LIMIT ?`,
    [mentor_id, Number(limit)]
  );
  return rows;
}

/** List all attendance records for Admin (Interns and Mentors) **/
export async function listAllAttendanceForAdmin() {
  const [rows] = await pool.query(
    `
    SELECT
      a.id, a.date, a.check_in_time, a.check_out_time,
      a.status, a.leave_type, a.approval, a.reason, a.leave_start_time, a.leave_end_time,
      i.id AS user_id, i.username AS name,
      'Intern' AS role,
      c.name AS cohort_name
    FROM attendance a
    JOIN intern i ON i.id = a.intern_id
    LEFT JOIN cohorts c ON c.id = i.cohorts_id
    UNION
    SELECT
      a.id, a.date, a.check_in_time, a.check_out_time,
      a.status, a.leave_type, a.approval, a.reason, a.leave_start_time, a.leave_end_time,
      m.id AS user_id, m.username AS name,
      'Mentor' AS role,
      NULL AS cohort_name
    FROM attendance a
    JOIN mentor m ON m.id = a.mentor_id
    ORDER BY date DESC, id DESC
    `
  );
  return rows;
}
