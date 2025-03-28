/* eslint-disable @next/next/no-img-element */
import { useEffect, useState, useRef } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { useUser } from '@clerk/nextjs'; // Import Clerk hook to get authenticated user
import { Database } from '@/app/types/supabase'; // Adjust the path as necessary
import { Message, Profile } from '@/app/types/types'; // Adjust the path as necessary
import RedditCard from '@/app/components/RedditCard';
import YouTubeCard from '@/app/components/YouTubeCard';
import NewsCard from '@/app/components/NewsCard';
import SpotifyCard from '@/app/components/SpotifyCard';
import SpotifyTrackCard from '@/app/components/SpotifyTrackCard';
import BookCard from '@/app/components/BookCard';
import { FaPaperPlane } from 'react-icons/fa';

interface ChatInterfaceProps {
  supabase: SupabaseClient<Database>;
  conversationId: number;
  receiverId: string | null; // Receive the receiverId as a prop
}

const ChatInterface = ({ supabase, conversationId, receiverId }: ChatInterfaceProps) => {
  const { user } = useUser(); // Clerk hook to get the currently logged-in user
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [receiverProfile, setReceiverProfile] = useState<Profile | null>(null); // State for receiver profile
  const messagesEndRef = useRef<HTMLDivElement | null>(null); // Create a ref for the messages container

  // Function to fetch existing messages for the conversation
  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
    } else {
      setMessages(data || []);
    }
  };

  // Function to fetch receiver's profile
  const fetchReceiverProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, username, avatar_url')
      .eq('user_id', receiverId)
      .single();

    if (error) {
      console.error('Error fetching receiver profile:', error);
    } else {
      setReceiverProfile(data);
    }
  };

  // Send a new message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const { error } = await supabase.from('messages').insert([
      {
        content: newMessage,
        sender_id: user?.id, // Use Clerk's user ID for the sender
        receiver_id: receiverId, // Use the selected receiver's ID
        conversation_id: conversationId,
      },
    ]);

    if (error) {
      console.error('Error sending message:', error);
    } else {
      setNewMessage(''); // Clear the input after sending the message
    }
  };

  useEffect(() => {
    // Fetch existing messages and receiver profile when the component mounts
    fetchMessages();
    fetchReceiverProfile();

    // Set up real-time listener for new messages in this conversation
    const messageChannel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        async (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prevMessages) => [...prevMessages, newMessage]);

          // Fetch the latest message for the conversation
          const { data: latestMessageData, error: latestMessageError } = await supabase
            .from('messages')
            .select('id')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (latestMessageError) {
            console.error('Error fetching latest message:', latestMessageError);
          } else if (latestMessageData) {
            console.log('Latest message ID:', latestMessageData.id); // Log the latest message ID

            // Update the last_message_id in the conversations table
            const { error: convError } = await supabase
              .from('conversations')
              .update({ last_message_id: latestMessageData.id }) // Set last_message_id to the latest message's ID
              .eq('id', conversationId);

            if (convError) {
              console.error('Error updating conversation:', convError);
            } else {
              console.log('Updated last_message_id in conversations table'); // Log successful update
            }
          }
        }
      )
      .subscribe();

    return () => {
      // Clean up the listener when the component unmounts
      messageChannel.unsubscribe();
    };
  }, [conversationId, supabase]);

  // Scroll to the bottom of the messages when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="chat-interface">
      {/* Display receiver's profile at the top */}
      {receiverProfile && (
        <div className="chat-header">
          <img
            src={receiverProfile.avatar_url ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${receiverProfile.avatar_url}` : '/profile2.png'}
            alt={`${receiverProfile.username}'s avatar`}
            className="avatar"
          />
          <span className="user-username">{receiverProfile.username}</span>
        </div>
      )}
      <div className="messages">
        {messages.map((msg) => {
          let content;
          try {
            content = JSON.parse(msg.content);
          } catch (error) {
            console.error('Error parsing message content:', error);
            content = { type: 'text', content: msg.content }; // Fallback to plain text
          }

          // Remove the type from content
          const { type, ...restContent } = content;
          console.log(restContent)
          // Render based on the type
          switch (type) {
            case 'reddit_post':
              return (
                <div key={msg.id} className={`messagecard ${msg.sender_id === user?.id ? 'outgoingcard' : 'incomingcard'}`}>
              <RedditCard key={restContent.id} {...restContent} />
              </div>);
            case 'youtube_video':
              return (
                <div key={msg.id} className={`messagecard ${msg.sender_id === user?.id ? 'outgoingcard' : 'incomingcard'}`}>
              <YouTubeCard key={restContent.id} {...restContent} />
              </div>);
            case 'news_article':
              return (
                <div key={msg.id} className={`messagecard ${msg.sender_id === user?.id ? 'outgoingcard' : 'incomingcard'}`}>
              <NewsCard key={restContent.url} {...restContent} />
              </div>);
            case 'spotify_track':
              return (
                <div key={msg.id} className={`messagecard ${msg.sender_id === user?.id ? 'outgoingcard' : 'incomingcard'}`}>
              <SpotifyTrackCard key={restContent.id} {...restContent} />
              </div>);
            case 'spotify_album':
              return (
                <div key={msg.id} className={`messagecard ${msg.sender_id === user?.id ? 'outgoingcard' : 'incomingcard'}`}>
              <SpotifyCard key={restContent.id} {...restContent} />
              </div>);
            case 'book':
              return (
                <div key={msg.id} className={`messagecard ${msg.sender_id === user?.id ? 'outgoingcard' : 'incomingcard'}`}>
              <BookCard key={restContent.id} {...restContent} />
              </div>
              );
            case 'text':
              return (
                <div key={msg.id} className={`message ${msg.sender_id === user?.id ? 'outgoing' : 'incoming'}`}>
                  <p>{content.content}</p>
                </div>
              );
            default:
              return (
                <div key={msg.id} className={`message ${msg.sender_id === user?.id ? 'outgoing' : 'incoming'}`}>
                  <p>{msg.content}</p>
                </div>)
          }
        })}
        {/* This div will be used to scroll to the bottom */}
        <div ref={messagesEndRef} />
      </div>
      <div className="message-input">
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Message..."
        onKeyDown={(e) => { // Add this event handler
            if (e.key === 'Enter') {
                e.preventDefault(); // Prevent default behavior (like form submission)
                sendMessage(); // Call the sendMessage function
            }
        }}
      />
        <button onClick={sendMessage}> <FaPaperPlane></FaPaperPlane> </button>
      </div>
    </div>
  );
};

export default ChatInterface;
