// ============================================================
//  AUTOVAULT INDIA — Firebase Configuration
//  Replace the values below with YOUR Firebase project details
//  Instructions: README.md → Step 2: Firebase Setup
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyA2eDeCYP-_zTQUnMjmRkMVCoMfHAaUgl8",
  authDomain: "car-booking-44096.firebaseapp.com",
  projectId: "car-booking-44096",
  storageBucket: "car-booking-44096.firebasestorage.app",
  messagingSenderId: "214859099772",
  appId: "1:214859099772:web:9734e9e0cd6c72a9bba3f9",
  measurementId: "G-2DHWCKY2XC"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const googleProvider = new firebase.auth.GoogleAuthProvider();

// ── Admin email list ──────────────────────────────────────────
// Add your admin email addresses here
const ADMIN_EMAILS = [
  "admin@autovaultindia.com",
  "your-admin-email@gmail.com"   // ← Replace with your actual admin Gmail
];

function isAdmin(email) {
  return ADMIN_EMAILS.includes(email);
}
