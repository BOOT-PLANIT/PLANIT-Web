import { create } from "zustand";

export type UserAccount = {
  id?: number;
  uid: string;
  email: string | null;
  displayName: string | null;
  photoUrl: string | null;    
  userLevel: string | null;
  provider: string | null;
  emailVerified: boolean;
  createdAt?: string | null;
  lastLoginAt?: string | null;
};

type AuthState = {
  isLoggedIn: boolean;
  idToken: string | null;
  account: UserAccount | null;
  setAuth: (p: Partial<AuthState>) => void;
  reset: () => void;
};

const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  idToken: null,
  account: null,
  setAuth: (p) => set((s) => ({ ...s, ...p })),
  reset: () => set({ isLoggedIn: false, idToken: null, account: null }),
}));

export default useAuthStore;
