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
    const response = await axios.get('https://api.spotify.com/v1/tracks', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        limit: 8,
        seed_genres: genre,
        seed_artists: '3uEftX1neotPP4BkfvFJHC,3ZpEKRjHaHANcpk10u6Ntq,46pWGuE3dSwY3bMMXGBvVS,7GlBOeep6PqTfFi59PTUUN',
      }
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching Spotify tracks:', error);
    return NextResponse.json({ error: 'Failed to fetch Spotify tracks' }, { status: 500 });
  }
}