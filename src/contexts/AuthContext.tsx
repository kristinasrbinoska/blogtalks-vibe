import React, { createContext, useContext, useState, useEffect } from "react";
import { decodeToken, useJwt } from "react-jwt";

export interface User {
  userId: string;
  email: string;
  name: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (
    email: string,
    username: string,
    password: string
  ) => Promise<void>;
  register: (
    email: string,
    username: string,
    name: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  fetchWithAuth: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { decodedToken, isExpired } = useJwt(token);

  const API_URL = import.meta.env.VITE_API_URL;

  // Decode token and set user from claims
  useEffect(() => {
    if (token) {
      const myDecodedToken: any = decodeToken(token);
      if (myDecodedToken) {
        const uniqueName = myDecodedToken["unique_name"];
        const email = myDecodedToken["email"] ?? "";
        const userId = myDecodedToken["userId"] ?? "";

        const newUser: User = {
          userId,
          email,
          name: uniqueName ?? "",
        };

        setUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));
      }
    }
  }, [token]);

  // Load user & token from localStorage on app start
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken) setToken(storedToken);

    if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Failed to parse user from localStorage:", err);
        localStorage.removeItem("user");
        setUser(null);
      }
    }

    setIsLoading(false);
  }, []);

  const login = async (
    email: string,
    username: string,
    password: string
  ) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/User/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Email: email, Username: username, Password: password }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.message || `Login failed (status ${res.status})`);
      }

      const data = await res.json();

      const newToken = data?.result?.token ?? data?.token;
      const apiUser = data?.result?.user ?? data?.user ?? null;

      if (!newToken) throw new Error("No token returned from API");

      // Save token
      setToken(newToken);
      localStorage.setItem("token", newToken);

      // If API sends user → use it. Else → decode token.
      if (apiUser) {
        setUser(apiUser);
        localStorage.setItem("user", JSON.stringify(apiUser));
      } else {
        const decoded: any = decodeToken(newToken);
        const fallbackUser: User = {
          userId: decoded?.userId ?? "",
          email: decoded?.email ?? "",
          name: decoded?.unique_name ?? "",
        };
        setUser(fallbackUser);
        localStorage.setItem("user", JSON.stringify(fallbackUser));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    username: string,
    name: string,
    password: string
  ) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/User/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Email: email,
          Username: username,
          Name: name,
          Password: password,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.message || `Registration failed (status ${res.status})`);
      }

      alert("User registered successfully! Please login.");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const fetchWithAuth = async (input: RequestInfo, init?: RequestInit) => {
    const headers = {
      ...init?.headers,
      Authorization: token ? `Bearer ${token}` : undefined,
      "Content-Type": "application/json",
    };
    return fetch(input, { ...init, headers });
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, isLoading, fetchWithAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};
