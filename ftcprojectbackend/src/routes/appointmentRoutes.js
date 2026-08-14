import { Router } from "express";
import { createAppointmentPublic } from "../controllers/appointmentController.js";

const router = Router();

router.post("/", createAppointmentPublic);

export default router;