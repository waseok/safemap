# 안전지도 웹앱

학생들이 안전 문제를 발견하고 지도에 핀을 표시하며, 교사가 피드백을 제공할 수 있는 플랫폼입니다.

## 기술 스택

- **프론트엔드/백엔드**: Next.js 14 (App Router)
- **데이터베이스**: Supabase (PostgreSQL)
- **이미지 저장**: Supabase Storage
- **지도 API**: 네이버 지도 API
- **배포**: Vercel

## 시작하기

**처음 설정할 때는 [내가 할 일 (체크리스트)](docs/내가_할_일.md)를 순서대로 따라 하면 됩니다.**

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 프로젝트 루트에 만들고 아래 값을 채우세요.

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=your_naver_map_client_id
```

**네이버 지도 API (NEXT_PUBLIC_NAVER_MAP_CLIENT_ID)**  
지도가 보이려면 클라이언트 ID가 필요합니다. 발급 방법은 [네이버 지도 API 설정](docs/MAP_API_SETUP.md)을 참고하세요.

### 3. Supabase 데이터베이스 설정

1. [Supabase](https://supabase.com)에서 프로젝트를 생성하세요.
2. SQL Editor에서 `supabase-schema.sql` 파일의 내용을 실행하세요.
3. Storage에서 `safety-pins` 버킷을 생성하고 공개 읽기 권한을 설정하세요.

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3080](http://localhost:3080)을 열어 확인하세요.

## 배포 (Vercel)

### 1. Vercel에 프로젝트 연결

1. [Vercel](https://vercel.com)에 로그인하세요.
2. "New Project"를 클릭하세요.
3. GitHub/GitLab/Bitbucket 저장소를 연결하거나 직접 업로드하세요.

### 2. 환경 변수 설정

Vercel 대시보드의 프로젝트 설정에서 다음 환경 변수를 추가하세요:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID`

### 3. 배포

Vercel이 자동으로 빌드하고 배포합니다. 배포가 완료되면 제공된 URL로 접속할 수 있습니다.

## 주요 기능

- **인증 시스템**: 교사는 로그인 후 학급 생성, 학생은 PIN 번호로 입장
- **안전 핀 관리**: 학교/집/마을에서 안전 문제 발견 및 공유
- **지도 및 리스트 뷰**: 지도에 핀 표시 및 리스트로 확인
- **교사 피드백**: 각 핀에 대한 피드백 작성
- **해결방법 고민하기**: 텍스트, 그림, 사진으로 해결방법 제안

## 프로젝트 구조

```
├── app/                    # Next.js App Router
│   ├── (auth)/            # 인증 관련 페이지
│   ├── (main)/            # 메인 기능 페이지
│   └── api/               # API 라우트
├── components/            # React 컴포넌트
├── lib/                   # 유틸리티 및 라이브러리
├── types/                 # TypeScript 타입 정의
└── public/                # 정적 파일
```
