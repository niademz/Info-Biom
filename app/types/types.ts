// types.ts
export interface Profile {
    user_id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
    bio: string;
  }
  
  export interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    created_at: string;
  }
  
  export interface Conversation {
    id: number;
    user1_id: string;
    user2_id: string;
    created_at: string;
    last_message_id: string | null;
  }
  