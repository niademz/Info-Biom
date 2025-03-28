import { NextResponse } from 'next/server';
import { oauth2 } from '../auth';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  try {
    const tokenParams = {
      code,
      redirect_uri: 'http://localhost:3000/api/reddit/callback',
      scope: 'read',
    };

    const accessToken = await oauth2.getToken(tokenParams);
    
    // Store the access token securely (e.g., in a database or encrypted cookie)
    // For this example, we'll just log it
    console.log('Access Token:', accessToken.token.access_token);

    return NextResponse.redirect('/');
  } catch (error) {
    console.error('Error getting token:', error);
    return NextResponse.json({ error: 'Failed to authenticate' }, { status: 500 });
  }
}