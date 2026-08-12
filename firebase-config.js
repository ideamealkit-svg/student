// Student Web Hub - Firebase Module (Clean Isolation)

// Firebase 실제 키 설정 (필요한 경우에만 입력)
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: ""
};

let db = null;
let isFirebaseEnabled = false;

// Firebase 비활성화 시 기본 스텁 함수
let collection = () => {};
let addDoc = async () => {};
let onSnapshot = () => {};
let query = () => {};
let orderBy = () => {};
let doc = () => {};
let updateDoc = async () => {};
let increment = () => {};
let serverTimestamp = () => {};

// 실제 Firebase 정보가 있을 경우에만 동적으로 Firebase SDK를 로드합니다.
if (firebaseConfig.projectId && firebaseConfig.apiKey) {
  try {
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js');
    const firestore = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');

    const app = initializeApp(firebaseConfig);
    db = firestore.getFirestore(app);
    isFirebaseEnabled = true;

    collection = firestore.collection;
    addDoc = firestore.addDoc;
    onSnapshot = firestore.onSnapshot;
    query = firestore.query;
    orderBy = firestore.orderBy;
    doc = firestore.doc;
    updateDoc = firestore.updateDoc;
    increment = firestore.increment;
    serverTimestamp = firestore.serverTimestamp;

    console.log("🔥 Firebase Cloud Firestore가 연결되었습니다.");
  } catch (e) {
    console.warn("⚠️ Firebase 초기화 중 오류:", e.message);
    isFirebaseEnabled = false;
  }
} else {
  console.log("⚡ Student Web Hub: 브라우저 고속 저장소(LocalStorage) 모드로 동작합니다.");
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
