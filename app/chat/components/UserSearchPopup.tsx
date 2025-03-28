/* eslint-disable @next/next/no-img-element */
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/app/types/types';
import { useUser } from '@clerk/nextjs';

interface UserSearchPopupProps {
  onSelectUser: (userId: string) => void;
  onClose: () => void;
}

export default function UserSearchPopup({ onSelectUser, onClose }: UserSearchPopupProps) {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [users, setUsers] = useState<Profile[]>([]);
  const popupRef = useRef<HTMLDivElement | null>(null); // Create a ref for the popup

  useEffect(() => {
    const searchUsers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, username, avatar_url')
        .ilike('username', `%${searchTerm}%`);

      if (error) {
        console.error('Error searching users:', error);
      } else {
        const currentUserId = user?.id;
        const filteredUsers = data.filter((user: Profile) => user.user_id !== currentUserId);
        setUsers(filteredUsers as Profile[]);
      }
    };

    if (searchTerm) {
      searchUsers();
    }
  }, [searchTerm, user?.id]);

  // Close the popup when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="user-search-popup" ref={popupRef}>
      <input
        type="text"
        placeholder="Search user"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <ul>
    {users.length > 0 ? ( // Check if there are users
        users.map((user) => (
            <li key={user.user_id} onClick={() => onSelectUser(user.user_id)}>
                <img src={user.avatar_url ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${user.avatar_url}` : '/profile2.png'} alt="User Avatar" className="avatar" />
                {user.username}
            </li>
        ))
    ) : (
        <li style={{ textAlign: 'left', color: 'black' }}>No users found.</li> // Display message if no users
    )}
    </ul>
      <button onClick={onClose} className="close-button">Close</button>
    </div>
  );
}
