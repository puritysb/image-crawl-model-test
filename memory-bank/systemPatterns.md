# System Patterns

## System architecture
- **하이브리드 아키텍처**: Python 기반의 백엔드 이미지 검색 수집 엔진과 Next.js 기반의 프론트엔드 웹 대시보드로 구성.
- **모듈형 및 플러그인 기반 디자인**: 이미지 수집 엔진은 플러그인 방식으로 확장 가능하며, 전체 시스템은 모듈형으로 유지보수성 및 확장성 확보.

## Key technical decisions
- **언어**: Python (이미지 수집, 모델 테스트 로직) 및 JavaScript/TypeScript (웹 대시보드) 사용.
- **이미지 수집**:
    - **API 기반 (우선순위)**: Pixabay, Pexels, Unsplash, Google Custom Search API를 활용하여 키워드 기반 이미지 수집.
    - **API 제한 시 백업 크롤링**: Pixabay, Unsplash 웹사이트 직접 크롤링 (Scrapy 활용), Lorem Picsum (테스트용) 사용.
    - Google Image Search 직접 크롤링은 ToS 위험으로 제외.
    - 모든 수집 작업에 robots.txt 준수 및 rate limiting 적용.
- **모델 테스트**: 각 모델 API를 추상화하는 인터페이스를 정의하여 플러그인 방식으로 연동.
- **데이터 저장**: 수집된 이미지 메타데이터 및 테스트 결과 저장을 위한 `Supabase` (PostgreSQL 기반) 사용.

## Design patterns in use
- **Strategy Pattern**: 다양한 이미지 검색 전략 및 모델 테스트 로직을 캡슐화.
- **Factory Pattern**: 새로운 이미지 소스 API 클라이언트 및 모델 플러그인 인스턴스 생성.
- **Observer Pattern**: 이미지 수집 및 테스트 진행 상황 모니터링 및 알림.

## Component relationships
- **Python 이미지 검색 수집 엔진 (`/crawler`)**: 이미지 검색 API를 통해 이미지를 수집하고 메타데이터를 추출하여 Supabase에 저장. 무거운 이미지 수집 및 모델 테스트 작업을 처리.
- **Next.js 웹 대시보드 (`/dashboard`)**: Supabase에 저장된 데이터를 기반으로 사용자 인터페이스를 제공하고, 이미지 수집 및 테스트 작업을 트리거.
- **공유 데이터베이스 (`Supabase`)**: 수집된 이미지 메타데이터, 테스트 결과, 시스템 설정 등을 저장하는 중앙 데이터 저장소. Python 백엔드와 Next.js 프론트엔드 모두 연결.
- **플러그인 시스템**: 이미지 수집 엔진에 동적으로 새로운 이미지 검색 API 클라이언트 및 AI 모델 테스트 플러그인을 추가.

## Critical implementation paths
- **이미지 수집 흐름**:
    1.  키워드 입력.
    2.  우선순위에 따라 이미지 검색 API 호출 (Pixabay → Pexels → Unsplash → Google Custom Search).
    3.  API 제한 또는 결과 부족 시 해당 웹사이트 직접 크롤링 (Scrapy 활용).
    4.  수집된 이미지 메타데이터를 Supabase에 저장.
- **모델 테스트 흐름**: 테스트 시나리오 선택 -> 이미지 로드 -> 모델 플러그인 실행 -> 결과 분석 및 저장.
