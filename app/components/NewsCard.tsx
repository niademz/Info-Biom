/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
import { useState, useRef, useEffect } from 'react';
import { supabase } from "@/lib/supabase"; 
import { useUser } from '@clerk/nextjs';

interface NewsArticle {
  title: string;
  url: string;
  urlToImage: string | null;
}

const NewsCard: React.FC<NewsArticle> = ({ title, url, urlToImage }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false); // State to track if the article is a favorite
  const [friends, setFriends] = useState<string[]>([]); // State for friends list
  const [shareVisible, setShareVisible] = useState(false); // State for share menu
  const dropdownRef = useRef<HTMLDivElement>(null);
  const placeholderImage = '/placeholder_news.png';
  const { user } = useUser();

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

  useEffect(() => {
    const checkIfFavorite = async () => {
        const { data, error } = await supabase
            .from('favorites')
            .select('*')
            .eq('user_id', user?.id)
            .eq('content->>url', url) // Check if the content is already in favorites
            .single();

        if (data) {
            setIsFavorite(true);
        }
    };

    if (user) {
        checkIfFavorite();
    }
}, [user, url]);


  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent click from propagating to the card
    const userId = user?.id; 
    const content = { title, url, urlToImage };
    const contentType = 'news-article'; // Set content type

    try {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', userId)
          .eq('content->>url', url); // Assuming 'url' is the unique identifier

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

  const handleSharePost = async (friendId: string, conversationId: string) => {
    const messageContent = {
      type: 'news_article',
      title,
      url,
      urlToImage,
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
        position: 'relative',
        width: '300px',
        height: '200px',
        margin: '10px',
        overflow: 'hidden',
        borderRadius: '10px',
        cursor: 'pointer'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => window.open(url, '_blank')}
    >
      <img 
        src={urlToImage || placeholderImage} 
        alt={title} 
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
      {isHovered && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          whiteSpace: 'normal',
          color: 'white',
          padding: '10px'
        }}>
          {title}
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
            justifyContent: 'left',
            whiteSpace: 'pre'
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
      )}
    </div>
  );
};

export default NewsCard;
