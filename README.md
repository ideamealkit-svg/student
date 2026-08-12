# 🚀 수강생 홈페이지 쇼케이스 플랫폼 (Student Web Hub)

수강생들이 직접 만든 홈페이지 주소(URL)와 이름을 등록하고, 다 같이 한곳에서 감상 및 공유할 수 있는 웹 애플리케이션입니다.

---

## ✨ 주요 기능

1. **수강생 홈페이지 제출/등록**:
   - 수강생 이름, 프로젝트/홈페이지 이름, URL 주소, 카테고리, 아바타, 한 줄 소개글 등록
   - `http://` 또는 `https://` 유효성 자동 보정
2. **실시간 홈페이지 공유 & 새 창 방문**:
   - "홈페이지 방문하기 ↗" 클릭 시 **새 창/새 탭(`target="_blank"`)**으로 접속
   - 수강생 이름, 카테고리, 프로젝트 설명 검색 및 실시간 필터링 지원
   - 홈페이지 응원하기 (좋아요 ❤️) 및 URL 복사 기능 제공
3. **실시간 공유 (Firebase Cloud Firestore 연동)**:
   - 각자 다른 PC나 모바일에서 접속하더라도 실시간으로 등록된 모든 수강생의 홈페이지 목록이 동기화됩니다.
   - DB 연결 전이나 오프라인 환경에서도 작동하도록 LocalStorage 백업 및 기본 예시 데이터 포함

---

## 🛠️ 기술 스택

- **Frontend**: HTML5, CSS3 (Glassmorphic Dark Theme System), JavaScript (ES6+ Modules)
- **Icons & Fonts**: FontAwesome v6, Google Fonts (Inter, Outfit)
- **Backend / DB**: Firebase Cloud Firestore (Optional Real-time Data Sync)
- **Deployment**: GitHub Pages (무료 호스팅)

---

## 📦 GitHub 배포 가이드 (GitHub Pages 배포 방법)

이 프로젝트는 별도의 빌드 과정(Webpack, Vite 등)이 필요 없는 **Pure Native Web App**으로, 깃허브(GitHub)에 업로드하는 즉시 **GitHub Pages**를 통해 무료로 웹 사이트를 오픈할 수 있습니다.

### 1단계: GitHub 저장소(Repository) 생성
1. [GitHub.com](https://github.com)에 로그인 후 오른쪽 상단 **`+`** 버튼 -> **`New repository`** 선택
2. Repository name 입력 (예: `student-web-hub`)
3. `Public`으로 설정 후 **`Create repository`** 클릭

### 2단계: 파일 업로드 (2가지 방법 중 선택)

#### 방법 A: Git 명령어 사용 (터미널 / VS Code)
```bash
# 1. 깃 초기화
git init

# 2. 파일 추가 및 첫 커밋
git add .
git commit -m "feat: 수강생 홈페이지 쇼케이스 프로젝트 초기 구축"

# 3. 브랜치 이름을 main으로 변경
git branch -M main

# 4. 내 깃허브 저장소 연결 (username과 repo-name을 본인 것에 맞게 변경)
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/student-web-hub.git

# 5. 깃허브에 푸시
git push -u origin main
```

#### 방법 B: GitHub 웹페이지 드래그 앤 드롭 업로드 (Git 프로그램 미설치 시)
1. 생성된 GitHub 저장소 페이지 중간의 **`uploading an existing file`** 링크 클릭
2. 본 폴더 내의 모든 파일(`index.html`, `style.css`, `app.js`, `firebase-config.js`, `README.md`, `.gitignore`)을 드래그하여 업로드
3. 하단의 **`Commit changes`** 버튼 클릭

---

### 3단계: GitHub Pages 무료 호스팅 활성화
1. GitHub 저장소 상단 메뉴의 **`Settings`** 탭 클릭
2. 좌측 사이드바 메뉴에서 **`Pages`** 클릭
3. **Build and deployment** 항목의 **Branch** 설정:
   - Branch: `main` 선택
   - Folder: `/ (root)` 선택
4. **`Save`** 버튼 클릭
5. 1~2분 후 페이지 상단에 **`Your site is live at https://YOUR_USERNAME.github.io/student-web-hub/`** 주소가 나타납니다!
6. 생성된 주소를 수강생들에게 공유하면 다 함께 만든 홈페이지를 보고 올릴 수 있습니다.
