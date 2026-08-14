import api from "./api";

export const fetchChatHistory = (user1_id, user1_role, user2_id, user2_role) =>
  api.get(`/messages/history/${user1_id}/${user1_role}/${user2_id}/${user2_role}`)
    .then(res => res.data);

export const sendMessageToApi = (payload) => {
  const formData = new FormData();
  formData.append("receiver_id", payload.receiver_id);
  formData.append("receiver_role", payload.receiver_role);
  formData.append("text", payload.text);
  if (payload.file) formData.append("file", payload.file);

  return api.post("/messages/send", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then(res => res.data);
};
