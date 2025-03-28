/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs'; // Clerk for auth
import ConversationList from './components/ConversationList';
import ChatInterface from './components/ChatInterface';
import UserSearchPopup from './components/UserSearchPopup';
import { supabase } from '@/lib/supabase';
import "@/app/chat/styles.css"

export default function ChatPage() {
  const { user } = useUser();
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [receiverId, setReceiverId] = useState<string | null>(null); // Store receiver ID
  const [showUserSearch, setShowUserSearch] = useState<boolean>(false);

  // Handle conversation selection
  const handleSelectConversation = (conversationId: number, partnerId: string) => {
    setCurrentConversationId(conversationId);
    setReceiverId(partnerId); // Set receiver ID when a conversation is selected
  };

  const handleStartNewConversation = () => {
    setShowUserSearch(true);
  };

  const handleSelectUser = async (userId: string) => {
    // Ensure user IDs are sorted
    const user1Id = user?.id;
    const user2Id = userId;
    const sortedIds = [user1Id, user2Id].sort(); // Sort user IDs
  
    // Check if conversation exists, otherwise create a new one
    const { data, error } = await supabase
      .from('conversations')
      .select('id')
      .or(`user1_id.eq.${sortedIds[0]},user2_id.eq.${sortedIds[0]}`)
      .or(`user1_id.eq.${sortedIds[1]},user2_id.eq.${sortedIds[1]}`)
      .limit(1);

    if (error) {
      console.error('Error checking conversation:', error);
    } else if (data?.length) {
      // Conversation exists, select it
      setCurrentConversationId(data[0].id);
      setReceiverId(userId); // Set the receiver ID when an existing conversation is found
    } else {
      // Create new conversation
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert([
          { user1_id: user?.id, user2_id: userId },
        ])
        .single();

      if (convError) {
        console.error('Error creating conversation:', convError);
      } else {
        setCurrentConversationId(newConv.id);
        setReceiverId(userId); // Set the receiver ID for the new conversation
      }
    }

    setShowUserSearch(false);
  };

  return (
    <div className="chat-page">
        <ConversationList onSelectConversation={handleSelectConversation} setShowUserSearch={setShowUserSearch} />
        {currentConversationId ? (
            <ChatInterface conversationId={currentConversationId} receiverId={receiverId} supabase={supabase} />
        ) : (
            <div className="no-conversation">
              <div style={{height: '0vh'}}></div>
              <center>
                <img src="/plus.png" alt="Start a conversation" style={{ width: '90px', height: '90px' }} />
              
                <button onClick={handleStartNewConversation} className="start-conversation-button">
                    Start a Conversation
                </button>
                </center>
            </div>
        )}
        {showUserSearch && <UserSearchPopup onSelectUser={handleSelectUser} onClose={() => setShowUserSearch(false)} />}
    </div>
  );
}
