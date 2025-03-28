import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  try {
    // Make an unauthenticated request to Reddit's JSON API
    const response = await axios.get('https://www.reddit.com/r/popular/hot.json', {
      params: { limit: 25 },
      headers: {
        'User-Agent': 'web:Info Biom:v1.0 (by /u/Realistic-Pack7089)'
      }
    });

    const posts = response.data.data.children.map((post: any) => ({
      id: post.data.id,
      title: post.data.title,
      author: post.data.author,
      subreddit: post.data.subreddit,
      score: post.data.score,
      num_comments: post.data.num_comments,
      url: `https://www.reddit.com${post.data.permalink}`,
      thumbnail: post.data.thumbnail !== 'self' ? post.data.thumbnail : null
    }));

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching Reddit posts:', error);
    return NextResponse.json({ error: 'Failed to fetch Reddit posts' }, { status: 500 });
  }
}