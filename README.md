

# <img width="30" height="30" alt="image" src="https://github.com/user-attachments/assets/78d711a5-fa6a-499b-8eee-d160d233072c" /> AlbaMate
<img width="240" height="200" alt="image" src="https://github.com/user-attachments/assets/dc6a76f7-e70f-4935-bae6-17740fe1dce6" />




- 꽃잎 하나하나와 같은 알바생과 사장님을 하나의 꽃처럼 맺어준다는 의미
- 빠르고 편리한 알바 지원/모집을 위한 올인원 웹 서비스



---

## <img width="22" height="22" alt="image" src="https://github.com/user-attachments/assets/e3e1b0e4-fe40-43c4-b9c0-ed552afe4227" /> &nbsp;소개

**AlbaMate**는 알바 구직자(지원자)와 알바 채용자(사장님)를 연결하는 **알바 매칭 플랫폼**입니다.  
지원자는 쉽고 빠르게 알바를 찾고, 사장님은 손쉽게 알바생을 모집할 수 있습니다.

> 💬 "내게 맞는 알바, 지금 바로 매칭해보세요!"
<br/>

➡ &nbsp; [🚀 배포 사이트](https://albamate-bice.vercel.app/) | [🎥 시연 영상](https://www.youtube.com/watch?v=e7vMwgAApZs&t=1s) | [📊 발표 PPT](https://www.canva.com/design/DAGuoEOoR3Y/paY76hDWiTLi5LH1wV9XCw/edit) | [📡 API 문서](https://fe-project-albaform.vercel.app/docs/) | [기획 노션](https://www.notion.so/turtle-dev/4-3-2293c30f0aa08017b90bed0011ca4746)

<br/>

🔑 **테스트 계정** (※ 실제 사용자 계정이 아닌, 데모 체험을 위한 계정입니다.)

🏪 사장님 계정
- ID: admin1234@gmail.com
- PW: qwe123!@#

👤 지원자 계정
- ID: user1234@gmail.com
- PW: qwe123!@#
  
---

## <img width="22" height="22" alt="image" src="https://github.com/user-attachments/assets/e3e1b0e4-fe40-43c4-b9c0-ed552afe4227" /> &nbsp;주요 기능 (MVP)

- **구직자**
  - 알바 리스트 확인 및 필터 검색
  - 알바 상세 조회 및 지원서 작성
  - 내 알바 지원내역 및 상태 확인
  - 마이페이지(정보 관리, 스크랩, 내가 쓴 글)

- **사장님**
  - 알바폼 생성 (모집 내용, 조건, 근무 환경)
  - 지원자 리스트 및 상세 확인
  - 내가 작성한 알바 리스트 관리
  - 마이페이지(정보 관리, 내가 쓴 글/댓글)

- **알바토크 (커뮤니티)**
  - 알바 경험 공유, 정보 나눔

---

## <img width="22" height="22" alt="image" src="https://github.com/user-attachments/assets/e3e1b0e4-fe40-43c4-b9c0-ed552afe4227" /> &nbsp;주요 기술 스택

| 카테고리 | 사용 기술 | 선택 이유 |
|---------|-----------|-----------|
| 프레임워크 | Next.js 15.3.5 (App Router) | 안정적인 버전, 이전 프로젝트에서 문제없음 |
| 언어 | TypeScript | 명확한 타입 계약과 자동 문서화, 사전 오류 검출로 소통과 협업 효율 및 유지보수와 생산성 향상 |
| 스타일링 | TailwindCSS | 빠르고 일관된 UI, 유지보수에 최적화 |
| API 통신 | Axios | 네트워크 요청, 인증, 에러 처리 깔끔하게 지원 |
| 상태 관리 | Zustand, Tanstack Query | 클라이언트·서버 상태 역할 분리로 효율 극대화 |
| 폼 처리 | React Hook Form + Zod | 효율적 폼 처리와 선언적 검증으로 안정성 강화 |
| 다크모드 | next-themes | SSR 지원과 자동 OS 테마 감지로 Next.js에서 쉽고 빠른 다크모드 등 테마 관리 |
| 빌드 툴 | Turbopack | Next.js에 최적화된 초고속 빌드 도구 |
| 배포 | Vercel | 간단하고 빠른 배포, Next.js와 완벽 연동 |
| 패키지 매니저 | pnpm | 빠른 설치, 엄격한 의존성 관리, 멀티 레포 최적화 |

---

## 🗂️ 폴더 구조

```bash
src/
├── app/
│   ├── (auth)/         # 로그인/회원가입
│   ├── (public)/       # 랜딩/리스트/상세 등 공개 페이지
│   ├── (private)/      # 지원자/사장님 전용 페이지
│   ├── providers.tsx   # 상태 관리 및 devtools
├── features/
│   ├── albalist/       # 알바 리스트 기능
│   ├── alba/           # 알바 상세
│   ├── apply/          # 알바폼 지원
│   ├── owner/          # 사장님 기능
│   ├── worker/         # 지원자 기능
├── shared/
│   ├── components/     # 공통 UI 컴포넌트 (GNB, Button, Modal 등)
│   ├── lib/            # 유틸 함수, 상수
│   ├── store/          # 전역 상태
│   └── types/          # 공통 타입 정의
```
---

## <img width="20" height="20" alt="image" src="https://github.com/user-attachments/assets/e3e1b0e4-fe40-43c4-b9c0-ed552afe4227" /> &nbsp;팀원 소개
- **팀명**: 알멩이 - 알바 메이트를 만드는 사람들(?)

| **김동한** | **문혜란** | **이태식** | **김수민** | **전유진** |
|:--:|:--:|:--:|:--:|:--:|
| <img width="180" height="220" alt="김동한" src="https://github.com/user-attachments/assets/a4fde9be-359f-42bc-b556-e4bde9bd920f" /> | <img width="180" height="220" alt="문혜란" src="https://github.com/user-attachments/assets/ef29fc47-72d5-4777-86eb-d0e70d87348b" /> | <img width="180" height="220" alt="이태식" src="https://github.com/user-attachments/assets/051db893-9b04-493b-82a0-fe3232013104" /> | <img width="160" height="196" alt="김수민" src="https://github.com/user-attachments/assets/e2b4b57d-c4b5-4548-8a38-28a2a087f958" /> | <img width="180" height="200" alt="전유진" src="https://github.com/user-attachments/assets/06eeb1eb-e957-4039-a5b5-7a6b31627307" /> |
| 마이페이지, 무한 스크롤, 배포, API 세팅 | 알바토크, 지원내역 상세 | 알바폼 생성/수정, 알바폼 지원 | 로그인/회원가입, 내 알바폼, 랜딩페이지 | 알바 목록, 알바폼 상세, 다크모드 |

---

## <img width="22" height="22" alt="image" src="https://github.com/user-attachments/assets/e3e1b0e4-fe40-43c4-b9c0-ed552afe4227" /> &nbsp;컨벤션

### <img width="20" height="20" alt="image" src="https://github.com/user-attachments/assets/78d711a5-fa6a-499b-8eee-d160d233072c" /> 네이밍 컨벤션

| 대상 | 규칙 | 예시 |
|------|------|------|
| 폴더명 | 케밥케이스 (`kebab-case`) | `components`, `user-profile` |
| 컴포넌트 파일명 | 파스칼케이스 (`PascalCase`) | `UserProfile.tsx` |
| 스타일 파일명 | 파스칼케이스 + `.styles.js` | `UserProfile.styles.js` |
| 이미지/아이콘 파일명 | 케밥케이스 | `logo-icon.png`, `profile-default.png` |
| 함수/변수명 | 카멜케이스 (`camelCase`) | `fetchUserData`, `userList` |
| 환경변수 | 대문자 + 스네이크케이스 | `NEXT_PUBLIC_API_URL` |
| 불린 변수 | `is__` | `isLoading`, `isOwner` |
| 이벤트 prop | `on__` | `onClick`, `onSearch` |
| 이벤트 핸들러 함수 | `handle__` | `handleClick`, `handleSearch` |

---

### <img width="20" height="20" alt="image" src="https://github.com/user-attachments/assets/78d711a5-fa6a-499b-8eee-d160d233072c" /> Git Flow

#### 🔀 기본 브랜치 전략

| 브랜치명 | 용도 | 설명 |
|----------|------|------|
| `main` | 배포 브랜치 | 항상 배포 가능한 상태 유지 |
| `develop` | 통합 브랜치 | 기능 브랜치 병합 지점 |

#### 🌱 작업 브랜치 네이밍

| 브랜치 종류 | 규칙 | 예시 |
|-------------|------|------|
| 기능 개발 | `feature/{이슈번호}` | `feature/42` |
| 버그 수정 | `fix/{이슈번호}` | `fix/42` |
| 리팩토링 | `refactor/{이슈번호}` | `refactor/42` |
| 환경 설정 | `chore/{이슈번호}` | `chore/42` |

---

### ✅ Commit 컨벤션

| 태그 | 설명 |
|------|------|
| ✨ `Feat` | 새로운 기능 추가, UI 구성 등 |
| 🐛 `Fix` | 버그 수정 |
| 📦 `Chore` | 설정, 패키지, 빌드 관련 작업 |
| ♻️ `Refactor` | 코드 리팩토링 (기능 변화 없음) |
| 💄 `Style` | 스타일 변경 (CSS, 마진 등) |
| 📝 `Docs` | 문서 수정 (README 등) |
| 🚀 `Deploy` | 배포 관련 커밋 |
| ✅ `Test` | 테스트 코드 추가 및 수정 |

---




