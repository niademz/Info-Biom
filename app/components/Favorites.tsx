/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from "@/lib/supabase";
import RedditCard from './RedditCard';
import SpotifyCard from './SpotifyCard';
import YouTubeCard from './YouTubeCard';
import BookCard from './BookCard';
import NewsCard from './NewsCard';
import SpotifyTrackCard from './SpotifyTrackCard';
import { useUser } from '@clerk/nextjs';
import './FeedAlt.css';

interface SpotifyTrack {
    id: string;
    name: string;
    artists: Array<{ name: string }>;
    album: { images: Array<{ url: string }> };
    external_urls: { spotify: string };
}

interface SpotifyAlbum {
    id: string;
    name: string;
    artists: Array<{ name: string }>;
    images: Array<{ url: string }>;
    external_urls: { spotify: string };
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
        infoLink?: string; // Make infoLink optional
    };
}

const Favorites: React.FC = () => {
    const [favorites, setFavorites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useUser();

    useEffect(() => {
        const fetchFavorites = async () => {
            const userId = user?.id; 
            setLoading(true);
            setError(null);

            try {
                const { data, error } = await supabase
                    .from('favorites')
                    .select('*')
                    .eq('user_id', userId);

                if (error) throw error;
                setFavorites(data);
            } catch (error) {
                setError('Error fetching favorites');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchFavorites();
        }
    }, [user]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    // Group favorites by content type
    const groupedFavorites = favorites.reduce((acc, favorite) => {
        const contentType = favorite.content_type;
        if (!acc[contentType]) {
            acc[contentType] = [];
        }
        acc[contentType].push(favorite.content);
        return acc;
    }, {} as Record<string, any[]>);

    return (
        <div className='relative'>
            <center>
            <h2 style={{
                    textAlign: 'center',
                    fontSize: '3rem',
                    marginBottom: '30px',
                    textTransform: 'uppercase',
                    letterSpacing: '3px',
                    fontFamily: '"LOT", serif',
                    color: '#fffaf3',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                }}>Your Favorites</h2>

            {/* Spotify Section */}
            {groupedFavorites['spotify_album'] && (
                <section className='spotifySection'>
                    <h2 className="mb-4 text-center relative" style={{
                    fontFamily: 'LOT, sans-serif',
                    fontSize: '2.5rem',
                    letterSpacing: '0.04em',
                    fontWeight: 400,
                    lineHeight: '1.2',
                }}>
                    <span className="relative z-10">Spotify Albums & Tracks</span>
                </h2>
                <div className="overflow-x-auto whitespace-nowrap pb-4" style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                }}>
                        <div className="inline-flex space-x-4 px-4">
                            {groupedFavorites['spotify_album'].map((content: SpotifyAlbum) => (
                                <SpotifyCard key={content.id} {...content} />
                            ))}
                        </div>
                    </div>
                    <div className="overflow-x-auto whitespace-nowrap pb-4" style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                }}>
                    <div className="inline-flex space-x-4 px-4">
                        {groupedFavorites['spotify_track'].map((content: SpotifyTrack) => (
                            <SpotifyTrackCard key={content.id} {...content} />
                        ))}
                    </div>
                    </div>
                </section>
            )}
            <br></br>
            {/* News Section */}
            {groupedFavorites['news-article'] && (
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
                    News Articles
                </h2>
                    <div className="black-bar"></div>
                    <div className="overflow-x-auto whitespace-nowrap pb-4" style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                }}>
                        <div className="inline-flex space-x-4 px-4">
                            {groupedFavorites['news-article'].map((content: NewsArticle) => (
                                <NewsCard key={content.url} {...content} />
                            ))}
                        </div>
                    </div>
                    <div className="black-bar"></div>
                </section>
            )}
            <br></br>
            {/* YouTube Section */}
            {groupedFavorites['youtube_video'] && (
            <section style={{
                background: '#212121',
                padding: '40px 20px',
                color: '#FFFFFF',
                borderRadius: "20px",
                margin: '0 auto',
                width: '90%',
            }}>
                <h2 style={{
                    textAlign: 'center',
                    fontSize: '2.5rem',
                    marginBottom: '30px',
                    letterSpacing: '0.04em', // Tighter letter spacing
                    fontFamily: '"LOT", "Arial", sans-serif', // Fallback to similar fonts
                    fontWeight: 400, // Make it bold
                    position: 'relative',
                }}>
                    <span style={{
                        color: '#FF0000', // YouTube red color
                        marginRight: '0.1em', // Slight space between icon and text
                    }}>▶</span> {/* Simple play button icon */}
                    YouTube Videos
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
                    {groupedFavorites['youtube_video'].map((content: YouTubeVideo) => {
                    console.log('YouTube Video Content:', content);
                    console.log( content.id);
                    return <YouTubeCard key={null} id={content.id} snippet={content.snippet} />;
                    })}
                </div>
                </div>
            </section>
            )}
            <br></br>
            {/* Reddit Section */}
            {groupedFavorites['reddit_post'] && (
                <section style={{
                    background: '#FF4500',
                    padding: '40px 20px',
                    color: '#1A1A1B',
                    borderRadius: '20px',
                    width: '90%',
                    margin: '0 auto'
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
                        display: 'inline-block',
                        left: '50%',
                        transform: 'translateX(-50%)',
                    }}>
                        <span style={{
                            color: '#FF4500',
                            marginRight: '0.1em',
                        }}>🔥</span>
                        Reddit Posts
                    </h2>
                    <div className="overflow-x-auto whitespace-nowrap pb-4" style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                }}>
                        <div className="inline-flex space-x-4 px-4">
                            {groupedFavorites['reddit_post'].map((content: RedditPost) => (
                                <RedditCard key={content.id} {...content} />
                            ))}
                        </div>
                    </div>
                </section>
            )}
            <br></br>
            {/* Book Section */}
            {groupedFavorites['book'] && (
                <section style={{
                    background: 'url("/bookmap-bg.png") no-repeat center center',
                    backgroundSize: 'cover',
                    padding: '60px 20px',
                    color: '#000000',
                    position: 'relative',
                     overflow: 'hidden',
                     borderRadius: '20px',
                     width: '90%',
                     margin: '0 auto'
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
                        Your Books
                        </h2>
                        <div className="overflow-x-auto whitespace-nowrap pb-4" style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        }}>
                        <div className="inline-flex space-x-4 px-4">
                            {groupedFavorites['book'].map((content: BookInfo) => (
                                content.volumeInfo ? ( // Check if volumeInfo exists
                                    <BookCard key={content.id} {...content} volumeInfo={{...content.volumeInfo, infoLink: content.volumeInfo.infoLink || ''}} />
                                ) : null
                            ))}
                        </div>
                    </div>
                    </div>
                </section>
            )}
            <br></br>
            </center>
        </div>
    );
};

export default Favorites;
