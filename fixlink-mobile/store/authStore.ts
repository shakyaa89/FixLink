import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { AuthApi } from '../api/Apis';
import { User } from 'lucide-react-native';

interface AuthState {
  user: any | null;
  loading: boolean;
  checking: boolean;
  authInitialized: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: any | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  checking: false,
  authInitialized: false,

  login: async (email, password) => {
    set({ loading: true });
    try {
      const res = await AuthApi.loginApi({ email, password });

      await AsyncStorage.setItem('jwtToken', res.data.token);
      set({ user: res.data.user, authInitialized: true });
      Toast.show({
        type: 'success',
        text1: res.data.message ?? 'Login successful',
      });

      return true;
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1:
          error?.response?.data?.message ??
          'Unable to login. Please try again.',
      });

      set({ user: null });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    try {
      await AuthApi.logoutApi();
    } catch (_) {
      // ignore API failure on logout
    } finally {
      await AsyncStorage.removeItem('jwtToken');
      set({ user: null, authInitialized: true });

      Toast.show({
        type: 'success',
        text1: 'Logged out successfully',
      });
    }
  },

  checkAuth: async () => {
    const { authInitialized, checking } = useAuthStore.getState();
    if (authInitialized || checking) {
      return;
    }

    set({ checking: true });
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) {
        set({ user: null, authInitialized: true });
        return;
      }

      const res = await AuthApi.checkAuthApi();
      set({ user: res.data, authInitialized: true });
    } catch {
      await AsyncStorage.removeItem('jwtToken');
      set({ user: null, authInitialized: true });
    } finally {
      set({ checking: false });
    }
  },

  setUser: (user) => set({ user }),
}));
