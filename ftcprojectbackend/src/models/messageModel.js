import { pool } from "../config/db.js";

export async function createMessage({
  sender_id,
  sender_role,
  receiver_id,
  receiver_role,
  text,
  file_name,
  file_path,
  timestamp
}) {
  const [result] = await pool.execute(
    `INSERT INTO messages 
      (sender_id, sender_role, receiver_id, receiver_role, text, file_name, file_path, timestamp)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      sender_id,
      sender_role.toLowerCase(),
      receiver_id,
      receiver_role.toLowerCase(),
      text,
      file_name,
      file_path,
      timestamp,
    ]
  );
  return result.insertId;
}

export async function getMessagesBetweenUsers(user1_id, user1_role, user2_id, user2_role) {
  const [rows] = await pool.execute(
    `SELECT * FROM messages 
     WHERE (sender_id = ? AND sender_role = ? AND receiver_id = ? AND receiver_role = ?)
        OR (sender_id = ? AND sender_role = ? AND receiver_id = ? AND receiver_role = ?)
     ORDER BY timestamp ASC`,
    [
      Number(user1_id), user1_role.toLowerCase(),
      Number(user2_id), user2_role.toLowerCase(),
      Number(user2_id), user2_role.toLowerCase(),
      Number(user1_id), user1_role.toLowerCase(),
    ]
  );
  return rows;
}
