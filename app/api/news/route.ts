import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  try {
    const fromDate = new Date(Date.now() - 100 * 60 * 60 * 1000).toISOString(); // Calculate 24 hours ago
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: 'politics AND science', 
        sortBy: 'popularity', // Sorting articles by popularity
        apiKey: process.env.NEWS_API_KEY,
        from: fromDate, // Fetch articles from the last 24 hours
        language: 'en',
      },
    });

    return NextResponse.json(response.data);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}