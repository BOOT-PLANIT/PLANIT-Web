import useAuthStore from "../store/useAuthStore";
import { toUserLevel } from "../util/toUserLevel";
import { auth, messaging } from "../config/FirebaseConfig";
import { getToken, deleteToken } from "firebase/messaging";
import {
  onIdTokenChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";
const TOKEN_CACHE_KEY = "planit_last_fcm_token";

async function setAlarmOn(value: boolean) {
  const store = useAuthStore.getState();
  const idToken = store.idToken;
  if (!idToken || !store.account) return;
  
  try {
    await fetch(`${API_BASE}/api/v1/users/me/alarm`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ alarmOn: value }),
    });
    
    // 전체 account 정보를 보존하면서 alarmOn만 업데이트
    store.setAccount({ 
      ...store.account, 
      alarmOn: value 
    });
  } catch (err) {
    console.error("Failed to update alarmOn:", err);
  }
}

async function saveFcmToken(token: string | null) {
  const store = useAuthStore.getState();
  const idToken = store.idToken;
  if (!idToken || !store.account) return;

  const last = localStorage.getItem(TOKEN_CACHE_KEY);
  if (token && last === token) {
    store.setAccount({ ...store.account, fcmToken: token });
    return;
  }

  try {
    await fetch(`${API_BASE}/api/v1/users/me/token`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fcmToken: token }),
    });

    if (token) localStorage.setItem(TOKEN_CACHE_KEY, token);
    else localStorage.removeItem(TOKEN_CACHE_KEY);

    store.setAccount({ ...store.account, fcmToken: token });
  } catch (err) {
    console.error("Failed to save FCM token:", err);
  }
}

async function silentSyncPush() {
  // 브라우저 권한이 허용되지 않은 경우 조용히 종료
  if (Notification.permission !== "granted") return;

  const store = useAuthStore.getState();
  if (!store.idToken || !store.account) return;

  try {
    // Service Worker 등록 (없으면 생성)
    let registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    }

    // 현재 브라우저의 FCM 토큰 조회
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    // 기존 서버 상태와 다르면 자동 동기화
    if (token && token !== store.account.fcmToken) {
      await fetch(`${API_BASE}/api/v1/users/me/token`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${store.idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fcmToken: token }),
      });

      // DB와 동기화 후 로컬 상태 갱신
      store.setAccount({ ...store.account, fcmToken: token, alarmOn: true });
      console.log("새로고침 후 FCM token 재동기화 완료");
    } else if (!token) {
      // 토큰이 없을 경우 서버에서도 off로 동기화
      await fetch(`${API_BASE}/api/v1/users/me/alarm`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${store.idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ alarmOn: false }),
      });
      store.setAccount({ ...store.account, alarmOn: false });
    }
  } catch (err) {
    console.warn("silentSyncPush error:", err);
  }
}

export async function onAlarm() {
  const perm = await Notification.requestPermission();
  if (perm !== "granted") {
    alert("알림을 허용해야 웹 푸시를 사용할 수 있어요.");
    return;
  }

  try {
    // 이미 등록된 service worker가 있으면 재사용
    let registration = await navigator.serviceWorker.getRegistration();
    
    // 없으면 새로 등록
    if (!registration) {
      registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );
    }

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (!token) {
      alert("FCM 토큰 발급에 실패했습니다.");
      return;
    }

    await saveFcmToken(token);
    await setAlarmOn(true);
    alert("알림이 켜졌습니다.");
  } catch (err) {
    console.error("알림 설정 실패:", err);
    alert("알림 설정 중 오류가 발생했습니다.");
  }
}

export async function offAlarm() {
  try {
    // 브라우저 토큰 삭제
    await deleteToken(messaging);
  } catch (e) {
    console.log(e);
  }
  await saveFcmToken(null);
  await setAlarmOn(false);
  alert("알림이 꺼졌습니다.");
}

let isFirstAuthEvent = true;

onIdTokenChanged(auth, async (u) => {
  const store = useAuthStore.getState();

  if (isFirstAuthEvent && !u) {
    isFirstAuthEvent = false;
    return;
  }
  isFirstAuthEvent = false;

  if (!u) {
    store.reset();
    return;
  }

  try {
    const idToken = await u.getIdToken();
    store.setIdToken(idToken);

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
    const a = meJson.data ?? meJson;

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
      fcmToken: a.fcmToken ?? null,
      alarmOn: a.alarmOn,
    });

    // account 설정 후 알림 상태 동기화
    await silentSyncPush();
  } catch (err) {
    console.error("onIdTokenChanged error:", err);
    store.setAccount(null);
  }
});

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
}

export async function logout() {
  await signOut(auth);
  useAuthStore.getState().reset();
}

export async function deleteAccount() {
  const u = auth.currentUser;
  if (!u) {
    useAuthStore.getState().reset();
    return;
  }

  const idToken = await u.getIdToken();
  await fetch(`${API_BASE}/api/v1/users/me`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${idToken}` },
  }).catch(() => {});
  await signOut(auth);
  useAuthStore.getState().reset();
}
