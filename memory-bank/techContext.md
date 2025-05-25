# Tech Context

## Technologies used
- **주요 언어**: Python (크롤링, 모델 테스트), JavaScript/TypeScript (웹 대시보드)
- **웹 크롤링**: `Scrapy` (고성능 크롤링 프레임워크), `aiohttp` (비동기 HTTP 클라이언트/서버), 또는 `Playwright` (헤드리스 브라우저 자동화)
- **데이터베이스**: `Supabase` (PostgreSQL 기반, 이미지 메타데이터 및 테스트 결과 저장)
- **웹 프레임워크 (대시보드)**: `Next.js` (프론트엔드 및 백엔드 API)
- **배포**: `Vercel` (Next.js 애플리케이션 배포)
- **데이터 분석/시각화**: `Pandas`, `Matplotlib`, `Seaborn` (Python), `D3.js` 또는 `Chart.js` (JavaScript)

## Development setup
- **가상 환경**: `venv` 또는 `conda`를 사용하여 Python 종속성 관리.
- **패키지 관리**:
  - Python 패키지 관리자: `uv`
  - Node.js 패키지 관리자: `pnpm`
- **코드 포맷터/린터**: `Black`, `ESLint`, `Prettier`를 사용하여 코드 스타일 일관성 유지.
- **버전 관리**: `Git` 및 `GitHub`를 통한 협업.

## Technical constraints
- **크롤링 속도**: 웹사이트의 `robots.txt` 및 서버 부하를 고려하여 크롤링 속도 제한.
- **API 호출 제한**: 외부 AI 모델 API 사용 시 호출 제한 및 비용 관리.
- **데이터 저장 용량**: 대용량 이미지 메타데이터 저장 시 데이터베이스 성능 및 스토리지 용량 고려.

## Dependencies
- **외부 AI 모델 API**: Google Cloud Vision API, AWS Rekognition, Azure Cognitive Services 등 (플러그인 형태로 연동).
- **웹사이트**: 크롤링 대상이 되는 다양한 이미지 호스팅 웹사이트.

## Tool usage patterns
- **개발 환경**: VS Code를 주 IDE로 사용.
- **테스트**: `pytest` (Python), `Jest` (JavaScript)를 사용하여 단위 및 통합 테스트 수행.
- **문서화**: `Sphinx` (Python) 또는 `JSDoc` (JavaScript)을 사용하여 개발자 가이드 및 API 문서 생성.
