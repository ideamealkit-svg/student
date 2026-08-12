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

// Firebase 설정 (실제 Firebase 프로젝트 정보 입력 시 실시간 동기화 활성화)
const firebaseConfig = {
  apiKey: "", // 필요 시 실제 Firebase API 키 입력
  authDomain: "",
  projectId: ""
};

let db = null;
let isFirebaseEnabled = false;

// 유효한 프로젝트 설정이 입력된 경우에만 Firebase 활성화
if (firebaseConfig.projectId && firebaseConfig.apiKey) {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    isFirebaseEnabled = true;
    console.log("🔥 Firebase Cloud Firestore가 연결되었습니다.");
  } catch (e) {
    console.warn("⚠️ Firebase 초기화 실패:", e.message);
    isFirebaseEnabled = false;
  }
} else {
  console.log("ℹ️ 로컬/브라우저 저장소 모드로 작동합니다.");
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
