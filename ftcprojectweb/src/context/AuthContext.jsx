import { createContext, useContext, useEffect, useState } from "react";
import { getMe } from "../services/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // "admin" | "mentor" | "intern"
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("ims_token");
    if (!token) { setLoading(false); return; }
    getMe()
      .then(({ role, user }) => { setRole(role); setUser(user); })
      .catch(() => { localStorage.removeItem("ims_token"); })
      .finally(() => setLoading(false));
  }, []);

  const logout = () => {
    localStorage.removeItem("ims_token");
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, setUser, setRole, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
