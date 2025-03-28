"use client";

import { useUser } from "@clerk/nextjs";
import FavoritesSection from "./FavoriteSection";
import React from "react";

interface FeedListProps {
  profile: {
    user_id: string; // The ID of the profile being viewed
    username: string;
    // Add any other fields you might need
  };
}

export default function FeedList({ profile }: FeedListProps) {
  const { user } = useUser(); // Get the logged-in user

  const isOwner = user?.id === profile.user_id; // Check if the logged-in user is the profile owner

  return (
    <div style={{ marginTop: '30px' }}>
        
      {isOwner ? (
        // Show FavoritesSection if it's the user's own profile
        <FavoritesSection />
      ) : (
        // Otherwise, show "No feeds yet."
        <p>No feeds yet.</p>
      )}
    </div>
  );
}
