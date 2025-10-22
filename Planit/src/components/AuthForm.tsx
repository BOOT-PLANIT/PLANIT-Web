import { useEffect } from "react";
import useAuthStore from "../store/useAuthStore";
import GoogleLogin from "./GoogleLogin";
import Logout from "./Logout";

function AuthForm() {
  const { isLoggedIn, account } = useAuthStore();
  
  useEffect(() => {
    console.log("Auth state:", { isLoggedIn, account });
  }, [isLoggedIn, account]);

  return (
    <div>
      {isLoggedIn ? (
        <div>
          <p>안녕하세요, {account?.displayName || account?.email}님!</p>
          <Logout />
        </div>
      ) : (
        <div>
          <GoogleLogin />
        </div>
      )}
    </div>
  );
}

export default AuthForm;