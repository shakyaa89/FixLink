// store/authStore.ts
import { create } from "zustand";
import { AuthApi } from "../api/Apis.ts";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

interface AuthState {
  user: any | null;
  loading: boolean;
  checking: boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  setUser: (user: any | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  checking: true,

  login: async (email, password) => {
    set({ loading: true });
    try {
      const res = await AuthApi.loginApi({ email, password });
      localStorage.setItem("jwtToken", res.data.token);
      set({ user: res.data.user });
      toast.success(res?.data?.message);
      return res.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else if (error.request) {
          toast.error("Unable to reach server. Please try again later.");
        } else {
          toast.error(error.message || "Login failed");
        }
      } else {
        console.error("Login failed:", error);
        toast.error("Login failed");
      }
      set({ user: null });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    try {
      await AuthApi.logoutApi();
      localStorage.removeItem("jwtToken");
      set({ user: null });
      toast.success("Logged out successfully");
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else if (error.request) {
          toast.error("Unable to reach server. Please try again later.");
        }
      } else {
        console.error("Logout failed:", error);
      }
    }
  },

  checkAuth: async () => {
    set({ checking: true });
    try {
      const res = await AuthApi.checkAuthApi();
      set({ user: res.data });
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.log(error.response?.data?.message || error.message);
      } else {
        console.log(error);
      }
      set({ user: null });
    } finally {
      set({ checking: false });
    }
  },

  setUser: (user) => set({ user }),
}));
