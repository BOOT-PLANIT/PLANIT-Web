import { loginWithGoogle } from "../config/FirebaseConfig";

function GoogleLogin() {
  async function handleGoogleLogin() {
    try {
      await loginWithGoogle();
    } catch (err) {
      console.log(err);
    }
  }
  
    return (
      <button type="button" onClick={handleGoogleLogin}>
        구글 로그인
      </button>
    );
  }
  
  export default GoogleLogin;