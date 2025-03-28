import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];

  if (!accessToken) {
    return NextResponse.json({ error: 'No access token provided' }, { status: 401 });
  }

  try {
    const response = await axios.get('https://api.twitter.com/2/users/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log('Twitter API response:', response.data);

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching data from Twitter:', error.message);
    }
    
    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(
        { error: 'Failed to fetch user data', details: error.response.data },
        { status: error.response.status }
      );
    }

    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
  }
}
