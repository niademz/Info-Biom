import { NextResponse } from 'next/server';
import axios from 'axios';

async function getSpotifyToken() {
  const response = await axios.post('https://accounts.spotify.com/api/token', 
    new URLSearchParams({
      'grant_type': 'client_credentials'
    }),
    {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );
  return response.data.access_token;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const genre = url.searchParams.get('genre') || 'afrobeat'; // Default to 'afrobeat'
  
  try {
    const token = await getSpotifyToken();
    const response = await axios.get('https://api.spotify.com/v1/search', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        q: `Cairo Reehaa Ayra Shallipopi`, 
        type: 'album', // Specify that you want albums
        limit: 8
      }
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching Spotify data:', error);
    return NextResponse.json({ error: 'Failed to fetch Spotify data' }, { status: 500 });
  }
}
