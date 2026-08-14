import api from "./api";

export async function login(emailOrUsername, password) {
  const { data } = await api.post("/auth/admin/login", { emailOrUsername, password });
  return data; // { token, admin }
}

export async function loginMentor(emailOrUsername, password) {
  const { data } = await api.post("/auth/mentor/login", { emailOrUsername, password });
  return data; // { token, user, role: "mentor" }
}

export async function loginIntern(emailOrUsername, password) {
  const { data } = await api.post("/auth/intern/login", { emailOrUsername, password });
  return data; // { token, user, role: "intern" }
}

export async function getMe() {
  const { data } = await api.get("/auth/me");
  return data;
}
