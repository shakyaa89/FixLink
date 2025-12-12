// store/authStore.ts
import { create } from "zustand";
import { AuthApi } from "../api/Apis.ts";
import toast from "react-hot-toast";

interface AuthState {
  user: any | null;
  loading: boolean;
  checking: boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  checkAuth: () => Promise<void>;
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
      const success = { message: "Login successful" };
      return success;
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.request) {
        toast.error("Unable to reach server. Please try again later.");
      }
      set({ user: null });
    } finally {
      set({ loading: false });
    }
  },

  logout: () => {
    try {
      AuthApi.logoutApi();
      localStorage.removeItem("jwtToken");
      set({ user: null });
      toast.success("Logged out successfully");
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.request) {
        toast.error("Unable to reach server. Please try again later.");
      }
    }
  },

  checkAuth: async () => {
    set({ checking: true });
    try {
      const res = await AuthApi.checkAuthApi();
      set({ user: res.data });
    } catch (error: any) {
      console.log(error);
      set({ user: null });
    } finally {
      set({ checking: false });
    }
  },
}));
