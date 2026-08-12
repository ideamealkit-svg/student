// Firebase SDK ESM Imports via CDN
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  updateDoc, 
  deleteDoc,
  increment, 
  serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// -------------------------------------------------------------
// 🔥 수강생 전원 실시간 공유용 Firebase Cloud Firestore 설정
// -------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyBjiUGAqH1iup9LuI3D1q7ZVz4O4Mgw55U",
  authDomain: "student-hub-bd017.firebaseapp.com",
  projectId: "student-hub-bd017",
  storageBucket: "student-hub-bd017.firebasestorage.app",
  messagingSenderId: "494799171879",
  appId: "1:494799171879:web:5c7c7a48c017b27e98f902",
  measurementId: "G-PJFMZZ6QR8"
};

let db = null;
let auth = null;
let isFirebaseEnabled = false;

try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  
  // 익명 자동 로그인 처리
  signInAnonymously(auth).catch((err) => {
    console.warn("⚠️ Firebase Auth notice:", err.message);
  });

  isFirebaseEnabled = true;
  console.log("🔥 Firebase Cloud Firestore 실시간 모듈이 활성화되었습니다!");
} catch (e) {
  console.warn("⚠️ Firebase connection error:", e.message);
  isFirebaseEnabled = false;
}

export { 
  db, 
  auth,
  isFirebaseEnabled, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  updateDoc, 
  deleteDoc,
  increment, 
  serverTimestamp 
};
