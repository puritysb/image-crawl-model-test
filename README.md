# Web Image Crawler & Model Testing Framework

이 프로젝트는 Next.js 프론트엔드와 Python FastAPI 백엔드를 결합한 하이브리드 애플리케이션입니다. 키워드 기반 이미지 검색 API를 통해 이미지를 수집하고, AI 모델 테스트를 위한 프레임워크를 제공합니다.

## 프로젝트 구조

프로젝트는 다음과 같은 주요 구성 요소로 이루어져 있습니다:

-   `/`: Next.js 프론트엔드 애플리케이션의 루트 디렉토리입니다.
-   `/api`: Python FastAPI 기반의 백엔드 API 서버리스 함수가 위치합니다. 이미지 수집 및 관련 로직을 처리합니다.
-   `/lib/shared`: 프론트엔드와 백엔드 간에 공유되는 타입 정의 및 설정 파일이 포함됩니다.

## 시작하기

개발 서버를 실행하려면 다음 명령어를 사용하세요:

```bash
pnpm install
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인하세요.

## Vercel에 배포하기

이 프로젝트는 Vercel 플랫폼에 Next.js와 Python Serverless Functions를 함께 배포하도록 최적화되어 있습니다.

1.  **환경 변수 설정**: Vercel 대시보드에서 다음 환경 변수를 설정해야 합니다.
    *   `SUPABASE_URL`
    *   `SUPABASE_KEY`
    *   `NEXT_PUBLIC_SUPABASE_URL`
    *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    *   `PIXABAY_API_KEY`
    *   `PEXELS_API_KEY`
    *   `UNSPLASH_ACCESS_KEY`
    *   `GOOGLE_CUSTOM_SEARCH_API_KEY`
    *   `GOOGLE_CSE_ID`

2.  **GitHub 연동**: 프로젝트를 GitHub 저장소에 푸시한 후, Vercel 대시보드에서 해당 저장소를 연동하여 배포를 시작할 수 있습니다. Vercel은 `vercel.json` 파일을 기반으로 Next.js 애플리케이션과 Python Serverless Function을 자동으로 빌드하고 배포합니다.

자세한 내용은 [Next.js 배포 문서](https://nextjs.org/docs/app/building-your-application/deploying)를 참조하세요.

## 더 알아보기

Next.js에 대해 더 자세히 알아보려면 다음 자료를 참고하세요:

-   [Next.js Documentation](https://nextjs.org/docs) - Next.js 기능 및 API에 대해 알아보세요.
-   [Learn Next.js](https://nextjs.org/learn) - 대화형 Next.js 튜토리얼입니다.

[Next.js GitHub 저장소](https://github.com/vercel/next.js)를 확인해 보세요. 여러분의 피드백과 기여를 환영합니다!
