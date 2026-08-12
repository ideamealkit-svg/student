// Firebase SDK ESM Imports via CDN
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  increment,
  serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// Firebase 프로젝트 설정 (수강생 실시간 공유용)
// 필요시 실제 Firebase 프로젝트 설정으로 변경 가능합니다.
const firebaseConfig = {
  apiKey: "AIzaSyDemoConfigKeyForStudentHub2026",
  authDomain: "student-web-hub.firebaseapp.com",
  projectId: "student-web-hub",
  storageBucket: "student-web-hub.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:demo123456789"
};

let db = null;
let isFirebaseEnabled = false;

try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  isFirebaseEnabled = true;
  console.log("🔥 Firebase Cloud Firestore가 정상적으로 연결되었습니다.");
} catch (e) {
  console.warn("⚠️ Firebase 기본 모드 (LocalStorage 및 메모리 동기화 모드로 동작합니다):", e.message);
  isFirebaseEnabled = false;
}

export { 
  db, 
  isFirebaseEnabled, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  increment, 
  serverTimestamp 
};
