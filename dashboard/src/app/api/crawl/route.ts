import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { keyword, limit } = body;

    if (!keyword) {
      return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
    }

    // Forward the request to the FastAPI backend
    const fastapiResponse = await fetch('http://localhost:8000/api/crawl', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ keyword, limit }),
    });

    if (!fastapiResponse.ok) {
      const errorData = await fastapiResponse.json();
      return NextResponse.json({ error: errorData.detail || 'Failed to initiate crawl job from backend' }, { status: fastapiResponse.status });
    }

    const data = await fastapiResponse.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('Error in Next.js API route:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
