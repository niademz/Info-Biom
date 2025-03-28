import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: 'tech',
        maxResults: 10,
        type: 'video',
        key: process.env.YOUTUBE_API_KEY,
        order: 'viewCount', // Sort by view count for popularity
        publishedAfter: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), // Fetch videos published in the last 30 days
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch YouTube videos' }, { status: 500 });
  }
}