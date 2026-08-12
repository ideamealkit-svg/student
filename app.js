/**
 * Student Web Hub - Main Application Logic (Permanent Delete & Real-time Cloud Sync)
 */

import { 
  db, 
  isFirebaseEnabled, 
  collection, 
  addDoc, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc,
  increment 
} from './firebase-config.js';

// Local Storage Keys
const LOCAL_STORAGE_KEY = 'STUDENT_HUB_SITES_2026';
const LIKED_SITES_KEY = 'STUDENT_HUB_LIKED_IDS';
const DELETED_SITES_KEY = 'STUDENT_HUB_DELETED_IDS';

// Initial Mock Data (SEED ONCE ONLY)
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
let deletedSiteIds = JSON.parse(localStorage.getItem(DELETED_SITES_KEY) || '[]');

// DOM Elements
let cardsGrid, emptyState, searchInput, clearSearchBtn, categoryFilters, sortSelect, currentCategoryTitle;
let registerModal, openRegisterModalBtn, closeModalBtn, cancelRegisterBtn, emptyStateBtn, registerForm, submitRegisterBtn, avatarPicker, selectedAvatarInput;
let totalSitesCount, totalStudentsCount, totalLikesCount;
let toast, toastMsg, toastIcon;
let cloudStatus, cloudStatusText;

// Global Window Helpers
window.openRegisterModal = openModal;
window.closeRegisterModal = closeModal;
window.handleRegisterSubmit = handleFormSubmit;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

function initApp() {
  getDomElements();
  initData();
  bindEvents();
}

function getDomElements() {
  cardsGrid = document.getElementById('cardsGrid');
  emptyState = document.getElementById('emptyState');
  searchInput = document.getElementById('searchInput');
  clearSearchBtn = document.getElementById('clearSearchBtn');
  categoryFilters = document.getElementById('categoryFilters');
  sortSelect = document.getElementById('sortSelect');
  currentCategoryTitle = document.getElementById('currentCategoryTitle');

  registerModal = document.getElementById('registerModal');
  openRegisterModalBtn = document.getElementById('openRegisterModalBtn');
  closeModalBtn = document.getElementById('closeModalBtn');
  cancelRegisterBtn = document.getElementById('cancelRegisterBtn');
  emptyStateBtn = document.getElementById('emptyStateBtn');
  registerForm = document.getElementById('registerForm');
  submitRegisterBtn = document.getElementById('submitRegisterBtn');
  avatarPicker = document.getElementById('avatarPicker');
  selectedAvatarInput = document.getElementById('selectedAvatar');

  totalSitesCount = document.getElementById('totalSitesCount');
  totalStudentsCount = document.getElementById('totalStudentsCount');
  totalLikesCount = document.getElementById('totalLikesCount');

  toast = document.getElementById('toast');
  toastMsg = document.getElementById('toastMsg');
  toastIcon = document.getElementById('toastIcon');

  cloudStatus = document.getElementById('cloudStatus');
  cloudStatusText = document.getElementById('cloudStatusText');
}

/**
 * Update Cloud Sync Status Indicator Badge
 */
function setCloudStatus(connected, message) {
  if (!cloudStatus || !cloudStatusText) getDomElements();
  if (!cloudStatus || !cloudStatusText) return;

  cloudStatusText.textContent = message;
  cloudStatus.className = 'cloud-status ' + (connected ? 'connected' : 'error');
}

/**
 * Filter out any deleted IDs permanently
 */
function sanitizeSites(list) {
  const deletedSet = new Set(deletedSiteIds);
  return list.filter(item => !deletedSet.has(item.id));
}

/**
 * Initialize Data
 */
function initData() {
  const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (localData) {
    try {
      sitesList = sanitizeSites(JSON.parse(localData));
    } catch (e) {
      sitesList = sanitizeSites(INITIAL_MOCK_DATA);
    }
  } else {
    sitesList = sanitizeSites(INITIAL_MOCK_DATA);
    saveToLocalStorage();
  }

  // Render local state immediately
  renderApp();

  // Firebase Real-time Cloud Sync
  if (isFirebaseEnabled && db) {
    try {
      onSnapshot(collection(db, "sites"), (snapshot) => {
        setCloudStatus(true, `☁️ 실시간 공유 연결됨 (${snapshot.size}개 등록)`);
        
        const cloudSites = [];
        snapshot.forEach((docSnap) => {
          cloudSites.push({ id: docSnap.id, ...docSnap.data() });
        });

        if (cloudSites.length > 0) {
          const cloudIds = new Set(cloudSites.map(c => c.id));
          const mockTail = INITIAL_MOCK_DATA.filter(m => !cloudIds.has(m.id));
          sitesList = sanitizeSites([...cloudSites, ...mockTail]);
        } else {
          sitesList = sanitizeSites(INITIAL_MOCK_DATA);
        }

        sitesList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        saveToLocalStorage();
        renderApp();
      }, (err) => {
        console.error("⚠️ Firestore Cloud sync error:", err);
        setCloudStatus(false, `⚠️ 파이어베이스 서버 연결 대기중`);
      });
    } catch (e) {
      setCloudStatus(false, `⚠️ 파이어베이스 설정 오류`);
    }
  } else {
    setCloudStatus(false, `⚡ 오프라인 저장소 모드`);
  }
}

function saveToLocalStorage() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sitesList));
  localStorage.setItem(DELETED_SITES_KEY, JSON.stringify(deletedSiteIds));
}

function bindEvents() {
  if (openRegisterModalBtn) openRegisterModalBtn.addEventListener('click', openModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (cancelRegisterBtn) cancelRegisterBtn.addEventListener('click', closeModal);
  if (emptyStateBtn) emptyStateBtn.addEventListener('click', openModal);

  if (registerModal) {
    registerModal.addEventListener('click', (e) => {
      if (e.target === registerModal) closeModal();
    });
  }

  if (avatarPicker) {
    avatarPicker.querySelectorAll('.avatar-option').forEach(btn => {
      btn.addEventListener('click', () => {
        avatarPicker.querySelectorAll('.avatar-option').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (selectedAvatarInput) selectedAvatarInput.value = btn.dataset.avatar;
      });
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', handleFormSubmit);
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      if (clearSearchBtn) clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
      renderApp();
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      searchQuery = '';
      clearSearchBtn.style.display = 'none';
      renderApp();
    });
  }

  if (categoryFilters) {
    categoryFilters.addEventListener('click', (e) => {
      const chip = e.target.closest('.filter-chip');
      if (!chip) return;

      categoryFilters.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentCategory = chip.dataset.category;

      if (currentCategoryTitle) {
        currentCategoryTitle.textContent = currentCategory === 'all' ? '전체 홈페이지 목록' : `${currentCategory} 목록`;
      }
      renderApp();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderApp();
    });
  }
}

function openModal() {
  if (!registerModal) getDomElements();
  if (registerModal) {
    registerModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    const nameInput = document.getElementById('studentName');
    if (nameInput) nameInput.focus();
  }
}

function closeModal() {
  if (!registerModal) getDomElements();
  if (registerModal) {
    registerModal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
  if (registerForm) {
    registerForm.reset();
  }
  
  if (avatarPicker) {
    avatarPicker.querySelectorAll('.avatar-option').forEach(b => b.classList.remove('active'));
    const defaultAvatar = avatarPicker.querySelector('.avatar-option[data-avatar="👨‍💻"]');
    if (defaultAvatar) defaultAvatar.classList.add('active');
    if (selectedAvatarInput) selectedAvatarInput.value = '👨‍💻';
  }
}

function formatUrl(url) {
  let cleanUrl = (url || '').trim();
  if (!cleanUrl) return 'https://github.com';
  if (!/^https?:\/\//i.test(cleanUrl)) {
    cleanUrl = 'https://' + cleanUrl;
  }
  return cleanUrl;
}

/**
 * Form Submit Handler
 */
function handleFormSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();

  const studentNameInput = document.getElementById('studentName');
  const siteTitleInput = document.getElementById('siteTitle');
  const siteUrlInput = document.getElementById('siteUrl');
  const siteCategoryInput = document.getElementById('siteCategory');
  const siteDescriptionInput = document.getElementById('siteDescription');

  const studentName = studentNameInput ? studentNameInput.value.trim() : '';
  const siteTitle = siteTitleInput ? siteTitleInput.value.trim() : '';
  const rawUrl = siteUrlInput ? siteUrlInput.value.trim() : '';
  const siteCategory = siteCategoryInput ? siteCategoryInput.value : '기타';
  const avatar = (selectedAvatarInput && selectedAvatarInput.value) ? selectedAvatarInput.value : '👨‍💻';
  const siteDescription = (siteDescriptionInput && siteDescriptionInput.value.trim()) ? siteDescriptionInput.value.trim() : '소개글이 작성되지 않았습니다.';

  if (!studentName || !siteTitle || !rawUrl) {
    showToast('필수 항목(이름, 홈페이지명, 주소)을 모두 입력해 주세요.', 'warning');
    return false;
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

  // 1. Immediately update LocalState & UI
  sitesList.unshift(newSite);
  saveToLocalStorage();
  
  closeModal();
  renderApp();
  showToast(`🎉 ${studentName}님의 홈페이지가 등록되었습니다!`, 'success');

  // 2. Broadcast to Firebase Cloud Firestore
  if (isFirebaseEnabled && db) {
    addDoc(collection(db, "sites"), {
      ...newSite,
      createdAt: Date.now()
    }).then(docRef => {
      console.log("☁️ Firestore Cloud save SUCCESS, Document ID:", docRef.id);
      showToast(`☁️ 수강생 전원 공유 서버에 저장되었습니다!`, 'success');
    }).catch(err => {
      console.error("⚠️ Firestore Cloud save ERROR:", err);
      showToast(`⚠️ 파이어베이스 서버 저장 실패 (${err.code || err.message}).`, 'warning');
    });
  }

  return false;
}

/**
 * Handle Permanent Delete Site Card
 */
function handleDelete(id) {
  const targetSite = sitesList.find(s => s.id === id);
  if (!targetSite) return;

  const confirmMsg = `'${targetSite.studentName}' 수강생의 '${targetSite.siteTitle}' 홈페이지를 정말 삭제하시겠습니까?`;
  if (!confirm(confirmMsg)) return;

  // Track deleted ID permanently
  if (!deletedSiteIds.includes(id)) {
    deletedSiteIds.push(id);
  }

  // Update local state & LocalStorage
  sitesList = sitesList.filter(s => s.id !== id);
  saveToLocalStorage();
  renderApp();
  showToast(`🗑️ ${targetSite.studentName}님의 홈페이지가 완전 삭제되었습니다.`, 'info');

  // Delete from Cloud Firestore if enabled
  if (isFirebaseEnabled && db && !id.startsWith('mock-')) {
    deleteDoc(doc(db, "sites", id)).then(() => {
      console.log("☁️ Firestore document deleted successfully:", id);
    }).catch(err => {
      console.warn("Firestore delete error:", err);
    });
  }
}

function handleLike(id) {
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

  // Async Firestore update
  if (isFirebaseEnabled && db && !id.startsWith('mock-')) {
    const siteRef = doc(db, "sites", id);
    updateDoc(siteRef, {
      likes: increment(isLiked ? -1 : 1)
    }).catch(e => console.warn("Firestore like update error:", e));
  }

  renderApp();
  if (!isLiked) {
    showToast(`❤️ ${targetSite.studentName}님의 홈페이지를 응원했습니다!`, 'like');
  }
}

function copyLink(url) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      showToast('📋 링크가 클립보드에 복사되었습니다!', 'info');
    }).catch(() => {
      fallbackCopy(url);
    });
  } else {
    fallbackCopy(url);
  }
}

function fallbackCopy(url) {
  const textArea = document.createElement("textarea");
  textArea.value = url;
  document.body.appendChild(textArea);
  textArea.select();
  try {
    document.execCommand('copy');
    showToast('📋 링크가 클립보드에 복사되었습니다!', 'info');
  } catch (err) {
    showToast('링크 복사에 실패했습니다.', 'warning');
  }
  document.body.removeChild(textArea);
}

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

function getFilteredAndSortedSites() {
  let list = [...sitesList];

  if (currentCategory !== 'all') {
    list = list.filter(item => item.siteCategory === currentCategory);
  }

  if (searchQuery) {
    list = list.filter(item => 
      (item.studentName && item.studentName.toLowerCase().includes(searchQuery)) ||
      (item.siteTitle && item.siteTitle.toLowerCase().includes(searchQuery)) ||
      (item.siteDescription && item.siteDescription.toLowerCase().includes(searchQuery)) ||
      (item.siteCategory && item.siteCategory.toLowerCase().includes(searchQuery))
    );
  }

  if (currentSort === 'latest') {
    list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } else if (currentSort === 'likes') {
    list.sort((a, b) => (b.likes || 0) - (a.likes || 0));
  } else if (currentSort === 'name') {
    list.sort((a, b) => (a.studentName || '').localeCompare(b.studentName || '', 'ko'));
  }

  return list;
}

function updateStats() {
  const totalSites = sitesList.length;
  const uniqueStudents = new Set(sitesList.map(s => (s.studentName || '').trim())).size;
  const totalLikes = sitesList.reduce((acc, s) => acc + (s.likes || 0), 0);

  if (totalSitesCount) totalSitesCount.textContent = totalSites;
  if (totalStudentsCount) totalStudentsCount.textContent = uniqueStudents;
  if (totalLikesCount) totalLikesCount.textContent = totalLikes;
}

function renderApp() {
  updateStats();
  const displayList = getFilteredAndSortedSites();

  if (!cardsGrid || !emptyState) return;

  if (displayList.length === 0) {
    cardsGrid.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  cardsGrid.style.display = 'grid';
  emptyState.style.display = 'none';

  cardsGrid.innerHTML = displayList.map(site => {
    const isLiked = likedSiteIds.includes(site.id);
    const displayUrl = (site.siteUrl || '').replace(/^https?:\/\//i, '');
    const timeAgo = getTimeAgo(site.createdAt);

    return `
      <article class="card">
        <div class="card-header">
          <div class="student-info">
            <div class="avatar-bubble" title="${escapeHtml(site.studentName)} 수강생">${site.avatar || '👨‍💻'}</div>
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
          <!-- CRITICAL: Open in new tab target="_blank" -->
          <a href="${escapeHtml(site.siteUrl)}" target="_blank" rel="noopener noreferrer" class="visit-btn">
            <span>홈페이지 방문하기</span>
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>

          <div class="card-actions">
            <button class="action-btn like-btn ${isLiked ? 'liked' : ''}" 
                    data-id="${site.id}" 
                    title="응원하기(좋아요)">
              <i class="fa-${isLiked ? 'solid' : 'regular'} fa-heart"></i>
              <span class="like-count">${site.likes || 0}</span>
            </button>
            <button class="action-btn share-btn" 
                    data-url="${escapeHtml(site.siteUrl)}" 
                    title="링크 복사">
              <i class="fa-solid fa-share-nodes"></i>
            </button>
            <button class="action-btn delete-btn" 
                    data-id="${site.id}" 
                    title="삭제하기">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');

  cardsGrid.querySelectorAll('.like-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      handleLike(btn.dataset.id);
    });
  });

  cardsGrid.querySelectorAll('.share-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      copyLink(btn.dataset.url);
    });
  });

  cardsGrid.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      handleDelete(btn.dataset.id);
    });
  });
}

function showToast(msg, type = 'success') {
  if (!toast || !toastMsg || !toastIcon) getDomElements();
  if (!toast || !toastMsg || !toastIcon) return;

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

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
