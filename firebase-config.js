// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDIrugtlQwtwyoKGYu1eRIMsppVSJSnGkM",
  authDomain: "basics-9dd7d.firebaseapp.com",
  projectId: "basics-9dd7d",
  storageBucket: "basics-9dd7d.firebasestorage.app",
  messagingSenderId: "556132786878",
  appId: "1:556132786878:web:bcede11689aa0deb7534ef",
  databaseURL: "https://basics-9dd7d-default-rtdb.europe-west1.firebasedatabase.app"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const database = firebase.database();

// Initialize messaging only if supported
let messaging = null;
try {
  if ('serviceWorker' in navigator && 'Notification' in window) {
    messaging = firebase.messaging();
  }
} catch (error) {
  console.log('Firebase Messaging is not supported:', error);
} 