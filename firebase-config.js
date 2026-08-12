// Firebase SDK ESM Imports via CDN
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
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
  
  // 모든 기기/컴퓨터에서 권한 통과를 위해 익명 자동 인증 실행
  signInAnonymously(auth).then((userCredential) => {
    console.log("🔓 Firebase 익명 자동 인증 성공! UID:", userCredential.user.uid);
  }).catch((err) => {
    console.warn("⚠️ Firebase 인증 진행 안내:", err.message);
  });

  isFirebaseEnabled = true;
  console.log("🔥 Firebase Cloud Firestore 실시간 공유가 연결되었습니다!");
} catch (e) {
  console.warn("⚠️ Firebase 연결 오류:", e.message);
  isFirebaseEnabled = false;
}

export { 
  db, 
  auth,
  isFirebaseEnabled, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  deleteDoc,
  increment, 
  serverTimestamp 
};
