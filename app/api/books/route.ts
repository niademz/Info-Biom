import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
    try {
      const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
        params: {
          q: 'magaret atwood AND science fiction AND stephen king',
          maxResults: 20,
          orderBy: 'relevance',
          key: process.env.GOOGLE_BOOKS_API_KEY,
          fields: 'items(id,volumeInfo(title,authors,description,imageLinks/thumbnail,infoLink))'
        },
      });
  
      return NextResponse.json(response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
      return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
    }
  }