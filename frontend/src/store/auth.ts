import { create } from "zustand";
import { api } from "@/lib/api";

type User = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: "administrator" | "customer";
};

type AuthState = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ token: string; user: User; redirect_to?: string }>;
  logout: () => void;
  fetchMe: () => Promise<void>;
};

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  token: null,

  async login(email, password) {
    const data = await api("/login", { method: "POST", body: { email, password } });
    localStorage.setItem("token", data.token);
    set({ token: data.token, user: data.user });
    return data;
  },

  logout() {
    const token = localStorage.getItem("token");
    if (token) api("/logout", { method: "POST", authToken: token }).catch(() => {});
    localStorage.removeItem("token");
    set({ user: null, token: null });
  },

  async fetchMe() {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const user = await api("/me", { authToken: token });
      set({ user, token });
    } catch {
      localStorage.removeItem("token");
      set({ user: null, token: null });
    }
  },
}));
