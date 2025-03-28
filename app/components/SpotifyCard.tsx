/* eslint-disable @typescript-eslint/no-unused-vars */
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";
import React, { useState, useEffect, useRef } from 'react';

interface SpotifyAlbum {
    id: string;
    name: string;
    artists: Array<{ name: string }>;
    images: Array<{ url: string }>;
    external_urls: { spotify: string };
}

const SpotifyCard: React.FC<SpotifyAlbum> = ({ id, name, artists, images, external_urls }) => {
    const { user } = useUser();
    const [isFavorite, setIsFavorite] = useState(false);
    const [friends, setFriends] = useState<string[]>([]); // State for friends list
  const [shareVisible, setShareVisible] = useState(false); // State for share menu
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkIfFavorite = async () => {
            const { data, error } = await supabase
                .from('favorites')
                .select('*')
                .eq('user_id', user?.id)
                .eq('content->>id', id) // Check if the content is already in favorites
                .single();

            if (data) {
                setIsFavorite(true);
            }
        };

        if (user) {
            checkIfFavorite();
        }
    }, [user, id]);

    const handleToggleFavorite = async () => {
        const userId = user?.id; // Replace with actual user ID from context or props
        const contentType = 'spotify_album';
        
        const content = {
            id,
            name,
            artists,
            images,
            external_urls
        };

        try {
            if (isFavorite) {
                // Remove from favorites
                const { error } = await supabase
                    .from('favorites')
                    .delete()
                    .eq('user_id', userId)
                    .eq('content->>id', id);

                if (error) throw error;
                setIsFavorite(false);
            } else {
                // Add to favorites
                const { error } = await supabase
                    .from('favorites')
                    .insert([{ user_id: userId, content, content_type: contentType }]);

                if (error) throw error;
                setIsFavorite(true);
            }
        } catch (error) {
            console.error('Error toggling favorites:', error);
        } finally {
            setDropdownVisible(false); // Close dropdown after action
        }
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setDropdownVisible(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSharePost = async (friendId: string, conversationId: string) => {
        const messageContent = {
          type: 'spotify_album',
          id,
          name,
          artists,
          images,
          external_urls,
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
        <div style={styles.cardContainer}>
            <iframe 
                src={`https://open.spotify.com/embed/album/${id}`}
                width="100%" 
                height="380" 
                frameBorder="0" 
                allowTransparency={true} 
                allow="encrypted-media"
                style={styles.iframe}
            ></iframe>
            <div style={styles.albumInfo}>
                <h3 style={styles.albumName}>{name}</h3>
                <p style={styles.artists}>{artists.map(artist => artist.name).join(', ')}</p>
            </div>
            <div style={{ position: 'relative' }} ref={dropdownRef}>
                <button onClick={() => {setDropdownVisible(!dropdownVisible); fetchFriends();}} style={styles.threeDotsButton}>
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

const styles: { [key: string]: React.CSSProperties } = {
    cardContainer: {
        margin: '10px',
        width: '300px',
        borderRadius: '15px',
        border: '3px solid #1DB954',
        boxShadow: '0px 4px 20px rgba(29, 185, 84, 0.6)',
        overflow: 'hidden',
        transition: 'transform 0.2s ease-in-out',
        backgroundColor: '#121212', // Dark background for Spotify feel
    },
    dropdown: {
        position: 'absolute',
        right: '10px',
        backgroundColor: 'black',
        borderRadius: '5px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
        zIndex: 1000,
        padding: '5px', // Add some padding for better appearance
    },
    threeDotsButton: {
        position: 'absolute',
        bottom: '10px', // Move to bottom
        right: '10px',  // Move to right
        background: 'none',
        border: 'none',
        color: 'white',
        cursor: 'pointer',
        fontSize: '1.5rem',
    },
    iframe: {
        borderRadius: '15px 15px 0 0',
    },
    albumInfo: {
        marginTop: '10px',
        padding: '10px',
        color: 'white',
        textAlign: 'center',
    },
    albumName: {
        margin: '0',
        fontSize: '1.2rem',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        fontFamily: 'Circular, Arial, sans-serif',
        color: '#1DB954',
    },
    artists: {
        margin: '5px 0',
        fontSize: '1rem',
        fontFamily: 'Circular, Arial, sans-serif',
        color: '#fff',
    },
};

export default SpotifyCard;
