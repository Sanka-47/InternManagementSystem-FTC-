import api from "./api";

export const submitAppointment = async ({ name, email, message }) =>
  (await api.post("/appointments", { name, email, message })).data;