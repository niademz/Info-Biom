/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@clerk/nextjs'; // Use Clerk for auth
import { Conversation, Profile } from '@/app/types/types'; // Ensure Profile type is imported
import "@/app/chat/styles.css"
import Image from 'next/image';

interface ConversationListProps {
  onSelectConversation: (conversationId: number, partnerId: string) => void;
  setShowUserSearch: (show: boolean) => void;
}

const formatTimeAgo = (timestamp: string) => {
  const now = new Date();
  const then = new Date(timestamp);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  
  if (seconds < 60) return `${seconds} sec${seconds !== 1 ? 's' : ''} ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min${Math.floor(seconds / 60) !== 1 ? 's' : ''} ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hour${Math.floor(seconds / 3600) !== 1 ? 's' : ''} ago`;
  return `${Math.floor(seconds / 86400)} day${Math.floor(seconds / 86400) !== 1 ? 's' : ''} ago`;
};

export default function ConversationList({ onSelectConversation, setShowUserSearch }: ConversationListProps) {
  const { user } = useUser(); // Clerk user
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [userProfiles, setUserProfiles] = useState<{ [key: string]: Profile }>({});
  const [lastMessageTimes, setLastMessageTimes] = useState<{ [key: number]: string }>({}); // Store message times by conversation ID

  useEffect(() => {
    const fetchConversations = async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('id, user1_id, user2_id, last_message_id')
        .or(`user1_id.eq.${user?.id},user2_id.eq.${user?.id}`);

      if (error) {
        console.error('Error fetching conversations:', error);
      } else {
        setConversations(data as unknown as Conversation[]);
        fetchUserProfiles(data as unknown as Conversation[]);
        fetchLastMessageTimes(data as unknown as Conversation[]);
      }
    };

    if (user?.id) {
      fetchConversations();

      // Subscribe to real-time updates for the conversations table
      const conversationSubscription = supabase
        .channel('conversation-updates')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'conversations' },
          (payload) => {
            const updatedConversation = payload.new as Conversation;
            if (updatedConversation.last_message_id) {
              updateLastMessageTime(updatedConversation.id, updatedConversation.last_message_id);
            }
          }
        )
        .subscribe();

      // Cleanup subscription on component unmount
      return () => {
        supabase.removeChannel(conversationSubscription);
      };
    }
  }, [user?.id]);

  const fetchUserProfiles = async (conversations: Conversation[]) => {
    const userIds = conversations.flatMap(conv => [conv.user1_id, conv.user2_id]);
    const uniqueUserIds = Array.from(new Set(userIds));

    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, username, avatar_url')
      .in('user_id', uniqueUserIds);

    if (error) {
      console.error('Error fetching user profiles:', error);
    } else {
      const profiles = data as Profile[];
      const profilesMap = profiles.reduce((acc, profile) => {
        acc[profile.user_id] = profile;
        return acc;
      }, {} as { [key: string]: Profile });
      setUserProfiles(profilesMap);
    }
  };

  const fetchLastMessageTimes = async (conversations: Conversation[]) => {
    const lastMessageIds = conversations.map(conv => conv.last_message_id);

    const { data, error } = await supabase
      .from('messages')
      .select('id, created_at')
      .in('id', lastMessageIds);

    if (error) {
      console.error('Error fetching last message times:', error);
    } else {
      const messageTimes = data.reduce((acc, message) => {
        acc[message.id] = message.created_at;
        return acc;
      }, {} as { [key: number]: string });

      // Initialize the lastMessageTimes state on initial load
      const initialLastMessageTimes = conversations.reduce((acc, conversation) => {
        if (messageTimes[conversation.last_message_id]) {
          acc[conversation.id] = messageTimes[conversation.last_message_id];
        }
        return acc;
      }, {} as { [key: number]: string });
      setLastMessageTimes(initialLastMessageTimes);

      // Sort conversations based on initial last message times
      setConversations((convs) =>
        [...convs].sort((a, b) =>
          new Date(initialLastMessageTimes[b.id] || 0).getTime() -
          new Date(initialLastMessageTimes[a.id] || 0).getTime()
        )
      );
    }
  };

  // Update last message time for a specific conversation
  const updateLastMessageTime = async (conversationId: number, lastMessageId: number) => {
    const { data, error } = await supabase
      .from('messages')
      .select('created_at')
      .eq('id', lastMessageId)
      .single();

    if (error) {
      console.error('Error fetching updated message time:', error);
    } else if (data) {
      setLastMessageTimes((prevTimes) => {
        const updatedTimes = { ...prevTimes, [conversationId]: data.created_at };
        
        // Re-sort conversations based on the new last message time
        setConversations((convs) =>
          [...convs].sort((a, b) =>
            new Date(updatedTimes[b.id] || 0).getTime() -
            new Date(updatedTimes[a.id] || 0).getTime()
          )
        );
        
        return updatedTimes;
      });
    }
  };

  return (
    <div className="conversation-list">
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', paddingBottom: '10px' }}>
          <h2 className="user-username">{user.username}</h2>
          <div style={{right: '0%'}}>
          <button onClick={() => setShowUserSearch(true)} className="plus-button">
            <Image src="/plus.png" alt="Add User" width={20} height={20} />
          </button>
          </div>
          <hr className="divider" />
        </div>
      )}
      {conversations.length === 0 ? (
        <p>No conversations yet.</p>
      ) : (
        <ul>
          {conversations.map((conv) => {
            const partnerId = conv.user1_id === user?.id ? conv.user2_id : conv.user1_id;
            const partnerProfile = userProfiles[partnerId];
            const avatarUrl = partnerProfile?.avatar_url
              ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${partnerProfile.avatar_url}`
              : '/profile2.png'; 

            const lastMessageTime = lastMessageTimes[conv.id] || null;

            return (
              <li key={conv.id} onClick={() => onSelectConversation(conv.id, partnerId)} className="user-item">
                {partnerProfile ? (
                  <>
                    <img
                      src={avatarUrl}
                      alt={`${partnerProfile.username}'s avatar`}
                      className="avatar"
                    />
                    <span className="username">{partnerProfile.username}</span>
                    {lastMessageTime && (
                      <>
                        <span className="dot">•</span> {/* Dot between username and time */}
                        <span className="last-message-time">
                          {formatTimeAgo(lastMessageTime)}
                        </span>
                      </>
                    )}
                  </>
                ) : (
                  <span>Loading...</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
