// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyArKOjuemzRkDFIAio4lhrdNrBuRl3Ar80",
  authDomain: "fusionxcanteen.firebaseapp.com",
  projectId: "fusionxcanteen",
  storageBucket: "fusionxcanteen.appspot.com",
  messagingSenderId: "379007831432",
  appId: "1:379007831432:web:36944b094266f38a45fe3d",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.jpg'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
