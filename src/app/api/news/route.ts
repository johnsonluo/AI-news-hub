import { NextResponse } from 'next/server';
import { fetchLatestNews } from '@/lib/news-service';

export async function GET() {
  const news = await fetchLatestNews();
  return NextResponse.json({ news });
}
