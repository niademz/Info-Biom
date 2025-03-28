/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
import React, { useState, useRef, useEffect } from 'react';
import { supabase } from "@/lib/supabase"; // Import Supabase for database operations
import { useUser } from '@clerk/nextjs';

interface BookInfo {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    imageLinks?: {
      thumbnail: string;
    };
    infoLink: string;
    description?: string;
  };
}

const BookCard: React.FC<BookInfo> = ({ volumeInfo }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
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
        .eq('content->>id', volumeInfo.title)
        .single();

      if (data) {
        setIsFavorite(true);
      }
    };

    if (user) {
      checkIfFavorite();
    }
  }, [user, volumeInfo.title]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const userId = user?.id;
    const contentType = 'book';
    const content = {
      id: volumeInfo.title,
      volumeInfo: {
        title: volumeInfo.title,
        authors: volumeInfo.authors,
        imageLinks: {
          thumbnail: volumeInfo.imageLinks?.thumbnail,
        },
        infoLink: volumeInfo.infoLink,
        description: volumeInfo.description,
      },
    };

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', userId)
          .eq('content->>id', content.id);

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
      type: 'book',
      id: volumeInfo.title,
      volumeInfo: {
        title: volumeInfo.title,
      authors: volumeInfo.authors,
      imageLinks: {
        thumbnail: volumeInfo.imageLinks?.thumbnail,
      },
      infoLink: volumeInfo.infoLink,
      description: volumeInfo.description,
      }
    };

    const { error } = await supabase
      .from('messages')
      .insert([
        {
          content: JSON.stringify(messageContent),
          receiver_id: friendId,
          sender_id: user?.id,
          conversation_id: conversationId, // Include the conversation ID
        },
      ]);

    if (error) {
      console.error('Error sharing book:', error);
    } else {
      console.log('Book shared successfully!');
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
    <div
      style={{
        margin: '10px',
        width: '200px',
        overflow: 'hidden',
        borderRadius: '10px',
        boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
        transition: 'transform 0.3s ease-in-out',
        background: 'white',
        position: 'relative',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <a href={volumeInfo.infoLink} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{ height: '280px', overflow: 'hidden', position: 'relative' }}>
          <img src={volumeInfo.imageLinks?.thumbnail || '/placeholder-book.jpg'} alt={volumeInfo.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
              padding: '20px 10px 10px',
              color: 'white',
              opacity: isHovered ? 0 : 1,
            }}
          >
            <p
              style={{
                margin: '0',
                fontSize: '16px',
                fontWeight: 'bold',
                lineHeight: '1.2',
                maxHeight: '2.4em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {volumeInfo.title}
            </p>
            {volumeInfo.authors && (
              <p style={{ margin: '5px 0 0', fontSize: '14px', opacity: 0.8 }}>{volumeInfo.authors[0]}</p>
            )}
          </div>
          {isHovered && (
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.8)',
                padding: '20px',
                color: 'white',
                overflow: 'auto',
                transition: 'opacity 0.3s ease-in-out',
                whiteSpace: 'pre-wrap',
                opacity: 1,
            }}>
                <p style={{ 
                    fontSize: '14px',
                    lineHeight: '1.4',
                }}>
                    {volumeInfo.description 
                        ? truncateDescription(volumeInfo.description, 200) // Truncate description
                        : 'No description available.'}
                </p>
            </div>
          )}
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

const truncateDescription = (description: string, maxLength: number) => {
  if (description.length <= maxLength) return description;
  return description.slice(0, maxLength) + '...';
};

export default BookCard;
