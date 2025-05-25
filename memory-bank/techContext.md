# Tech Context

## Technologies used
- **주요 언어**: Python (이미지 수집, 모델 테스트), JavaScript/TypeScript (웹 대시보드)
- **이미지 검색/수집 클라이언트**: `requests` (HTTP 요청), `aiohttp` (비동기 HTTP 요청), `BeautifulSoup4` (HTML 파싱), `Pillow` (이미지 처리)
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
- **API 호출 제한**: 외부 AI 모델 API 및 이미지 검색 API 사용 시 호출 제한 및 비용 관리.
- **데이터 저장 용량**: 대용량 이미지 메타데이터 저장 시 데이터베이스 성능 및 스토리지 용량 고려.

## Dependencies
- **이미지 검색 API**: Pixabay API, Unsplash API, Pexels API, Google Custom Search API
- **외부 AI 모델 API**: Google Cloud Vision API, AWS Rekognition, Azure Cognitive Services 등 (플러그인 형태로 연동).
- **웹사이트 (백업 수집 대상)**: Pixabay, Unsplash (직접 파싱 필요 시)

## Tool usage patterns
- **개발 환경**: VS Code를 주 IDE로 사용.
- **테스트**: `pytest` (Python), `Jest` (JavaScript)를 사용하여 단위 및 통합 테스트 수행.
- **문서화**: `Sphinx` (Python) 또는 `JSDoc` (JavaScript)을 사용하여 개발자 가이드 및 API 문서 생성.
