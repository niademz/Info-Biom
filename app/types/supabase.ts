// types/supabase.ts (Adjust as per your directory structure)
export interface Database {
    public: {
      Tables: {
        messages: {
          Row: {
            id: string;
            sender_id: string;
            receiver_id: string | null;
            conversation_id: number;
            content: string;
            created_at: string;
          };
          Insert: {
            id?: string;
            sender_id: string;
            receiver_id?: string | null;
            conversation_id: number;
            content: string;
            created_at?: string;
          };
          Update: {
            id?: string;
            sender_id?: string;
            receiver_id?: string | null;
            conversation_id?: number;
            content?: string;
            created_at?: string;
          };
        };
      };
    };
  }
  
  // Additional types.ts for messages
  export interface Message {
    id: string;
    sender_id: string;
    receiver_id: string | null;
    conversation_id: number;
    content: string;
    created_at: string;
  }
  