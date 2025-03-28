// app/[username]/page.tsx
import { notFound } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import React from 'react';
import UserProfileClient from './UserProfileClient';
import FeedList from './FeedList'; // Import the FeedList component

interface UserProfileProps {
  params: {
    username: string;
  };
}

export default async function UserProfile({ params }: UserProfileProps) {
  const { username } = params;

  // Fetch user profile from Supabase
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();

  if (error || !profile) {
    notFound(); // Redirect to 404 if the user is not found
  }

  return (
    <div style={{ padding: '20px', maxWidth: '700px', margin: '0 auto' }}>
      {/* Pass the profile data to the client component */}
      <UserProfileClient profile={profile} />
      <div style={{ height: '4px', backgroundColor: '#fffaf3', margin: '20px 0', borderRadius: '20px' }}></div>
      {/* Feed List Section */}
      <FeedList profile={profile} /> {/* Pass the profile data to FeedList */}
    </div>
  );
}
