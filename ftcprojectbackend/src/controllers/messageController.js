import { createMessage, getMessagesBetweenUsers } from "../models/messageModel.js";

export async function sendMessage(req, res) {
  try {
    const sender_id = Number(req.user.sub);
    const sender_role = req.user.role.toLowerCase();
    const { receiver_id, receiver_role, text } = req.body;

    let file_name = null;
    let file_path = null;

    if (req.file) {
      file_name = req.file.originalname;
      file_path = `/uploads/messages/${req.file.filename}`;
    }

    const timestamp = new Date();

    const messagePayload = {
      sender_id,
      sender_role,
      receiver_id: Number(receiver_id),
      receiver_role: receiver_role.toLowerCase(),
      text,
      file_name,
      file_path,
      timestamp,
    };
    
    const messageId = await createMessage(messagePayload);

    res.json({
      message: "Message sent",
      newMessage: {
        id: messageId,
        sender_id,
        sender_role,
        receiver_id: Number(receiver_id),
        receiver_role: receiver_role.toLowerCase(),
        text,
        file_name,
        file_path,
        timestamp,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getChatHistory(req, res) {
  try {
    const { user1_id, user1_role, user2_id, user2_role } = req.params;

    if (
      Number(req.user.sub) !== Number(user1_id) ||
      req.user.role.toLowerCase() !== user1_role.toLowerCase()
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const messages = await getMessagesBetweenUsers(
      user1_id,
      user1_role,
      user2_id,
      user2_role
    );

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}
