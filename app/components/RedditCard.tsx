/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
import React, { useState, useRef, useEffect } from 'react';
import { supabase } from "@/lib/supabase"; // Import Supabase for database operations
import { useUser } from '@clerk/nextjs';

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

const colors = ['#FF4500', '#00CED1', '#FF69B4', '#FFA500', '#32CD32'];

const RedditCard: React.FC<RedditPost> = ({ id, title, author, subreddit, score, num_comments, url, thumbnail }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [friends, setFriends] = useState<string[]>([]); // State for friends list
  const [shareVisible, setShareVisible] = useState(false); // State for share menu
  const dropdownRef = useRef<HTMLDivElement>(null);
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  const placeholderImage = '/reddit.jpg';
  const { user } = useUser();

  const shouldUseCustomThumbnail = thumbnail === 'self' || thumbnail === 'default' || thumbnail === 'nsfw' || thumbnail === 'spoiler' || thumbnail?.includes('external-preview');

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
        .eq('content->>id', id)
        .single();

      if (data) {
        setIsFavorite(true);
      }
    };

    if (user) {
      checkIfFavorite();
    }
  }, [user, id]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const userId = user?.id; 
    const contentType = 'reddit_post'; 
    const content = { id, title, author, subreddit, score, num_comments, url, thumbnail };

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', userId)
          .eq('content->>id', id);

        if (error) throw error;
        setIsFavorite(false);
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert([{ user_id: userId, content, content_type: contentType }]);

        if (error) throw error;
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorites:', error);
    } finally {
      setDropdownVisible(false);
    }
  };

  const handleSharePost = async (friendId: string, conversationId: string) => {
    const messageContent = {
      type: 'reddit_post',
      id,
      title,
      author,
      subreddit,
      score,
      num_comments,
      url,
      thumbnail,
    };

    const { error } = await supabase
      .from('messages')
      .insert([{ 
        content: JSON.stringify(messageContent),
        receiver_id: friendId,
        sender_id: user?.id,
        conversation_id: conversationId, // Include the conversation ID
      }]);

    if (error) {
      console.error('Error sharing post:', error);
    } else {
      console.log('Post shared successfully!');
    }

    setShareVisible(false); // Close share menu after sharing
  };

  const fetchFriends = async () => {
    const { data, error } = await supabase
      .from('conversations')
      .select('user1_id, user2_id, id') // Assuming 'id' is the conversation ID
      .or(`user1_id.eq.${user?.id},user2_id.eq.${user?.id}`);
  
      if (error) {
        console.error('Error fetching conversations:', error);
      } else {
        const friendsMap = new Map<string, { username: string; conversationId: string }>(); // Map to store friendId and their username with conversationId
        const friendIds = new Set<string>(); // To collect unique friend IDs
    
        data.forEach(conv => {
          if (conv.user1_id !== user?.id) {
            friendIds.add(conv.user1_id); // Collect friend ID
            friendsMap.set(conv.user1_id, { username: '', conversationId: conv.id }); // Initialize with empty username
          }
          if (conv.user2_id !== user?.id) {
            friendIds.add(conv.user2_id); // Collect friend ID
            friendsMap.set(conv.user2_id, { username: '', conversationId: conv.id }); // Initialize with empty username
          }
        });
    
        // Fetch usernames for the collected friend IDs
        if (friendIds.size > 0) {
          const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('user_id, username')
            .in('user_id', Array.from(friendIds));
    
          if (profileError) {
            console.error('Error fetching profiles:', profileError);
          } else {
            profiles.forEach(profile => {
              if (friendsMap.has(profile.user_id)) {
                friendsMap.get(profile.user_id)!.username = profile.username; // Set the username
              }
            });
          }
        }
    
        setFriends(Array.from(friendsMap.entries())); // Convert Map to Array of [friendId, { username, conversationId }]
      }
    };

  return (
    <div 
      style={{ 
        margin: '10px', 
        width: '300px',
        overflow: 'hidden',
        borderRadius: '20px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        backgroundColor: '#ffffff',
        color: '#1a1a1b',
        border: `3px solid ${randomColor}`,
        position: 'relative',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        <div style={{ position: 'relative', height: '150px' }}>
          <img
            src={shouldUseCustomThumbnail ? placeholderImage : thumbnail || placeholderImage}
            alt={shouldUseCustomThumbnail ? "Reddit logo" : "Post thumbnail"}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          {isHovered && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
              width: '100%',  
              height: '100%',  
              boxSizing: 'border-box',
            }}>
              <p style={{
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 'bold',
                margin: 0,
                wordBreak: 'keep-all',
                whiteSpace: 'break-spaces',  
                overflowWrap: 'break-word',  
                textAlign: 'center',  
                width: '100%',  
                display: 'block',  
              }}>
                {title}
              </p>
            </div>
          )}
        </div>
        <div style={{ padding: '10px' }}>
          <div style={{
            backgroundColor: randomColor,
            color: '#ffffff',
            padding: '5px 10px',
            borderRadius: '15px',
            display: 'inline-block',
            marginBottom: '10px',
            fontSize: '14px',
            fontWeight: 'bold',
          }}>
            r/{subreddit}
          </div>
          <p style={{ 
            margin: '0 0 5px 0',
            fontSize: '16px',
            fontWeight: 'bold',
            lineHeight: 1.3,
            maxHeight: '2.6em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {title}
          </p>
          <p style={{ fontSize: '12px', color: '#7c7c7c', margin: '0 0 5px 0' }}>
            Posted by u/{author}
          </p>
          <p style={{ fontSize: '12px', color: '#7c7c7c', margin: '0' }}>
            {score} points • {num_comments} comments
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
          style={{ background: 'none', border: 'none', color: 'black', cursor: 'pointer' }}
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
      <button key={friendId} onClick={() => handleSharePost(friendId, conversationId)} style={{ color: 'white', padding: '10px', backgroundColor: 'black', margin: '5px', borderRadius: '20px' }}>
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

export default RedditCard;
