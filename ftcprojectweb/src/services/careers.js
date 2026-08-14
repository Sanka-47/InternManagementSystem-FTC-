import api from "./api";

export const submitCareerApplication = async (formData) => {
  // formData must include: name, email, phone, message? and cv (file)
  const cfg = { headers: { "Content-Type": "multipart/form-data" } };
  return (await api.post("/careers/apply", formData, cfg)).data;
};
