import { pool } from "../config/db.js";
import {
  listAllAttendance,
  approveAttendanceById,
  rejectAttendanceById,
  checkInMentor,
  checkOutMentor,
  getTodayAttendanceMentor,
  listAttendanceForMentor,
  requestLeave,
  updateCheckInForLeaveMentor,
  updateCheckOutForLeaveMentor,
} from "../models/attendanceModel.js";

export async function getAllAttendance(req, res) {
  try {
    const rows = await listAllAttendance();
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}

export async function approveLeave(req, res) {
  try {
    const { id } = req.params;
    const mentor_id = req.user?.sub;     // approver mentor id from JWT
    if (!mentor_id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const affected = await approveAttendanceById(Number(id), Number(mentor_id));
    if (!affected) {
      return res.status(400).json({ message: "Cannot approve: invalid record or not a leave" });
    }
    res.json({ ok: true, approval: "Approved", mentor_id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}

export async function rejectLeave(req, res) {
  try {
    const { id } = req.params;
    const mentor_id = req.user?.sub;     // approver mentor id from JWT
    if (!mentor_id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const affected = await rejectAttendanceById(Number(id), Number(mentor_id));
    if (!affected) {
      return res.status(400).json({ message: "Cannot rejected: invalid record or not a leave" });
    }
    res.json({ ok: true, approval: "Rejected", mentor_id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}

export async function checkInMentorController(req, res) {
  try {
    const mentor_id = req.user.sub;
    const { time } = req.body;

    const todayAttendance = await getTodayAttendanceMentor(mentor_id);

    if (
      todayAttendance &&
      (todayAttendance.leave_type === "Casual-HalfDay" ||
        todayAttendance.leave_type === "Short")
    ) {
      await updateCheckInForLeaveMentor(todayAttendance.id, time);
      const [[row]] = await pool.query(
        "SELECT * FROM attendance WHERE id = ?",
        [todayAttendance.id]
      );
      return res.json(row);
    } else {
      const row = await checkInMentor(mentor_id, time);
      return res.json(row);
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}

export async function checkOutMentorController(req, res) {
  try {
    const mentor_id = req.user.sub;
    const { time } = req.body;

    const todayAttendance = await getTodayAttendanceMentor(mentor_id);

    if (todayAttendance) {
      await updateCheckOutForLeaveMentor(todayAttendance.id, time);
      return res.json({ message: "Checked out successfully" });
    } else {
      // This case should ideally not happen if check-in is mandatory before check-out
      return res.status(400).json({ message: "No check-in found for today." });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}

export async function myAttendanceTodayMentor(req, res) {
  try {
    const mentor_id = req.user.sub;
    const row = await getTodayAttendanceMentor(mentor_id);
    res.json(row || null);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}

export async function myAttendanceListMentor(req, res) {
  try {
    const mentor_id = req.user.sub;
    const limit = Number(req.query.limit || 30);
    const rows = await listAttendanceForMentor(mentor_id, limit);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}

export async function requestLeaveController(req, res) {
  try {
    const mentor_id = req.user.sub;
    const { leave_type, status, reason, startDate, endDate, startTime, endTime } =
      req.body;

    if (!leave_type || !status || !reason || !startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "Missing required leave details." });
    }

    const affectedRows = await requestLeave(
      null, // intern_id is null for mentors
      mentor_id,
      leave_type,
      status,
      reason,
      startDate,
      endDate,
      startTime,
      endTime
    );

    if (affectedRows > 0) {
      res
        .status(201)
        .json({ message: "Leave request submitted successfully." });
    } else {
      res.status(500).json({ message: "Failed to submit leave request." });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error!" });
  }
}
