importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDF_9Ry7HVTFUdwLOt3rOAHTIKgXI0wJ_w",
  authDomain: "medguard-b6257.firebaseapp.com",
  projectId: "medguard-b6257",
  storageBucket: "medguard-b6257.firebasestorage.app",
  messagingSenderId: "243200818579",
  appId: "1:243200818579:web:2d1328d4e3b99263a3fc66"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [300,100,300],
    requireInteraction: true,
  });
});
