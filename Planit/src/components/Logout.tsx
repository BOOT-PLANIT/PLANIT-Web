import { logout } from "../config/FirebaseConfig";

function Logout() {
  //const navigate = useNavigate();
  function onLogOutClik() {
    logout();
    //navigate("../");
  }
  return (
    <button type="button" onClick={onLogOutClik}>
      로그아웃
    </button>
  );
}

export default Logout;