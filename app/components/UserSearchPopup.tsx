/* eslint-disable @next/next/no-img-element */
import { useState, useEffect, useRef } from 'react';
import { supabase } from "../../lib/supabase";
import { Profile } from '../../app/types/types';
import { useUser } from '@clerk/nextjs';
import "@/app/chat/styles.css"
import React from 'react';

interface UserSearchPopupProps {
  onClose: () => void;
}

export default function UserSearchPopup({ onClose }: UserSearchPopupProps) {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [users, setUsers] = useState<Profile[]>([]);
  const popupRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const searchUsers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .ilike('username', `%${searchTerm}%`);

      if (error) {
        console.error('Error searching users:', error);
      } else {
        const currentUserId = user?.id;
        const filteredUsers = data.filter((profile: any) => profile.user_id !== currentUserId);
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

  const handleProfileClick = (username: string) => (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent the default link behavior
    onClose(); // Close the popup
    window.location.href = `/${username}`; // Navigate to the user's profile
  };

  return (
    <div style={overlayStyles} onClick={onClose}>
      <div
        className="user-search-popup"
        style={popupStyles}
        ref={popupRef}
        onClick={(e) => e.stopPropagation()} // Prevent overlay close when clicking inside the popup
      >
        <input
          type="text"
          placeholder="Search users"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <ul>
          {users.length > 0 ? (
            users.map((user) => (
              <li key={user.user_id} onClick={handleProfileClick(user.username)}>
                <img
                  src={
                    user.avatar_url
                      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${user.avatar_url}`
                      : '/profile2.png'
                  }
                  alt="User Avatar"
                  className="avatar"
                />
                {user.username}
              </li>
            ))
          ) : (
            <li style={{ textAlign: 'left', color: 'black' }}>No users found.</li>
          )}
        </ul>
        <button onClick={onClose} className="close-button">Close</button>
      </div>
    </div>
  );
}

// Styles
const overlayStyles: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.3)', // Dark semi-transparent overlay
  zIndex: 1000,
};

const popupStyles: React.CSSProperties = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: '#fff',
  borderRadius: '10px',
  padding: '20px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  zIndex: 1001,
  border: '3px solid #000000',
};

