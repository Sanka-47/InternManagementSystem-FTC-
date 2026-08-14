import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { findAdminByEmailOrUsername, findAdminById, updateAdminPassword } from "../models/adminModel.js";
import { findMentorByEmailOrUsername, findMentorById } from "../models/mentorModel.js";
import { findInternByEmailOrUsername, findInternById } from "../models/internModel.js";

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || "1d" });
}

async function doLogin({ emailOrUsername, password, role }) {
  let finder;
  if (role === "admin") finder = findAdminByEmailOrUsername;
  if (role === "mentor") finder = findMentorByEmailOrUsername;
  if (role === "intern") finder = findInternByEmailOrUsername;

  const user = await finder(emailOrUsername);
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return null;

  const token = signToken({ sub: user.id, role });
  return {
    token,
    user: { id: user.id, username: user.username, email: user.email },
    role
  };
}

export async function loginAdmin(req, res) {
  const { emailOrUsername, password } = req.body || {};
  if (!emailOrUsername || !password) return res.status(400).json({ message: "Email or username and password are required!" });

  const result = await doLogin({ emailOrUsername, password, role: "admin" });
  if (!result) return res.status(401).json({ message: "Invalid credentials! Please try again." });
  return res.json(result);
}

export async function loginMentor(req, res) {
  const { emailOrUsername, password } = req.body || {};
  if (!emailOrUsername || !password) return res.status(400).json({ message: "Email or username and password are required!" });

  const result = await doLogin({ emailOrUsername, password, role: "mentor" });
  if (!result) return res.status(401).json({ message: "Invalid credentials! Please try again." });
  return res.json(result);
}

export async function loginIntern(req, res) {
  const { emailOrUsername, password } = req.body || {};
  if (!emailOrUsername || !password) return res.status(400).json({ message: "Email or username and password are required!" });

  const result = await doLogin({ emailOrUsername, password, role: "intern" });
  if (!result) return res.status(401).json({ message: "Invalid credentials! Please try again." });
  return res.json(result);
}

export async function me(req, res) {
  try {
    const { role, sub } = req.user; // set by middleware
    let fetcher;

    if (role === "admin") fetcher = findAdminById;
    else if (role === "mentor") fetcher = findMentorById;
    else if (role === "intern") fetcher = findInternById;
    else return res.status(400).json({ message: "Unknown role!" });

    const user = await fetcher(sub);
    if (!user) return res.status(404).json({ message: "User not found!" });

    return res.json({ role, user });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error!" });
  }
}

