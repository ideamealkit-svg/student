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

// -------------------------------------------------------------
// 🔥 수강생 실시간 공유용 Firebase 설정
// Firebase 콘솔(https://console.firebase.google.com)에서 생성한
// 본인의 firebaseConfig 정보를 아래에 입력하시면 실시간 공유가 즉시 활성화됩니다!
// -------------------------------------------------------------
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

let db = null;
let isFirebaseEnabled = false;

// 실제 API Key가 입력된 경우에만 Cloud Firestore 실시간 공유 동기화 실행
if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_FIREBASE_API_KEY") {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    isFirebaseEnabled = true;
    console.log("🔥 Firebase Cloud Firestore 실시간 공유가 연결되었습니다.");
  } catch (e) {
    console.warn("⚠️ Firebase 연결 오류:", e.message);
    isFirebaseEnabled = false;
  }
} else {
  console.log("⚡ 로컬 저장소 모드로 작동 중입니다. Firebase 설정 입력 시 실시간 수강생 전체 공유가 활성화됩니다.");
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
