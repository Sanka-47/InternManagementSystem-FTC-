import {
  listAllMentorDetails,
  approveMentorDetails,
  rejectMentorDetails,
} from "../models/mentorDetailsModel.js";

import {
  listAllInternDetails,
  approveInternDetails,
  rejectInternDetails,
} from "../models/internDetailsModel.js";

/* -------------------------------------- Mentor Details ------------------------------ */
export async function getAllMentorDetails(req, res) {
  try {
    const rows = await listAllMentorDetails();
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}

export async function approveMentor(req, res) {
  try {
    const { id } = req.params;
    const admin_id = req.user?.sub; // from JWT
    if (!admin_id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const affected = await approveMentorDetails(Number(id), Number(admin_id));
    if (!affected) {
      return res.status(400).json({ message: "Cannot approve: invalid record" });
    }
    res.json({ ok: true, status: "Approved", admin_id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}

export async function rejectMentor(req, res) {
  try {
    const { id } = req.params;
    const admin_id = req.user?.sub; // from JWT
    if (!admin_id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const affected = await rejectMentorDetails(Number(id), Number(admin_id));
    if (!affected) {
      return res.status(400).json({ message: "Cannot reject: invalid record" });
    }
    res.json({ ok: true, status: "Rejected", admin_id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}

/* -------------------------------------- Intern Details ------------------------------ */
export async function getAllInternDetails(req, res) {
  try {
    const rows = await listAllInternDetails();
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}

export async function approveIntern(req, res) {
  try {
    const { id } = req.params;
    const admin_id = req.user?.sub; // from JWT
    if (!admin_id) {
      return res.status(401).json({ message: "Unauthorized!" });
    }

    const affected = await approveInternDetails(Number(id), Number(admin_id));
    if (!affected) {
      return res.status(400).json({ message: "Cannot approve: invalid record" });
    }
    res.json({ ok: true, status: "Approved!", admin_id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error!" });
  }
}

export async function rejectIntern(req, res) {
  try {
    const { id } = req.params;
    const admin_id = req.user?.sub; // from JWT
    if (!admin_id) {
      return res.status(401).json({ message: "Unauthorized!" });
    }

    const affected = await rejectInternDetails(Number(id), Number(admin_id));
    if (!affected) {
      return res.status(400).json({ message: "Cannot reject: invalid record!" });
    }
    res.json({ ok: true, status: "Rejected!", admin_id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error!" });
  }
}