import {
  checkIn as checkInModel,
  checkOut as checkOutModel,
  listAttendanceForIntern,
  getTodayAttendance,
  ensureMissingAbsents,
  updateCheckInForLeave,
  updateCheckOutForLeave,
} from "../models/attendanceModel.js";

export async function checkIn(req, res) {
  try {
    const intern_id = req.user.sub;
    const { time } = req.body;

    // Fetch today's attendance to check for existing leave records
    const todayRecord = await getTodayAttendance(intern_id);

    let row;
    if (todayRecord && (todayRecord.leave_type === "Short" || todayRecord.leave_type === "Casual-HalfDay") && !todayRecord.check_in_time) {
      // Update existing leave record with check-in time
      await updateCheckInForLeave(todayRecord.id, time);
      row = { ...todayRecord, check_in_time: time, status: "Present" }; // Simulate updated row
    } else {
      // Create a new attendance record
      row = await checkInModel(intern_id, time);
    }
    return res.json(row);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}

export async function checkOut(req, res) {
  try {
    const intern_id = req.user.sub;
    const { time } = req.body;

    // Fetch today's attendance to check for existing leave records
    const todayRecord = await getTodayAttendance(intern_id);

    if (todayRecord && (todayRecord.leave_type === "Short" || todayRecord.leave_type === "Casual-HalfDay") && todayRecord.check_in_time && !todayRecord.check_out_time) {
      // Update existing leave record with check-out time
      await updateCheckOutForLeave(todayRecord.id, time);
    } else {
      // Update general check-out
      await checkOutModel(intern_id, time);
    }
    return res.json({ message: "Checked out successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}

export async function myAttendanceList(req, res) {
  try {
    const intern_id = req.user.sub;
    // Fill gaps before listing
    await ensureMissingAbsents(intern_id);

    const limit = Number(req.query.limit || 30);
    const rows = await listAttendanceForIntern(intern_id, limit);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}

export async function myAttendanceToday(req, res) {
  try {
    const intern_id = req.user.sub;
    // Fill gaps before reading today
    await ensureMissingAbsents(intern_id);

    const row = await getTodayAttendance(intern_id);
    res.json(row || null);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}
