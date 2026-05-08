// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDACWP35vMDgVVzSq9hOy5o6mNckrFONYY",
  authDomain: "fir-2026-79368.firebaseapp.com",
  projectId: "fir-2026-79368",
  storageBucket: "fir-2026-79368.firebasestorage.app",
  messagingSenderId: "875127856041",
  appId: "1:875127856041:web:53c1984b797aaebc2942b8",
  databaseURL: "https://fir-2026-79368-default-rtdb.europe-west1.firebasedatabase.app"
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
