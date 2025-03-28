"use client"
import Image from 'next/image';
import Link from 'next/link';
import styles from './Navbar.module.css';
import Navimage from './logo.png';
import SignOutButton from './SignOutButton';
import { FaHeart } from 'react-icons/fa';
import { FaMessage } from 'react-icons/fa6';
import { FaUser } from 'react-icons/fa';
import { FaHouse } from 'react-icons/fa6';
import { FaRightToBracket } from 'react-icons/fa6';
import { FaBell } from 'react-icons/fa6';
import { FaSearch } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import UserSearchPopup from './UserSearchPopup'; // Import the new search component
import { supabase } from '@/lib/supabase';
import NotificationPopup from './NotificationPopup';
import { useUser } from '@clerk/nextjs';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FaLine } from 'react-icons/fa6';

const Navbar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { user } = useUser();

  const toggleSearchPopup = () => setIsSearchOpen(!isSearchOpen);

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: friendRequests, error: friendRequestError } = await supabase
        .from('friend_requests')
        .select('id, sender_id, status')
        .eq('receiver_id', user?.id)
        .eq('status', 'pending');
  
      const { data: generalNotifications, error: notificationError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_read', false);
  
      if (friendRequestError || notificationError) {
        console.error('Error fetching notifications:', friendRequestError || notificationError);
      } else {
        setNotifications([...friendRequests, ...generalNotifications]);
      }
    };
  
    fetchNotifications();
  }, [user?.id]);


  

  const handleNotificationToggle = () => {
    setShowNotifications((prev) => !prev);
  };

  const handleCloseNotificationPopup = () => {
    setShowNotifications(false);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logoContainer}>
        <Image src={Navimage} alt="Logo" width={50} height={50} />
      </div>
      <div className={styles.navLinks}>
        <Link href="/"><FaHouse style={{ width: '50px', height: '50px', paddingInline: '10px' }} /></Link>
        <Link href="/favorites"><FaHeart style={{ width: '50px', height: '50px', paddingInline: '10px' }} /></Link>
        <Link href="/chat"><FaMessage style={{ width: '50px', height: '50px', paddingInline: '10px' }} /></Link>
        <Link href={`${user?.username}`}><FaUser style={{ width: '50px', height: '50px', paddingInline: '10px' }} /></Link>
        <FaSearch style={{ width: '50px', height: '50px', paddingInline: '10px', cursor: 'pointer' }} onClick={toggleSearchPopup} />
        <FaBell
          style={{ width: '50px', height: '50px', paddingInline: '10px', cursor: 'pointer' }}
          onClick={handleNotificationToggle}
        />
        <Link href="/sign-in"><FaRightToBracket style={{ width: '50px', height: '50px', paddingInline: '10px' }} /></Link>
        <SignOutButton />
      </div>
      {isSearchOpen && <UserSearchPopup onClose={toggleSearchPopup} />}

      {/* Notification Popup */}
      {showNotifications && (
        <NotificationPopup
          notifications={notifications}
          onClose={handleCloseNotificationPopup}
        />
      )}
      {/*Add a link that takes you to your actual profile.*/}
    </nav>
  );
};

export default Navbar;
