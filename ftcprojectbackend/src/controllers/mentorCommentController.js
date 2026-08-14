import {
  createCommentModel,
  getCommentsByTaskModel,
  listDoneTasksForMentorModel,
  ensureTaskOwnedByMentor,
} from "../models/commentModel.js";

export async function listDoneTasksForMentor(req, res) {
  try {
    const mentor_id = req.user.sub; // from JWT
    const rows = await listDoneTasksForMentorModel(mentor_id);
    res.json(rows);
  } catch (e) {
    console.error("listDoneTasksForMentor error:", e);
    res.status(500).json({ message: "Server error" });
  }
}

export async function listCommentsForTask(req, res) {
  try {
    const { task_id } = req.params;
    const rows = await getCommentsByTaskModel(Number(task_id));
    res.json(rows);
  } catch (e) {
    console.error("listCommentsForTask error:", e);
    res.status(500).json({ message: "Server error" });
  }
}

export async function createComment(req, res) {
  try {
    const mentor_id = req.user.sub;
    const { task_id, comment_text } = req.body || {};

    if (!task_id || !comment_text?.trim()) {
      return res.status(400).json({ message: "Task id and comment are required!" });
    }

    // security: ensure the mentor owns this task via its project
    const ok = await ensureTaskOwnedByMentor(Number(task_id), mentor_id);
    if (!ok) return res.status(403).json({ message: "You cannot comment on this task!" });

    const comment = await createCommentModel({
      task_id: Number(task_id),
      mentor_id,
      comment_text: comment_text.trim(),
    });

    res.json(comment);
  } catch (e) {
    console.error("createComment error:", e);
    res.status(500).json({ message: "Server error" });
  }
}