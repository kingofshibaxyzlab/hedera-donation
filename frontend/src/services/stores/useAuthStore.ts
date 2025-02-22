import keyValue from "@/commons/key-value";
import {
  authLogout,
  IResponseAuthLogin,
  IUserInfo,
} from "@/services/apis/auth";
import create from "zustand";

interface AuthState {
  isAuthenticated: boolean;
  user: IUserInfo | null;
  login: (response: IResponseAuthLogin) => Promise<void>;
  logout: () => void;
  getWalletAddress: () => string;
  setUser: (user: IUserInfo | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: !!localStorage.getItem(keyValue.accessToken),
  user: JSON.parse(localStorage.getItem(keyValue.user) || "null"),
  login: async (response: IResponseAuthLogin) => {
    try {
      localStorage.setItem(keyValue.accessToken, response.token);
      const userData = {
        username: response.username,
        wallet_address: response.wallet_address,
        image: response.image,
        name: response.name,
      };
      localStorage.setItem(keyValue.user, JSON.stringify(userData));
      set({
        isAuthenticated: true,
        user: userData,
      });
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  },
  logout: () => {
    authLogout();
    localStorage.removeItem(keyValue.accessToken);
    localStorage.removeItem(keyValue.user);
    set({ isAuthenticated: false, user: null });
  },
  getWalletAddress: () => {
    const user = get().user;
    return user?.wallet_address || "Unknown";
  },
  setUser: (user: IUserInfo | null) => {
    if (user) {
      localStorage.setItem(keyValue.user, JSON.stringify(user));
    } else {
      localStorage.removeItem(keyValue.user);
    }
    set({ user });
  },
}));
