importScripts("https://www.gstatic.com/firebasejs/9.11.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.11.0/firebase-messaging-compat.js");

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC3jENymyjrKsqyitqE8-WyuK5fPPCMKrA",
  authDomain: "proyecto-integrado-65cf2.firebaseapp.com",
  projectId: "proyecto-integrado-65cf2",
  storageBucket: "proyecto-integrado-65cf2.appspot.com",
  messagingSenderId: "176525818470",
  appId: "1:176525818470:web:345a5e76fb223b23600ba7"
};


firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();
