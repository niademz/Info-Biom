/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
import React, { useState, useRef, useEffect } from 'react';
import { supabase } from "@/lib/supabase"; // Import Supabase for database operations
import { useUser } from '@clerk/nextjs';

interface YouTubeVideo {
  id: { videoId: string };
  snippet: { 
    title: string;
    thumbnails: { 
      medium: { url: string } 
    } 
  };
}

// Function to decode HTML entities
const decodeHtmlEntities = (text: string) => {
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
};

const YouTubeCard: React.FC<YouTubeVideo> = ({ id, snippet }) => {
  const decodedTitle = decodeHtmlEntities(snippet.title);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false); // State to track if the video is a favorite
  const [friends, setFriends] = useState<string[]>([]); // State for friends list
  const [shareVisible, setShareVisible] = useState(false); // State for share menu
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setDropdownVisible(false);
      setShareVisible(false); // Close share menu
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const checkIfFavorite = async () => {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user?.id)
        .eq('content->>id', id.videoId ? id.videoId : id) // Check if the content is already in favorites
        .single();

      if (data) {
        setIsFavorite(true);
      }
    };

    if (user) {
      checkIfFavorite();
    }
  }, [user, id.videoId]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent click from propagating to the card
    const userId = user?.id;
    const contentType = 'youtube_video'; // Set content type
    const content = {
      id: id.videoId ? id.videoId : id, // Include the id property
      snippet: {
        title: decodedTitle,
        thumbnails: {
          medium: {
            url: snippet.thumbnails.medium.url,
          },
        },
      },
    };

    try {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', userId)
          .eq('content->>id', id.videoId ? id.videoId : id);

        if (error) throw error;
        setIsFavorite(false);
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert([{ user_id: userId, content, content_type: contentType }]); // Include content_type

        if (error) throw error;
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorites:', error);
    } finally {
      setDropdownVisible(false); // Close dropdown after action
    }
  };

  const handleShareVideo = async (friendId: string, conversationId: string) => {
    const messageContent = {
      type: 'youtube_video',
      id: {videoId: id.videoId},
      snippet: {
      title: snippet.title,
      thumbnails: {medium:{ url: snippet.thumbnails.medium.url}}
      }
    };

    const { error } = await supabase
      .from('messages')
      .insert([
        {
          content: JSON.stringify(messageContent),
          receiver_id: friendId,
          sender_id: user?.id,
          conversation_id: conversationId,
        },
      ]);

    if (error) {
      console.error('Error sharing video:', error);
    } else {
      console.log('Video shared successfully!');
    }

    setShareVisible(false); // Close share menu after sharing
  };

  const fetchFriends = async () => {
    const { data, error } = await supabase
      .from('conversations')
      .select('user1_id, user2_id, id')
      .or(`user1_id.eq.${user?.id},user2_id.eq.${user?.id}`);

    if (error) {
      console.error('Error fetching conversations:', error);
    } else {
      const friendsMap = new Map<string, { username: string; conversationId: string }>();
      const friendIds = new Set<string>();

      data.forEach((conv) => {
        if (conv.user1_id !== user?.id) {
          friendIds.add(conv.user1_id);
          friendsMap.set(conv.user1_id, { username: '', conversationId: conv.id });
        }
        if (conv.user2_id !== user?.id) {
          friendIds.add(conv.user2_id);
          friendsMap.set(conv.user2_id, { username: '', conversationId: conv.id });
        }
      });

      if (friendIds.size > 0) {
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('user_id, username')
          .in('user_id', Array.from(friendIds));

        if (profileError) {
          console.error('Error fetching profiles:', profileError);
        } else {
          profiles.forEach((profile) => {
            if (friendsMap.has(profile.user_id)) {
              friendsMap.get(profile.user_id)!.username = profile.username;
            }
          });
        }
      }

      setFriends(Array.from(friendsMap.entries()));
    }
  };

  return (
    <div style={{
      margin: '10px',
      width: '320px',
      overflow: 'hidden',
      borderRadius: '10px',
      boxShadow: '0 4px 8px rgba(0,0,0)',
      position: 'relative', // Added for dropdown positioning
    }}>
      <a
        href={`https://www.youtube.com/watch?v=${id.videoId}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        <img
          src={snippet.thumbnails.medium.url}
          alt={decodedTitle}
          style={{
            width: '100%',
            height: '180px',
            objectFit: 'cover',
            borderTopLeftRadius: '10px',
            borderTopRightRadius: '10px',
          }}
        />
        <div style={{ padding: '10px', color: '#fffaf3', backgroundColor: '#212121' }}>
          <p style={{
            margin: '0',
            fontSize: '14px',
            fontWeight: 'bold',
            lineHeight: '1.2',
            maxHeight: '2.4em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>
            {decodedTitle}
          </p>
        </div>
      </a>
      <div style={{ position: 'absolute', bottom: '10px', right: '10px' }} ref={dropdownRef}>
        <button 
          onClick={(e) => {
            e.stopPropagation(); // Prevent click from propagating to the card
            setDropdownVisible(!dropdownVisible);
            fetchFriends(); // Fetch friends when dropdown is opened
          }} 
          style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
        >
          ⋮ {/* Three dots icon */}
        </button>
        {dropdownVisible && (
          <div style={{
            position: 'absolute',
            bottom: '40px', // Position above the button
            right: 0,
            backgroundColor: 'black',
            borderRadius: '5px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
            zIndex: 1000,
            padding: '5px',
          }}>
            <button onClick={handleToggleFavorite} style={{ color: 'white' }}>
              {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            </button>
            <br></br>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShareVisible(!shareVisible);
              }} 
              style={{ color: 'white' }}
            >
              Share with Friends
            </button>
            {shareVisible && (
  <div style={{
    position: 'absolute',
    bottom: '40px',
    right: 0,
    backgroundColor: '#fffaf3',
    borderRadius: '5px',
    zIndex: 1000,
    padding: '5px',
  }}>
    {friends.map(([friendId, { username, conversationId }]) => ( // Destructure friendId and user data
      <button key={friendId} onClick={() => handleShareVideo(friendId, conversationId)} style={{ color: 'white', padding: '10px', backgroundColor: 'black', margin: '5px', borderRadius: '20px' }}>
            {username} {/* Display the friend's username */}
      </button>
    ))}
  </div>
)}
          </div>
        )}
      </div>
    </div>
  );
};

export default YouTubeCard;
