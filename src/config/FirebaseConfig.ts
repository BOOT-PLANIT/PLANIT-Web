import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getMessaging } from "firebase/messaging";

export const firebaseConfig = {
  apiKey: "AIzaSyACEwnV1yIegIGV7NNxX1PbezU-qCwPbcQ",
  authDomain: "boot-planit.firebaseapp.com",
  projectId: "boot-planit",
  storageBucket: "boot-planit.firebasestorage.app",
  messagingSenderId: "847301669531",
  appId: "1:847301669531:web:0cc739d726644125358c3e",
  measurementId: "G-3W607MKFV0",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const messaging = getMessaging(app);