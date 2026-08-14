import {
  createAppointmentModel,
  listAppointmentsModel,
  deleteAppointmentModel,
} from "../models/appointmentModel.js";

/* --------- anyone can create an appointment --------- */
export async function createAppointmentPublic(req, res) {
  try {
    const { name, email, message } = req.body || {};
    if (!name || !email || !message) {
      return res.status(400).json({ message: "Name, email and message are required!" });
    }
    const row = await createAppointmentModel({ name, email, message });
    res.json({ message: "Appointment submitted!", appointment: row });
  } catch (e) {
    console.error("createAppointmentPublic error:", e);
    res.status(500).json({ message: "Server error" });
  }
}

/* --------- ADMIN: list all --------- */
export async function adminListAppointments(_req, res) {
  try {
    const rows = await listAppointmentsModel();
    res.json(rows);
  } catch (e) {
    console.error("adminListAppointments error:", e);
    res.status(500).json({ message: "Server error" });
  }
}

/* --------- ADMIN: delete by id --------- */
export async function adminDeleteAppointment(req, res) {
  try {
    const { id } = req.params;
    const ok = await deleteAppointmentModel(Number(id));
    if (!ok) return res.status(404).json({ message: "Appointment not found" });
    res.json({ message: "Deleted" });
  } catch (e) {
    console.error("adminDeleteAppointment error:", e);
    res.status(500).json({ message: "Server error" });
  }
}
