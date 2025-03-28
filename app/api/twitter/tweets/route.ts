import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get('ids') || '1228393702244134912,1227640996038684673,1199786642791452673';

  try {
    const response = await axios.get('https://api.twitter.com/2/tweets', {
      params: {
        ids: ids,
        'tweet.fields': 'created_at',
        'expansions': 'author_id',
        'user.fields': 'created_at'
      },
      headers: {
        Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`
      }
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching tweets:', error.response?.data || error.message);
    
    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(
        { error: 'Failed to fetch tweets', details: error.response.data },
        { status: error.response.status }
      );
    }

    return NextResponse.json({ error: 'Failed to fetch tweets' }, { status: 500 });
  }
}