import "./App.css";
import useAuthStore from "./store/useAuthStore";
import {
  loginWithGoogle,
  logout,
  deleteAccount,
  offAlarm,
  onAlarm,
} from "./lib/auth";
import { useState, useEffect } from "react";

function AskNotification() {
  const [permission, setPermission] = useState(Notification.permission);

  // 새로고침 후 권한 상태 변화 감지
  useEffect(() => {
    setPermission(Notification.permission);
  }, []);

  // default 상태일 때만 표시
  if (permission !== "default") return null;

  const handleRequest = async () => {
    const perm = await Notification.requestPermission();
    setPermission(perm);
    if (perm === "granted") {
      alert("감사합니다! 웹 푸시 알림이 활성화되었습니다 🎉");
    } else if (perm === "denied") {
      alert("언제든 브라우저 설정에서 다시 허용할 수 있습니다.");
    }
  };

  return (
    <div
      style={{
        marginTop: 20,
        padding: 12,
        borderRadius: 8,
        background: "#545635",
        border: "1px solid #ddd",
      }}
    >
      <p style={{ marginBottom: 8 }}>
        새 소식을 바로 받고 싶다면 알림을 허용해주세요 🔔
      </p>
      <button onClick={handleRequest}>알림 설정</button>
    </div>
  );
}

export default function App() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const account = useAuthStore((state) => state.account);

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      {!isLoggedIn ? (
        <button onClick={loginWithGoogle}>Google로 시작하기</button>
      ) : (
        <>
          <h2>
            환영합니다{account?.displayName ? `, ${account.displayName}` : ""}!
          </h2>

          {account?.photoUrl && (
            <img
              src={account.photoUrl}
              alt="avatar"
              width={80}
              height={80}
              style={{ borderRadius: "50%", objectFit: "cover" }}
              referrerPolicy="no-referrer"
            />
          )}

          <p>UID: {account?.uid}</p>
          <p>
            Email: {account?.email ?? "(없음)"}
            {account?.emailVerified ? " ✅" : ""}
          </p>
          <p>Provider: {account?.provider ?? "(알 수 없음)"}</p>

          <AskNotification />

          {account?.alarmOn ? (
            <button onClick={offAlarm}>웹 푸시 알림 off</button>
          ) : (
            <button onClick={onAlarm}>웹 푸시 알림 on</button>
          )}

          <button onClick={logout}>로그아웃</button>
          <button onClick={deleteAccount}>회원탈퇴</button>
        </>
      )}
    </main>
  );
}
