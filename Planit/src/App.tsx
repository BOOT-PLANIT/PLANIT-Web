import "./App.css";
import useAuthStore from "./store/useAuthStore";
import { loginWithGoogle, logout } from "./config/FirebaseConfig";

export default function App() {
  const { isLoggedIn, account } = useAuthStore();

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      {!isLoggedIn ? (
        <>
          <button onClick={loginWithGoogle}>Google로 시작하기</button>
        </>
      ) : (
        <>
          <h2>환영합니다{account?.displayName ? `, ${account.displayName}` : ""}!</h2>
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
          <p>Email: {account?.email ?? "(없음)"}{account?.emailVerified ? " ✅" : ""}</p>
          <p>Provider: {account?.provider ?? "(알 수 없음)"}</p>
          <button onClick={logout}>로그아웃</button>
        </>
      )}
    </main>
  );
}
