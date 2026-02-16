# 네이버 지도 API 설정

안전지도 웹앱에서 지도가 표시되려면 **네이버 클라우드 플랫폼**에서 Maps API 클라이언트 ID를 발급받고, **실제 서비스 주소(배포 URL)**를 등록해야 합니다.

## 1. 먼저 서버 배포하기

지도 API는 **사용 URL**을 등록해야 동작합니다. 로컬 주소(localhost)보다 **배포된 정식 URL**을 등록하는 것이 좋습니다.

1. [Vercel](https://vercel.com) 등으로 프로젝트를 배포합니다.
2. 배포 후 받은 주소를 확인합니다. (예: `https://safety-map-xxx.vercel.app`)

이 주소를 아래 2단계에서 등록합니다.

## 2. 네이버 클라우드 플랫폼에서 Application 등록

1. [NAVER CLOUD PLATFORM](https://www.ncloud.com/) 접속 후 로그인(또는 회원가입).
2. **Console** → **Application** → **Maps** 메뉴로 이동.
3. **Application 등록** 클릭.
4. **Application 이름** 입력 (예: `안전지도 웹앱`).
5. **사용 API**에서 **Web Dynamic Map**(웹 동적 지도) 선택.
6. **Web Dynamic Map** 설정의 **사용 URL**에 **배포된 주소만** 등록합니다.
   - 예: `https://safety-map-xxx.vercel.app`
   - 서브 경로까지 쓸 수 있다면: `https://safety-map-xxx.vercel.app/**`
7. 저장 후 **Client ID**를 복사합니다.

## 3. 배포 서비스에 환경 변수 설정

Vercel 대시보드에서 해당 프로젝트 → **Settings** → **Environment Variables**에 추가합니다.

- 이름: `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID`
- 값: 2단계에서 복사한 **Client ID**

저장 후 **Redeploy** 한 번 하면 지도가 적용됩니다.

## 4. 확인

배포된 사이트에서 **안전점검 → 지도 보기**(또는 안전점검하기에서 마을 선택 시)로 들어가 지도가 로드되는지 확인합니다.

---

## 로컬에서 지도 테스트할 때 (선택)

개발 중에 본인 PC에서만 지도를 보고 싶다면, 네이버 콘솔 **사용 URL**에  
`http://localhost:3080` 을 **추가**로 등록할 수 있습니다.  
실제 서비스용으로는 **배포 URL만 등록**하는 것을 권장합니다.

## 참고

- [네이버 지도 API v3 문서](https://navermaps.github.io/maps.js.ncp/docs/)
- 사용 URL을 등록하지 않으면 429 등 오류가 나므로, **배포 URL**을 반드시 등록하세요.
