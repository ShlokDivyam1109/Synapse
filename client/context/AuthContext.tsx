import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "admin";
  instituteId: string;
  studentId?: string;
  department?: string;
  year?: string;
  contact?: string;
  bloodGroup?: string;
  fatherName?: string;
  motherName?: string;
  fatherContact?: string;
  motherContact?: string;
  address?: string;
  dateOfBirth?: string;
  guardianName?: string;
  emergencyContact?: string;
}

interface SignupPayload {
  name: string;
  email: string;
  password: string;
  instituteId: string;
  studentId?: string;
  department?: string;
  year?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signup: (payload: SignupPayload) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on load so a page refresh doesn't log the user out.
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setUser(normalizeUser(data.user));
        }
      } catch {
        // not logged in / network error — leave user as null
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || "Login failed" };
      }
      setUser(normalizeUser(data.user));
      return { success: true, message: "Login successful" };
    } catch {
      return { success: false, message: "Network error, please try again" };
    }
  };

  const signup = async (payload: SignupPayload) => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || "Signup failed" };
      }
      setUser(normalizeUser(data.user));
      return { success: true, message: "Account created" };
    } catch {
      return { success: false, message: "Network error, please try again" };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, login, signup, logout, isAuthenticated: !!user, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

function normalizeUser(raw: any): User {
  return {
    id: raw._id ?? raw.id,
    name: raw.name,
    email: raw.email,
    role: raw.role,
    instituteId: raw.instituteId,
    studentId: raw.studentId,
    department: raw.department,
    year: raw.year,
    contact: raw.contact,
    bloodGroup: raw.bloodGroup,
    fatherName: raw.fatherName,
    motherName: raw.motherName,
    fatherContact: raw.fatherContact,
    motherContact: raw.motherContact,
    address: raw.address,
    dateOfBirth: raw.dateOfBirth,
    guardianName: raw.guardianName,
    emergencyContact: raw.emergencyContact,
  };
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
