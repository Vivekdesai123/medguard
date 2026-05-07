import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyDF_9Ry7HVTFUdwLOt3rOAHTIKgXI0wJ_w",
  authDomain: "medguard-b6257.firebaseapp.com",
  projectId: "medguard-b6257",
  storageBucket: "medguard-b6257.firebasestorage.app",
  messagingSenderId: "243200818579",
  appId: "1:243200818579:web:2d1328d4e3b99263a3fc66"
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export const requestPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: 'BODv4zZdTg_qTUAj0Gey7uZqZhfxPRYkVHOyqY6FyyhNIJ_4_DLL0UCAeZ-J5qcbG21efMvstFDi87QC3cNxvwU'
      });
      if(token){
        localStorage.setItem('fcm_token', token);
        console.log('FCM Token saved:', token);
        return token;
      }
    }
  } catch (error) {
    console.error('Notification error:', error);
  }
  return null;
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
