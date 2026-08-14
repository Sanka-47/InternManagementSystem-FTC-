import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import mentorRoutes from "./routes/mentorRoutes.js";
import internRoutes from "./routes/internRoutes.js";
import careersRoutes from "./routes/careersRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import mentorDetailsRoutes from "./routes/mentorDetailsRoutes.js";
import internDetailsRoutes from "./routes/internDetailsRoutes.js";
import adminDetailsRoutes from "./routes/adminDetailsRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();


// Allow frontend to talk with backend (cookies + credentials)
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

app.use(express.json());
app.use(cookieParser());

// Health check
app.get("/", (_req, res) => {
  res.send("API is running ✅");
});

// 🔹 Static folders for uploads
app.use("/uploads/tasks", express.static(path.join(__dirname, "../uploads/tasks")));
app.use("/uploads/candidates", express.static(path.join(__dirname, "../uploads/candidates")));
app.use("/uploads/messages", express.static(path.join(__dirname, "../uploads/messages")));
app.use("/uploads/mentors", express.static(path.join(__dirname, "../uploads/mentors")));
app.use("/uploads/interns", express.static(path.join(__dirname, "../uploads/interns")));

// 🔹 API Routes
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/mentor", mentorRoutes);
app.use("/intern", internRoutes);
app.use("/careers", careersRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/messages", messageRoutes);
app.use("/mentor-details", mentorDetailsRoutes); 
app.use("/intern-details", internDetailsRoutes);
app.use("/admin-details", adminDetailsRoutes);



app.get("/health", (_req, res) => res.status(200).json({ status: "OK", message: "Backend is running", timestamp: new Date().toISOString() }));


export default app;
