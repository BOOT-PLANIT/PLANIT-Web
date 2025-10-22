// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth, onIdTokenChanged, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import useAuthStore from "../store/useAuthStore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyACEwnV1yIegIGV7NNxX1PbezU-qCwPbcQ",
  authDomain: "boot-planit.firebaseapp.com",
  projectId: "boot-planit",
  storageBucket: "boot-planit.firebasestorage.app",
  messagingSenderId: "847301669531",
  appId: "1:847301669531:web:0cc739d726644125358c3e",
  measurementId: "G-3W607MKFV0"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

// 토큰 바뀔 때마다 서버에 /auth/me 호출 → DB 사용자 동기화/수신
onIdTokenChanged(auth, async (u) => {
  const set = useAuthStore.getState().setAuth;
  if (!u) {
    useAuthStore.getState().reset();
    return;
  }
  const idToken = await u.getIdToken(true);

  // 서버 보호 API 호출 (백엔드에서 ApiResponse<UserAccount> 반환 가정)
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });

  if (!res.ok) {
    // 토큰은 있지만 서버 거절됨 → 프론트 상태만 갱신
    set({ isLoggedIn: true, idToken, account: null });
    return;
  }

  const data = await res.json();
  const account = data.data as {
    uid: string;
    email?: string;
    displayName?: string;
    photoUrl?: string;
    userLevel?: string;
    provider?: string;
    emailVerified?: boolean;
    id?: number;
    createdAt?: string;
    lastLoginAt?: string;
  };

  set({
    isLoggedIn: true,
    idToken,
    account: {
      uid: account.uid,
      email: account.email ?? null,
      displayName: account.displayName ?? null,
      photoUrl: account.photoUrl ?? null,
      userLevel: account.userLevel ?? null,
      provider: account.provider ?? null,
      emailVerified: !!account.emailVerified,
      id: account.id ?? undefined,
      createdAt: account.createdAt ?? null,
      lastLoginAt: account.lastLoginAt ?? null,
    },
  });
});

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
}

export async function logout() {
  await signOut(auth);
  useAuthStore.getState().reset();
}
