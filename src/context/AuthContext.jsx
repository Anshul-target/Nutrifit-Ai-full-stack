import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);
const API_BASE_URL = "http://localhost:5000/api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("idle");
  const navigate = useNavigate();
  const [token, setToken] = useState(null);

  // Restore session from localStorage on app load
  useEffect(() => {
    const storedToken = localStorage.getItem("nutrifit_token");
    const storedUser = localStorage.getItem("nutrifit_user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async ({ email, password }) => {
    setStatus("loading");
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        setStatus("error");
        return { success: false, message: error.message || "Login failed" };
      }

      const data = await response.json();
      const userData = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
      };

      setToken(data.token);
      setUser(userData);
      localStorage.setItem("nutrifit_token", data.token);
      localStorage.setItem("nutrifit_user", JSON.stringify(userData));
      setStatus("success");
      return { success: true };
    } catch (err) {
      setStatus("error");
      return { success: false, message: err.message };
    }
  };

  const signup = async ({ name, email, password }) => {
    setStatus("loading");
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        setStatus("error");
        return { success: false, message: error.message || "Signup failed" };
      }

      const data = await response.json();
      const userData = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
      };

      setToken(data.token);
      setUser(userData);
      localStorage.setItem("nutrifit_token", data.token);
      localStorage.setItem("nutrifit_user", JSON.stringify(userData));
      setStatus("success");
      return { success: true };
    } catch (err) {
      setStatus("error");
      return { success: false, message: err.message };
    }
  };

  const forgotPassword = async (email) => {
    setStatus("loading");
    await new Promise((resolve) => setTimeout(resolve, 700));
    setStatus("success");
    return {
      success: true,
      message: "A reset link was sent to your email.",
    };
  };

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem("nutrifit_user", JSON.stringify(updatedUser));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("nutrifit_token");
    localStorage.removeItem("nutrifit_user");
    setStatus("idle");
    navigate("/");
  };

  const value = useMemo(
    () => ({
      user,
      status,
      login,
      signup,
      forgotPassword,
      logout,
      token,
      updateUser,
    }),
    [user, status, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
