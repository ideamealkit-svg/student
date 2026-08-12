/**
 * Student Web Hub - Main Application Logic
 */

import { 
  db, 
  isFirebaseEnabled, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  increment 
} from './firebase-config.js';

// Local Storage Key
const LOCAL_STORAGE_KEY = 'STUDENT_HUB_SITES_2026';
const LIKED_SITES_KEY = 'STUDENT_HUB_LIKED_IDS';

// Initial Mock Data (수강생 예시 홈페이지 데이터)
const INITIAL_MOCK_DATA = [
  {
    id: 'mock-1',
    studentName: '김민수',
    siteTitle: '민수의 프론트엔드 웹 포트폴리오',
    siteUrl: 'https://minsu-kim-dev.github.io',
    siteCategory: '포트폴리오',
    avatar: '👨‍💻',
    siteDescription: 'HTML, CSS, JavaScript로 반응형 레이아웃과 모던 인터랙션을 직접 구현한 첫 웹 포트폴리오입니다!',
    likes: 24,
    createdAt: Date.now() - 86400000 * 3
  },
  {
    id: 'mock-2',
    studentName: '이지은',
    siteTitle: '지은이의 코딩 & 일상 테크 블로그',
    siteUrl: 'https://jieun-tech-blog.vercel.app',
    siteCategory: '개인블로그',
    avatar: '👩‍💻',
    siteDescription: '매일매일 실습한 코드 노하우와 개발 에러 해결 과정을 기록하는 개인 기술 블로그입니다.',
    likes: 31,
    createdAt: Date.now() - 86400000 * 2
  },
  {
    id: 'mock-3',
    studentName: '박서준',
    siteTitle: '수강생 전용 맛집 추천 웹서비스 (FoodHub)',
    siteUrl: 'https://seojun-foodhub.netlify.app',
    siteCategory: '쇼핑몰/서비스',
    avatar: '🚀',
    siteDescription: '수강생들이 강의실 주변 가성비 맛집 정보와 리뷰를 실시간으로 올리고 공유하는 커뮤니티입니다.',
    likes: 45,
    createdAt: Date.now() - 86400000 * 1
  },
  {
    id: 'mock-4',
    studentName: '최유진',
    siteTitle: '팀 픽셀아트 갤러리 - Interactive Canvas',
    siteUrl: 'https://pixel-team-project.github.io',
    siteCategory: '팀프로젝트',
    avatar: '🎨',
    siteDescription: '수강생 3명이 함께 협업하여 캔버스 API로 구현한 인터랙티브 픽셀 아트 전시 공간입니다.',
    likes: 28,
    createdAt: Date.now() - 3600000 * 5
  }
];

// App State
let sitesList = [];
let currentCategory = 'all';
let searchQuery = '';
let currentSort = 'latest';
let likedSiteIds = JSON.parse(localStorage.getItem(LIKED_SITES_KEY) || '[]');

// DOM Elements
const cardsGrid = document.getElementById('cardsGrid');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const categoryFilters = document.getElementById('categoryFilters');
const sortSelect = document.getElementById('sortSelect');
const currentCategoryTitle = document.getElementById('currentCategoryTitle');

// Modal Elements
const registerModal = document.getElementById('registerModal');
const openRegisterModalBtn = document.getElementById('openRegisterModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelRegisterBtn = document.getElementById('cancelRegisterBtn');
const emptyStateBtn = document.getElementById('emptyStateBtn');
const registerForm = document.getElementById('registerForm');
const avatarPicker = document.getElementById('avatarPicker');
const selectedAvatarInput = document.getElementById('selectedAvatar');

// Stats Elements
const totalSitesCount = document.getElementById('totalSitesCount');
const totalStudentsCount = document.getElementById('totalStudentsCount');
const totalLikesCount = document.getElementById('totalLikesCount');

// Toast Elements
const toast = document.getElementById('toast');
const toastMsg = document.getElementById('toastMsg');
const toastIcon = document.getElementById('toastIcon');

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  initData();
  bindEvents();
});

/**
 * Initialize Data (LocalStorage or Firebase)
 */
function initData() {
  const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (localData) {
    try {
      sitesList = JSON.parse(localData);
    } catch (e) {
      sitesList = INITIAL_MOCK_DATA;
    }
  } else {
    sitesList = INITIAL_MOCK_DATA;
    saveToLocalStorage();
  }

  // Firebase Firestore synchronization if connected
  if (isFirebaseEnabled && db) {
    try {
      const q = query(collection(db, "sites"), orderBy("createdAt", "desc"));
      onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const cloudSites = [];
          snapshot.forEach((doc) => {
            cloudSites.push({ id: doc.id, ...doc.data() });
          });
          // Merge cloud sites with local fallback
          sitesList = cloudSites;
          saveToLocalStorage();
          renderApp();
        }
      }, (err) => {
        console.warn("Firestore real-time error, using local data:", err);
        renderApp();
      });
    } catch (e) {
      renderApp();
    }
  } else {
    renderApp();
  }
}

/**
 * Save data to LocalStorage
 */
function saveToLocalStorage() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sitesList));
}

/**
 * Event Bindings
 */
function bindEvents() {
  // Modal Open / Close
  openRegisterModalBtn.addEventListener('click', openModal);
  closeModalBtn.addEventListener('click', closeModal);
  cancelRegisterBtn.addEventListener('click', closeModal);
  emptyStateBtn.addEventListener('click', openModal);

  // Close modal on backdrop click
  registerModal.addEventListener('click', (e) => {
    if (e.target === registerModal) closeModal();
  });

  // Avatar Picker
  avatarPicker.querySelectorAll('.avatar-option').forEach(btn => {
    btn.addEventListener('click', () => {
      avatarPicker.querySelectorAll('.avatar-option').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedAvatarInput.value = btn.dataset.avatar;
    });
  });

  // Register Form Submit
  registerForm.addEventListener('submit', handleFormSubmit);

  // Search Input
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
    renderApp();
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    clearSearchBtn.style.display = 'none';
    renderApp();
  });

  // Category Filters
  categoryFilters.addEventListener('click', (e) => {
    const chip = e.target.closest('.filter-chip');
    if (!chip) return;

    categoryFilters.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    currentCategory = chip.dataset.category;

    currentCategoryTitle.textContent = currentCategory === 'all' ? '전체 홈페이지 목록' : `${currentCategory} 목록`;
    renderApp();
  });

  // Sort Selection
  sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderApp();
  });
}

/**
 * Open Register Modal
 */
function openModal() {
  registerModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  document.getElementById('studentName').focus();
}

/**
 * Close Register Modal
 */
function closeModal() {
  registerModal.style.display = 'none';
  document.body.style.overflow = 'auto';
  registerForm.reset();
  
  // Reset avatar picker
  avatarPicker.querySelectorAll('.avatar-option').forEach(b => b.classList.remove('active'));
  avatarPicker.querySelector('.avatar-option[data-avatar="👨‍💻"]').classList.add('active');
  selectedAvatarInput.value = '👨‍💻';
}

/**
 * Format URL: Ensures http:// or https:// prefix
 */
function formatUrl(url) {
  let cleanUrl = url.trim();
  if (!/^https?:\/\//i.test(cleanUrl)) {
    cleanUrl = 'https://' + cleanUrl;
  }
  return cleanUrl;
}

/**
 * Form Submit Handler
 */
async function handleFormSubmit(e) {
  e.preventDefault();

  const studentName = document.getElementById('studentName').value.trim();
  const siteTitle = document.getElementById('siteTitle').value.trim();
  const rawUrl = document.getElementById('siteUrl').value.trim();
  const siteCategory = document.getElementById('siteCategory').value;
  const avatar = selectedAvatarInput.value || '👨‍💻';
  const siteDescription = document.getElementById('siteDescription').value.trim() || '소개글이 작성되지 않았습니다.';

  if (!studentName || !siteTitle || !rawUrl) {
    showToast('필수 항목을 모두 입력해 주세요.', 'warning');
    return;
  }

  const formattedUrl = formatUrl(rawUrl);

  const newSite = {
    id: 'site-' + Date.now(),
    studentName,
    siteTitle,
    siteUrl: formattedUrl,
    siteCategory,
    avatar,
    siteDescription,
    likes: 1,
    createdAt: Date.now()
  };

  // Try adding to Firebase Firestore if enabled
  if (isFirebaseEnabled && db) {
    try {
      await addDoc(collection(db, "sites"), {
        ...newSite,
        createdAt: Date.now()
      });
      console.log("🔥 Firestore에 신규 홈페이지 등록 성공");
    } catch (err) {
      console.warn("Firestore 저장 실패, 로컬 저장소에 저장합니다:", err);
      sitesList.unshift(newSite);
      saveToLocalStorage();
    }
  } else {
    sitesList.unshift(newSite);
    saveToLocalStorage();
  }

  closeModal();
  renderApp();
  showToast(`🎉 ${studentName}님의 홈페이지가 등록되었습니다!`, 'success');
}

/**
 * Handle Like / Cheer Button
 */
async function handleLike(id) {
  const isLiked = likedSiteIds.includes(id);
  const targetSite = sitesList.find(s => s.id === id);

  if (!targetSite) return;

  if (isLiked) {
    targetSite.likes = Math.max(0, targetSite.likes - 1);
    likedSiteIds = likedSiteIds.filter(item => item !== id);
  } else {
    targetSite.likes += 1;
    likedSiteIds.push(id);
  }

  localStorage.setItem(LIKED_SITES_KEY, JSON.stringify(likedSiteIds));
  saveToLocalStorage();

  // Firestore update if available
  if (isFirebaseEnabled && db && !id.startsWith('mock-')) {
    try {
      const siteRef = doc(db, "sites", id);
      await updateDoc(siteRef, {
        likes: increment(isLiked ? -1 : 1)
      });
    } catch (e) {
      console.warn("Firestore like update error:", e);
    }
  }

  renderApp();
  if (!isLiked) {
    showToast(`❤️ ${targetSite.studentName}님의 홈페이지를 응원했습니다!`, 'like');
  }
}

/**
 * Copy Site Link to Clipboard
 */
function copyLink(url) {
  navigator.clipboard.writeText(url).then(() => {
    showToast('📋 링크가 클립보드에 복사되었습니다!', 'info');
  }).catch(() => {
    showToast('링크 복사에 실패했습니다.', 'warning');
  });
}

/**
 * Calculate Time Ago String
 */
function getTimeAgo(timestamp) {
  if (!timestamp) return '방금 전';
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (days > 0) return `${days}일 전`;
  if (hours > 0) return `${hours}시간 전`;
  if (minutes > 0) return `${minutes}분 전`;
  return '방금 전';
}

/**
 * Filter & Sort Data
 */
function getFilteredAndSortedSites() {
  let list = [...sitesList];

  // Category filter
  if (currentCategory !== 'all') {
    list = list.filter(item => item.siteCategory === currentCategory);
  }

  // Search filter
  if (searchQuery) {
    list = list.filter(item => 
      item.studentName.toLowerCase().includes(searchQuery) ||
      item.siteTitle.toLowerCase().includes(searchQuery) ||
      item.siteDescription.toLowerCase().includes(searchQuery) ||
      item.siteCategory.toLowerCase().includes(searchQuery)
    );
  }

  // Sorting
  if (currentSort === 'latest') {
    list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } else if (currentSort === 'likes') {
    list.sort((a, b) => b.likes - a.likes);
  } else if (currentSort === 'name') {
    list.sort((a, b) => a.studentName.localeCompare(b.studentName, 'ko'));
  }

  return list;
}

/**
 * Update Header Stats
 */
function updateStats() {
  const totalSites = sitesList.length;
  const uniqueStudents = new Set(sitesList.map(s => s.studentName.trim())).size;
  const totalLikes = sitesList.reduce((acc, s) => acc + (s.likes || 0), 0);

  totalSitesCount.textContent = totalSites;
  totalStudentsCount.textContent = uniqueStudents;
  totalLikesCount.textContent = totalLikes;
}

/**
 * Render App Grid Cards
 */
function renderApp() {
  updateStats();
  const displayList = getFilteredAndSortedSites();

  if (displayList.length === 0) {
    cardsGrid.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  cardsGrid.style.display = 'grid';
  emptyState.style.display = 'none';

  cardsGrid.innerHTML = displayList.map(site => {
    const isLiked = likedSiteIds.includes(site.id);
    const displayUrl = site.siteUrl.replace(/^https?:\/\//i, '');
    const timeAgo = getTimeAgo(site.createdAt);

    return `
      <article class="card">
        <div class="card-header">
          <div class="student-info">
            <div class="avatar-bubble" title="${site.studentName} 수강생">${site.avatar || '👨‍💻'}</div>
            <div class="student-meta">
              <div class="student-name">${escapeHtml(site.studentName)}</div>
              <div class="time-ago">${timeAgo}</div>
            </div>
          </div>
          <span class="category-tag">${escapeHtml(site.siteCategory)}</span>
        </div>

        <div class="card-body">
          <h4 class="site-title">${escapeHtml(site.siteTitle)}</h4>
          <p class="site-desc">${escapeHtml(site.siteDescription)}</p>
          <div class="site-url-preview">
            <i class="fa-solid fa-globe"></i> ${escapeHtml(displayUrl)}
          </div>
        </div>

        <div class="card-footer">
          <!-- CRITICAL: Open page in new tab target="_blank" -->
          <a href="${escapeHtml(site.siteUrl)}" target="_blank" rel="noopener noreferrer" class="visit-btn">
            <span>홈페이지 방문하기</span>
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>

          <div class="card-actions">
            <button class="action-btn like-btn ${isLiked ? 'liked' : ''}" 
                    data-id="${site.id}" 
                    title="응원하기(좋아요)">
              <i class="fa-${isLiked ? 'solid' : 'regular'} fa-heart"></i>
              <span class="like-count">${site.likes}</span>
            </button>
            <button class="action-btn share-btn" 
                    data-url="${escapeHtml(site.siteUrl)}" 
                    title="링크 복사">
              <i class="fa-solid fa-share-nodes"></i>
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');

  // Attach card action listeners
  cardsGrid.querySelectorAll('.like-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = btn.dataset.id;
      handleLike(id);
    });
  });

  cardsGrid.querySelectorAll('.share-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      copyLink(btn.dataset.url);
    });
  });
}

/**
 * Toast Notification Utility
 */
let toastTimeout = null;
function showToast(msg, type = 'success') {
  toastMsg.textContent = msg;
  
  if (type === 'like') {
    toastIcon.className = 'toast-icon fa-solid fa-heart';
    toastIcon.style.color = '#ec4899';
  } else if (type === 'info') {
    toastIcon.className = 'toast-icon fa-solid fa-copy';
    toastIcon.style.color = '#06b6d4';
  } else if (type === 'warning') {
    toastIcon.className = 'toast-icon fa-solid fa-triangle-exclamation';
    toastIcon.style.color = '#f59e0b';
  } else {
    toastIcon.className = 'toast-icon fa-solid fa-circle-check';
    toastIcon.style.color = '#10b981';
  }

  toast.style.display = 'flex';
  
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.style.display = 'none';
  }, 3000);
}

/**
 * HTML Escaper to prevent XSS
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
