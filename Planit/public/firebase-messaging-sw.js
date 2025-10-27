importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyACEwnV1yIegIGV7NNxX1PbezU-qCwPbcQ",
  authDomain: "boot-planit.firebaseapp.com",
  projectId: "boot-planit",
  storageBucket: "boot-planit.firebasestorage.app",
  messagingSenderId: "847301669531",
  appId: "1:847301669531:web:0cc739d726644125358c3e",
  measurementId: "G-3W607MKFV0",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Received background message: ", payload);
  const { title, body } = payload.notification || {};

  // 백그라운드 알림 표시
  self.registration.showNotification(title ?? "알림", {
    body: body ?? "",
  });
});
