'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SpotifyCard from './SpotifyCard';
import NewsCard from './NewsCard';
import YouTubeCard from './YouTubeCard';
import RedditCard from './RedditCard';
import BookCard from './BookCard';
//import SpotifyTrackCard from './SpotifyTrackCard';
import './FeedAlt.css'; 

/*interface SpotifyTrack {
    id: string;
    name: string;
    artists: Array<{ name: string }>;
    album: { images: Array<{ url: string }> };
    external_urls: { spotify: string };
}*/

interface SpotifyAlbum {
    id: string;
    name: string;
    artists: Array<{ name: string }>;
    images: Array<{ url: string }>;
    external_urls: { spotify: string };
}

interface SpotifyData {
    albums: {
      items: SpotifyAlbum[];
    };
}

interface NewsArticle {
    title: string;
    url: string;
    urlToImage: string;
}

interface YouTubeVideo {
    id: { videoId: string };
    snippet: { 
        title: string;
        thumbnails: { 
            medium: { url: string } 
        } 
    };
}

interface RedditPost {
    id: string;
    title: string;
    author: string;
    subreddit: string;
    score: number;
    num_comments: number;
    url: string;
    permalink: string;
    thumbnail: string | null;
  }

  interface BookInfo {
    id: string;
    volumeInfo: {
      title: string;
      authors?: string[];
      imageLinks?: {
        thumbnail: string;
      };
      infoLink: string;
    };
  }




  const CACHE_KEY = 'youtube_data';
  const CACHE_EXPIRY_KEY = 'youtube_data_expiry';
  const CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
  
  const fetchYouTubeVideos = async () => {
    const cachedData = localStorage.getItem(CACHE_KEY);
    const cachedExpiry = localStorage.getItem(CACHE_EXPIRY_KEY);
  
    const now = new Date().getTime();
  
    // Check if cached data exists and is not expired
    if (cachedData && cachedExpiry && now < Number(cachedExpiry)) {
      return JSON.parse(cachedData); // Return the cached data
    }
  
    // If no cached data or data expired, make an API call
    try {
      const { data } = await axios.get('/api/youtube');
      // Cache the data and set expiry time (current time + 2 hours)
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(CACHE_EXPIRY_KEY, (now + CACHE_DURATION).toString());
  
      return data; // Return the fetched data
    } catch (error) {
      console.error('Error fetching YouTube videos:', error);
      throw new Error('Failed to fetch YouTube videos');
    }
  };

const FeedAlt = () => {
    //const newMusicText = "New Music ";
    //const repeatedText = newMusicText.repeat(10);
    const [books, setBooks] = useState<BookInfo[]>([]);
    const [redditPosts, setRedditPosts] = useState<RedditPost[]>([]);
    const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideo[]>([]);
    const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
    const [spotifyData, setSpotifyData] = useState<SpotifyData | null>(null);
    //const [spotifyTracks, setSpotifyTracks] = useState<SpotifyTrack[]>([]);

    useEffect(() => {
        const fetchYouTube = async () => {
            try {
                const data = await fetchYouTubeVideos();
                setYoutubeVideos(data.items);
            } catch (error) {
                console.error('Error fetching YouTube data:', error);
            }
            
            /*
            try {
                
                const { data } = await axios.get('/api/youtube');
                
                setYoutubeVideos(data.items);
            } catch (error) {
                console.error('Error fetching YouTube data:', error);
            }*/

        };

        const fetchNews = async () => {
            const { data } = await axios.get('/api/news');
            setNewsArticles(data.articles);
        };

        const fetchRedditPosts = async () => {
            try {
              const response = await fetch('/api/reddit');
              if (!response.ok) {
                throw new Error('Failed to fetch Reddit posts');
              }
              const data = await response.json();
              setRedditPosts(data);
            } catch (error) {
              console.error('Error fetching Reddit posts:', error);
            }
          };

        const fetchSpotify = async () => {
            try {
                const { data } = await axios.get('/api/spotify');
                setSpotifyData(data);
            } catch (error) {
                console.error('Error fetching Spotify data:', error);
            }
        };

        const fetchBooks = async () => {
            try {
              const { data } = await axios.get('/api/books');
              setBooks(data.items);
            } catch (error) {
              console.error('Error fetching books:', error);
            }
        };

        /*
        const fetchSpotifyTracks = async () => {
            try {
                const { data } = await axios.get('/api/spotify/tracks'); // Fetch tracks
                setSpotifyTracks(data.tracks); // Adjust based on the response structure
            } catch (error) {
                console.error('Error fetching Spotify tracks:', error);
            }
        };*/
  


        fetchYouTube();
       // fetchSpotifyTracks();
        fetchNews();
        fetchSpotify();
        fetchRedditPosts();
        fetchBooks();
    }, []);

    return (
        <div className="relative">
            <center>
            {/* Spotify Section */}
            <section className="spotifySection" >

                {/* Scrolling "NEW MUSIC" text in the background 
                <div className="newMusicContainer">
                    <div className="newMusicText">
                        {repeatedText + repeatedText}
                    </div>
                </div>
                */}

                <h2 className="mb-4 text-center relative" style={{
                    fontFamily: 'LOT, sans-serif',
                    fontSize: '2.5rem',
                    letterSpacing: '0.04em',
                    fontWeight: 400,
                    lineHeight: '1.2',
                }}>
                    <span className="relative z-10">New Releases on Spotify</span>
                </h2>
                {/* Album Cards */}
                <div className="overflow-x-auto whitespace-nowrap pb-4" style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                }}>
                    <div className="inline-flex space-x-4 px-4">
                        {spotifyData?.albums.items.map((album) => (
                            <SpotifyCard key={album.id} {...album} />   
                        ))}
                    </div>
                </div>
               {/* <div className="overflow-x-auto whitespace-nowrap pb-4" style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                }}>
                    <div className="inline-flex space-x-4 px-4">
                        {spotifyTracks.map((track) => (
                            <SpotifyTrackCard key={track.id} {...track} />
                        ))}
                    </div>
                    </div>*/}
            </section>
            <br></br>
            {/* News Section */}
            <section className="news-section" style={{
                backgroundColor: 'white',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                padding: '20px',
                color: 'white',
            }}>
                <div className="black-bar"></div>
                <h2 style={{
                    textAlign: 'center',
                    fontSize: '3rem',
                    marginBottom: '30px',
                    textTransform: 'uppercase',
                    letterSpacing: '3px',
                    fontFamily: '"LOT", serif',
                    color: 'black',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                }}>
                    Top News
                </h2>
                <div className="black-bar"></div>
                <div className="overflow-x-auto whitespace-nowrap pb-4" style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                }}>
                    <div className="inline-flex space-x-4 px-4">
                        {newsArticles.map((article, index) => (
                            <NewsCard key={index} {...article} />
                        ))}
                    </div>
                </div>
                <div className="black-bar"></div>
            </section>
            <br></br>
            {/* YouTube Section */}
            <section style={{
                background: '#212121',
                padding: '40px 20px',
                color: '#FFFFFF',
                borderRadius: '20px',
                width: '90%',
                margin: '0 auto', // Center the section
            }}>
                <h2 style={{
                    textAlign: 'center',
                    fontSize: '2.5rem',
                    marginBottom: '30px',
                    letterSpacing: '0.04em',
                    fontFamily: '"LOT", "Arial", sans-serif',
                    fontWeight: 400,
                    position: 'relative',
                }}>
                    <span style={{
                        color: '#FF0000', // YouTube red color
                        marginRight: '0.1em', // Slight space between icon and text
                    }}>▶</span> {/* Simple play button icon */}
                    YouTube Recommendations
                    <span style={{
                        position: 'absolute',
                        top: '-15px',
                        right: '-40px',
                        fontSize: '0.5em',
                        backgroundColor: '#FF0000',
                        color: 'white',
                        padding: '5px 10px',
                        borderRadius: '20px',
                        animation: 'pulse 2s infinite',
                    }}>LIVE</span>
                </h2>
                <div className="overflow-x-auto whitespace-nowrap pb-4" style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                }}>
                    <div className="inline-flex space-x-4 px-4">
                        {youtubeVideos.map((video) => (
                            <YouTubeCard key={video.id.videoId} {...video} />
                        ))}
                    </div>
                </div>
            </section>
            <br></br>
            <section style={{
                background: '#FF4500',
                padding: '40px 20px',
                color: '#1A1A1B',
                borderRadius: '20px',
                width: '90%',
                margin: '0 auto', // Center the section
            }}>
                <h2 style={{
                    textAlign: 'center',
                    fontSize: '2.5rem',
                    marginBottom: '30px',
                    letterSpacing: '0.04em',
                    fontFamily: '"LOT", "Arial", sans-serif',
                    color: 'white',
                    fontWeight: 400,
                    position: 'relative',
                }}>
                    <span style={{
                        color: '#FF4500',
                        marginRight: '0.1em',
                    }}>🔥</span>
                    Hot on Reddit
                </h2>
                <div className="overflow-x-auto whitespace-nowrap pb-4" style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                }}>
                    <div className="inline-flex space-x-4 px-4">
                        {redditPosts.map((post) => (
                            <RedditCard key={post.id} {...post} />
                        ))}
                    </div>
                </div>
            </section>
            <br></br>
            {/* Books Section */}
            <section style={{
                background: 'url("/bookmap-bg.png") no-repeat center center',
                backgroundSize: 'cover',
                padding: '60px 20px',
                color: '#000000',
                position: 'relative',
                 overflow: 'hidden',
                 borderRadius: '20px',
                 width: '90%',
            }}>
                
                <div style={{ position: 'relative', zIndex: 1 }}>
                <h2 style={{
                textAlign: 'center',
                fontSize: '3rem',
                marginBottom: '30px',
                fontFamily: '"LOT", "Arial", sans-serif',
                fontWeight: 200,
                color: '#1a1a1a',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                }}>
                <span style={{
                    display: 'inline-block',
                    marginRight: '0.5em',
                    transform: 'rotate(-10deg)',
                }}>📚</span>
                Book Recommendations
                </h2>
    
                <div className="overflow-x-auto whitespace-nowrap pb-4" style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                }}>
                <div className="inline-flex space-x-6 px-4">
                    {books.map((book) => (
                    <BookCard key={book.id} {...book} />
                    ))}
                        </div>
                    </div>
                </div>
            </section>
            <br></br>
            </center>       
        </div>
    );
};

export default FeedAlt;
