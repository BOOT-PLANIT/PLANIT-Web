import { create } from "zustand";

export type UserLevel = "USER" | "ADMIN";

export type UserAccount = {
  id?: number;
  uid: string;
  email: string | null;
  displayName: string | null;
  photoUrl: string | null;
  userLevel: UserLevel | null;
  provider: string | null;
  emailVerified: boolean;
  createdAt?: string | null;
  lastLoginAt?: string | null;
  fcmToken?: string | null;
  alarmOn: boolean;
};

type AuthState = {
  isLoggedIn: boolean;
  idToken: string | null;
  account: UserAccount | null;

  setAuth: (p: Partial<AuthState>) => void;
  setIdToken: (token: string | null) => void;
  setAccount: (acc: UserAccount | null) => void;
  reset: () => void;
};

const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  idToken: null,
  account: null,

  setAuth: (p) =>
    set((s) => {
      const next = { ...s, ...p };
      if (p.idToken !== undefined || p.account !== undefined) {
        next.isLoggedIn = !!(p.idToken ?? s.idToken) || !!(p.account ?? s.account);
      }
      return next;
    }),

  setIdToken: (token) =>
    set((s) => ({
      ...s,
      idToken: token,
      isLoggedIn: !!token || !!s.account,
    })),

  setAccount: (acc) =>
    set((s) => ({
      ...s,
      account: acc,
      isLoggedIn: !!acc || !!s.idToken,
    })),

  reset: () => set({ isLoggedIn: false, idToken: null, account: null }),
}));

export default useAuthStore;
