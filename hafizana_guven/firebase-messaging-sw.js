importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// DİKKAT: Skorları tutmak için oyununda zaten kullandığın 
// mevcut Firebase ayarlarının AYNISINI buraya yazmalısın.
firebase.initializeApp({
    apiKey: "AIzaSyBDGdQjm6NX8ANQm90HJR8wD2Nk2E1h-ro", 
    authDomain: "hgfz-5a1ca.firebaseapp.com", 
    projectId: "hgfz-5a1ca", 
    storageBucket: "hgfz-5a1ca.firebasestorage.app", 
    messagingSenderId: "306647848341", 
    appId: "1:306647848341:web:2906c477450f999130129c",
    databaseURL: "https://hgfz-5a1ca-default-rtdb.firebaseio.com"
});

const messaging = firebase.messaging();

// Site kapalıyken arka planda mesaj geldiğinde bu kısım çalışır ve bildirimi gösterir
messaging.onBackgroundMessage((payload) => {
  console.log('Arka planda mesaj alındı: ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/ikon.png' // Eğer oyununun bir logosu varsa buraya dosya adını yazabilirsin
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});