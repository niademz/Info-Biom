// components/NotificationPopup.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@clerk/nextjs';

interface NotificationPopupProps {
  onClose: () => void;
}

interface FriendRequestNotification {
  id: string;
  sender_id: string;
  username: string;
  status: 'pending' | 'accepted';
  type: 'friend_request';
}

interface GeneralNotification {
  id: string;
  message: string;
  type: 'general';
}

type Notification = FriendRequestNotification | GeneralNotification;

const NotificationPopup: React.FC<NotificationPopupProps> = ({ onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useUser();

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.id) return;

      // Fetch friend requests
      const { data: friendRequests, error: friendRequestError } = await supabase
        .from('friend_requests')
        .select('id, sender_id, status')
        .eq('receiver_id', user.id);

      if (friendRequestError) {
        console.error('Error fetching friend requests:', friendRequestError);
        return;
      }

      // Get usernames for friend requests and map them
      const friendRequestsWithUsernames = await Promise.all(
        friendRequests.map(async (request) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('username')
            .eq('user_id', request.sender_id)
            .single();
          return {
            ...request,
            username: profileData?.username || 'Unknown',
            type: 'friend_request' as const,
          };
        })
      );

      // Fetch general notifications
      const { data: generalNotifications, error: generalNotificationError } = await supabase
        .from('notifications')
        .select('id, message')
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (generalNotificationError) {
        console.error('Error fetching general notifications:', generalNotificationError);
        return;
      }

      const generalNotificationsMapped: GeneralNotification[] = generalNotifications.map(
        (notification) => ({
          ...notification,
          type: 'general' as const,
        })
      );

      // Combine and set notifications
      setNotifications([...friendRequestsWithUsernames, ...generalNotificationsMapped]);
    };

    fetchNotifications();
  }, [user]);

  const handleAccept = async (notificationId: string, senderId: string) => {
    const { error: updateError } = await supabase
      .from('friend_requests')
      .update({ status: 'accepted' })
      .eq('id', notificationId);

    if (updateError) {
      console.error('Error updating friend request status:', updateError);
      return;
    }

    if (!user) return;

    const { error: insertError } = await supabase
      .from('friends')
      .insert([{ user_id: senderId, friend_id: user.id }]);

    if (insertError) {
      console.error('Error adding to friends table:', insertError);
      return;
    }

    // Fetch current user's username for notification
    const { data: profileData } = await supabase
      .from('profiles')
      .select('username')
      .eq('user_id', user.id)
      .single();

    await supabase
      .from('notifications')
      .insert([
        {
          user_id: senderId,
          message: `${profileData?.username} accepted your friend request`,
        },
      ]);

    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId && notification.type === 'friend_request'
          ? { ...notification, status: 'accepted' }
          : notification
      )
    );
  };

  const handleReject = async (notificationId: string) => {
    const { error } = await supabase.from('friend_requests').delete().eq('id', notificationId);
    if (error) {
      console.error('Error rejecting friend request:', error);
      return;
    }

    setNotifications((prev) => prev.filter((notification) => notification.id !== notificationId));
  };

  return (
    <div style={overlayStyles} onClick={onClose}>
      <div style={popupStyles} onClick={(e) => e.stopPropagation()}>
        <button style={closeButtonStyles} onClick={onClose}>
          &times;
        </button>
        <h3 style={headerStyles}>Notifications</h3>
        <br />
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div key={notification.id} style={notificationItemStyles}>
              {notification.type === 'friend_request' ? (
                <>
                  Friend request from {notification.username}
                  {notification.status === 'pending' ? (
                    <div style={buttonContainerStyles}>
                      <button
                        style={acceptButtonStyles}
                        onClick={() => handleAccept(notification.id, notification.sender_id)}
                      >
                        Accept
                      </button>
                      <button style={rejectButtonStyles} onClick={() => handleReject(notification.id)}>
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span style={friendStatusStyles}>Friends</span>
                  )}
                </>
              ) : (
                <p>{notification.message}</p>
              )}
            </div>
          ))
        ) : (
          <p style={{ color: 'black' }}>No new notifications</p>
        )}
      </div>
    </div>
  );
};

// Inline styles
const overlayStyles: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
  zIndex: 1000,
};

const popupStyles: React.CSSProperties = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: '#fffaf3',
  borderRadius: '20px',
  border: '3px solid #000',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  width: '400px',
  height: '600px',
  padding: '20px',
  zIndex: 1001,
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
};

const closeButtonStyles: React.CSSProperties = {
  alignSelf: 'flex-end',
  background: 'none',
  border: 'none',
  fontSize: '1.5rem',
  cursor: 'pointer',
  color: 'black',
};

const headerStyles: React.CSSProperties = {
  fontFamily: 'LOT, sans-serif',
  fontSize: '2.5rem',
  letterSpacing: '0.04em',
  fontWeight: 400,
  lineHeight: '1.2',
  color: 'black',
};

const notificationItemStyles: React.CSSProperties = {
  padding: '10px',
  marginBottom: '10px',
  backgroundColor: '#f9f9f9',
  borderRadius: '10px',
  border: '1px solid #ddd',
  color: 'black',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const buttonContainerStyles: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
};

const acceptButtonStyles: React.CSSProperties = {
  backgroundColor: '#4CAF50',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  padding: '5px 10px',
  cursor: 'pointer',
};

const rejectButtonStyles: React.CSSProperties = {
  backgroundColor: '#f44336',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  padding: '5px 10px',
  cursor: 'pointer',
};

const friendStatusStyles: React.CSSProperties = {
  color: '#4CAF50',
  fontWeight: 'bold',
};

export default NotificationPopup;
