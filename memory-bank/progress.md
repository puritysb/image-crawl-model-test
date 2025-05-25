# Progress

## What works
- 없음. 프로젝트 초기 단계.

## What's left to build
- **Phase 1**:
  - Python 이미지 검색 수집 엔진 (`/crawler`) 개발 (Google Custom Search API 통합 포함).
  - Next.js 웹 대시보드 (`/dashboard`) 개발.
  - 공유 스키마/설정 (`/shared`) 개발.
- **Phase 2**: 플러그인 시스템 및 QR Detector 예시 구현.
- **Phase 3**: 분석 도구 및 대시보드 기능 확장.
- **Phase 4**: 문서화 및 추가 플러그인 예시 개발.

## Current status
- 프로젝트 초기화 및 메모리 뱅크 문서화 완료.
- 하이브리드 아키텍처 기반의 프로젝트 디렉토리 구조 설정 완료 (`/crawler`, `/dashboard`, `/shared`).
- Node.js 및 패키지 관리자 관련 기술 스택 결정 사항 반영 완료.
- Supabase 데이터베이스 설정 및 테이블 생성 완료 (`image_metadata`, `model_test_results`, `crawl_jobs`).
- 환경 변수 파일 (`.env`, `dashboard/.env.local`) 생성 및 설정 완료.
- Next.js 웹 대시보드 기본 구성 완료:
  - `dashboard/src/lib/supabase.ts`에 Supabase 클라이언트 설정 및 타입 연동.
  - `dashboard/src/components/layout/Header.tsx` 및 `dashboard/src/components/layout/Sidebar.tsx`를 포함한 기본 레이아웃 및 네비게이션 구성.
  - `dashboard/src/app/layout.tsx`에 레이아웃 통합.
  - `dashboard/src/app/page.tsx`에 대시보드 메인 페이지 구현 (통계, 최근 크롤링 작업 표시).
  - `dashboard/tsconfig.json`에 `@shared/*` 경로 별칭 설정.
  - `@heroicons/react` 패키지 설치.
  - 브라우저를 통해 대시보드 기본 UI 및 Supabase 연동 확인 완료.
  - 사이드바에서 "Menu" 텍스트 제거 완료.
- Python 백엔드 (FastAPI) 개발 완료:
  - `crawler/main.py`에 FastAPI 애플리케이션 설정.
  - `/api/crawl` 엔드포인트 구현 (이미지 검색 작업 시작).
  - `/api/crawl/jobs` 엔드포인트 구현 (이미지 검색 작업 목록 조회).
  - `subprocess`를 사용하여 이미지 수집 작업을 별도 프로세스로 실행.
  - Supabase에 이미지 수집 작업 상태 (pending, running, completed, failed) 및 PID 기록.
  - `/health` 엔드포인트 테스트 완료.
  - `crawler/api_sources` 디렉토리에 Pixabay, Pexels, Unsplash, Google Custom Search API 클라이언트 구현.
  - `crawler/requirements.txt`에 필요한 Python 의존성 (`requests`, `aiohttp`, `beautifulsoup4`, `Pillow`, `google-api-python-client`) 추가 및 `Scrapy` 관련 의존성 제거.
- Next.js 웹 대시보드 크롤러 페이지 구현 완료:
  - `dashboard/src/app/api/crawl/route.ts`에 FastAPI로 요청을 프록시하는 API 라우트 구현.
  - `dashboard/src/app/crawler/page.tsx`에 이미지 수집 작업 시작 폼 (키워드 입력) 및 진행 중/최근 이미지 수집 작업 목록 표시 UI 구현.
  - Supabase 실시간 구독을 통해 이미지 수집 작업 상태 업데이트.
  - `shared/types.ts`의 `CrawlJob` 인터페이스 필드명을 Supabase 테이블과 일치하도록 수정.
  - 브라우저를 통해 크롤러 페이지 UI 확인 완료.
  - 크롤링 작업 삭제 기능 구현 완료.
- 이미지 검색 API 키를 위한 환경 변수 (`PIXABAY_API_KEY`, `PEXELS_API_KEY`, `UNSPLASH_ACCESS_KEY`, `GOOGLE_CUSTOM_SEARCH_API_KEY`, `GOOGLE_CSE_ID`)가 `.env.example`에 추가되었습니다.
- 이미지 수집 기능 구현 및 테스트 완료:
  - FastAPI 백엔드 및 Next.js 대시보드 실행 확인.
  - 대시보드 크롤러 페이지에서 키워드 "체스판"으로 이미지 수집 작업 시작.
  - Supabase에 `crawl_jobs` 테이블에 작업이 성공적으로 기록되었음을 확인.
  - Supabase에 `image_metadata` 테이블에 이미지 데이터가 성공적으로 저장되었음을 확인.
- Next.js 웹 대시보드 이미지 갤러리 페이지 구현 완료:
  - `dashboard/src/app/images/page.tsx`에 수집된 이미지 그리드 표시, 키워드 필터링, 날짜 정렬, 이미지 클릭 시 원본 보기 기능 구현.
  - `shared/types.ts`의 `ImageMetadata` 인터페이스 필드명을 Supabase 테이블과 일치하도록 수정.
  - `dashboard/next.config.ts`에 외부 이미지 도메인 (`pixabay.com`, `cdn.pixabay.com`, `images.pexels.com`, `images.unsplash.com`, `picsum.photos`) 추가.
  - 이미지 목록에 검색 키워드 표시 기능 구현 완료.
  - 모달 레이어에서 `Esc` 키를 누르면 창이 닫히도록 구현 완료.
  - 필터링된 이미지 전체를 PC로 다운로드하는 기능 구현 완료.

## Known issues
- 없음. 개발 초기 단계.

## Evolution of project decisions
- **크롤링 방식 변경**: URL 기반 웹 크롤링에서 키워드 기반 이미지 검색 API 수집으로 변경.
- **이미지 수집 전략 상세화**: Pixabay, Pexels, Unsplash API 우선 사용, API 제한 시 직접 크롤링 (Scrapy 활용) 및 Lorem Picsum 백업. Google Image Search 직접 크롤링 제외.
