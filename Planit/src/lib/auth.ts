import useAuthStore from "../store/useAuthStore";
import { toUserLevel } from "../util/toUserLevel";
import { auth } from "../config/FirebaseConfig";
import {
    onIdTokenChanged,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
  } from "firebase/auth";


const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

// 토큰 변경 시: 토큰 저장 → 서버 로그인 동기화 → 내 정보 조회
onIdTokenChanged(auth, async (u) => {
  const store = useAuthStore.getState();

  if (!u) {
    store.reset();
    return;
  }

  try {
    const idToken = await u.getIdToken(); // 강제 갱신 불필요

    // 1) 토큰 저장
    store.setIdToken(idToken);

    // 2) 서버 로그인 동기화 (실패해도 무시)
    await fetch(`${API_BASE}/api/v1/auth/login`, {
      method: "POST",
      headers: { Authorization: `Bearer ${idToken}` },
    }).catch(() => {});

    // 3) 내 정보 조회
    const meRes = await fetch(`${API_BASE}/api/v1/users/me`, {
      headers: { Authorization: `Bearer ${idToken}` },
    });

    if (!meRes.ok) {
      if (meRes.status === 401 || meRes.status === 403) {
        await signOut(auth);
        store.reset();
        return;
      }
      store.setAccount(null);
      return;
    }

    const meJson = await meRes.json();
    const a = meJson.data as {
      id?: number;
      uid: string;
      email?: string;
      displayName?: string;
      photoUrl?: string;
      userLevel?: string;
      provider?: string;
      emailVerified?: boolean;
      createdAt?: string;
      lastLoginAt?: string;
    };

    store.setAccount({
      id: a.id,
      uid: a.uid,
      email: a.email ?? null,
      displayName: a.displayName ?? null,
      photoUrl: a.photoUrl ?? null,
      userLevel: toUserLevel(a.userLevel),
      provider: a.provider ?? null,
      emailVerified: !!a.emailVerified,
      createdAt: a.createdAt ?? null,
      lastLoginAt: a.lastLoginAt ?? null,
    });
  } catch {
    store.setAccount(null);
  }
});

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
  // 이후 처리 onIdTokenChanged에서 자동
}

export async function logout() {
  await signOut(auth);            // Firebase 세션만 종료
  useAuthStore.getState().reset();
}
  
export async function deleteAccount() {
  const u = auth.currentUser;
  if (!u) { useAuthStore.getState().reset(); return; }

  const idToken = await u.getIdToken();         // 탈퇴 전에 토큰 확보
  await fetch(`${API_BASE}/api/v1/users/me`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${idToken}` },
  }).catch(() => { /* 네트워크 에러 무시 */ });
  
  await signOut(auth);                           // 세션 정리
  useAuthStore.getState().reset();
}
  
