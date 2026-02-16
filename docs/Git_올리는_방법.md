# Git( GitHub )에 올리는 방법

브라우저에서 폴더를 끌어다 넣으면 **파일 개수 제한** 때문에 “파일이 많다”고 안 될 수 있습니다.  
**터미널에서 Git으로 올리면** `node_modules` 등은 제외되고, 필요한 파일만 올라갑니다.

---

## 1. GitHub에서 빈 저장소 만들기

1. [GitHub](https://github.com) 로그인 후 **New repository** 클릭.
2. **Repository name** 예: `safety-map-app`
3. **Public** 선택 후 **Create repository** 클릭.
4. **"…or push an existing repository from the command line"** 아래에 나오는 주소를 복사해 둡니다.  
   예: `https://github.com/내아이디/safety-map-app.git`

---

## 2. 프로젝트 폴더에서 Git 초기화 후 올리기

1. **터미널**을 연다 (Cursor 하단 터미널 또는 Mac **터미널** 앱).

2. 프로젝트 폴더로 이동한다.
   ```bash
   cd "/Users/air/Library/CloudStorage/GoogleDrive-lds43890@ssem.re.kr/내 드라이브/동수동수동수동수동수동수동수동수/cursor/안전지도 웹앱"
   ```
   (경로는 본인 컴퓨터에 맞게 수정)

3. Git 저장소를 만든다.
   ```bash
   git init
   ```

4. 올릴 파일을 스테이징한다.  
   (`.gitignore` 덕분에 `node_modules`, `.next`, `.env.local` 등은 **자동으로 제외**됨)
   ```bash
   git add .
   ```

5. 첫 커밋을 만든다.
   ```bash
   git commit -m "안전지도 웹앱 초기"
   ```

6. GitHub 저장소를 원격(remote)으로 추가한다.  
   **아래 URL은 1단계에서 복사한 주소로 바꾼다.**
   ```bash
   git remote add origin https://github.com/내아이디/safety-map-app.git
   ```

7. 기본 브랜치 이름을 `main`으로 맞춘다.
   ```bash
   git branch -M main
   ```

8. GitHub로 올린다.
   ```bash
   git push -u origin main
   ```
   로그인 창이 뜨면 GitHub 로그인(또는 토큰 입력)하면 됩니다.

---

## 정리

- **브라우저로 폴더 올리기** → 파일 수 제한 때문에 실패하기 쉽고, `node_modules`까지 올라갈 수 있음.
- **터미널에서 `git init` → `git add .` → `git commit` → `git remote add` → `git push`**  
  → `.gitignore`에 있는 건 제외되고, **소스만** 올라가서 “파일이 많다”는 문제가 없음.

이후 수정할 때는 같은 폴더에서:

```bash
git add .
git commit -m "수정 내용 한 줄"
git push
```

만 하면 됩니다.
