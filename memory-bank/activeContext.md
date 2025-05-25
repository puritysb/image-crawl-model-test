# Active Context

## Current work focus
- 키워드 기반 이미지 검색 수집 엔진으로 크롤러 기능 변경 및 관련 백엔드/프론트엔드 로직 업데이트.

## Recent changes
- 없음. 크롤러 기능 변경 요청으로 인한 대대적인 수정 예정.

## Next steps
- 기존 Scrapy 관련 파일 제거 (부분적으로 재사용 가능성 고려).
- **1단계: API 기반 이미지 수집 클라이언트 구현**:
    - Pixabay API 클라이언트 구현.
    - Pexels API 클라이언트 구현.
    - Unsplash API 클라이언트 구현.
    - Google Custom Search API 클라이언트 구현.
- **2단계: API 제한 시 크롤링 백업 로직 구현**:
    - Pixabay 직접 크롤링 로직 구현 (Scrapy 재활용 가능성 검토).
    - Unsplash 직접 크롤링 로직 구현 (Scrapy 재활용 가능성 검토).
    - Lorem Picsum 연동 (테스트용).
- `crawler/main.py`를 수정하여 키워드 기반 이미지 검색 및 Supabase 저장 로직 구현.
- API 키를 위한 환경 변수 추가 및 `.env.example` 업데이트.
- 대시보드 크롤러 페이지 UI를 키워드 입력 및 소스 선택 기반으로 변경.

## Active decisions and considerations
- Python 백엔드와 Next.js 프론트엔드 간의 통신 방식 결정 (예: REST API, GraphQL, 메시지 큐).
- Supabase 데이터베이스 스키마 설계.
- `/shared` 디렉토리에 공통 스키마 및 설정 파일을 정의하는 방법.
- 각 이미지 검색 API (Pixabay, Unsplash, Pexels, Google Custom Search) 연동 전략 수립.
- 이미지 검색 API 키 관리 방안.
- 수집된 이미지 메타데이터의 일관된 형식 유지.
- **이미지 수집 전략**:
    - **우선순위**: Pixabay, Pexels, Unsplash, Google Custom Search API 사용.
    - **백업**: API 제한 시 Pixabay, Unsplash 직접 크롤링 (Scrapy 활용), Lorem Picsum 사용.
    - **제외**: Google Image Search 직접 크롤링 (ToS 위험).
    - **공통**: 모든 수집 작업에 robots.txt 준수 및 rate limiting 적용.
- **서버 실행 및 로그 확인**: FastAPI 및 Next.js 서버 실행과 로그 확인은 사용자가 별도의 터미널 창에서 직접 진행.

## Learnings and project insights
- 없음. 새로운 기능 요구사항으로 인한 재설계 단계.
