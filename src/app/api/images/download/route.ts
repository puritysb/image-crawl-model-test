import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword') || '';

    // Forward the request to the FastAPI backend
    const fastapiResponse = await fetch(`http://localhost:8000/api/images/download?keyword=${keyword}`, {
      method: 'GET',
    });

    if (!fastapiResponse.ok) {
      const errorData = await fastapiResponse.json();
      return NextResponse.json({ error: errorData.detail || 'Failed to download images from backend' }, { status: fastapiResponse.status });
    }

    // Stream the zip file directly to the client
    const headers = new Headers(fastapiResponse.headers);
    headers.set('Content-Disposition', fastapiResponse.headers.get('Content-Disposition') || 'attachment; filename="filtered_images.zip"');
    headers.set('Content-Type', 'application/zip');

    return new NextResponse(fastapiResponse.body, { status: 200, headers });

  } catch (error: any) {
    console.error('Error in Next.js API route:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
