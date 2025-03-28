/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Profile } from "../../app/types/types";
import { supabase } from "../../lib/supabase";

interface UserProfileClientProps {
  profile: Profile;
}

export default function UserProfileClient({ profile }: UserProfileClientProps) {
  const { user } = useUser();
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [friendCount, setFriendCount] = useState<number>(0);
  const [isFriend, setIsFriend] = useState<boolean>(false); // New state

  useEffect(() => {
    if (user) {
      setIsOwnProfile(user.id === profile.user_id);
    }
  }, [user, profile.user_id]);

  // Fetch the number of friends for this profile
  useEffect(() => {
    const fetchFriendCount = async () => {
      const { data, error } = await supabase
        .from("friends")
        .select("*", { count: "exact" })
        .or(`user_id.eq.${profile.user_id},friend_id.eq.${profile.user_id}`); // Check both columns

      if (error) {
        console.error("Error fetching friend count:", error);
        return;
      }

      setFriendCount(data.length);
    };

    fetchFriendCount();
  }, [profile.user_id]);

  // Check if the current user is already friends with this profile
  useEffect(() => {
    const checkFriendshipStatus = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("friends")
        .select("*")
        .or(
          `and(user_id.eq.${user.id},friend_id.eq.${profile.user_id}),and(user_id.eq.${profile.user_id},friend_id.eq.${user.id})`
        ); // Check both directions of friendship

      if (error) {
        console.error("Error checking friendship status:", error);
        return;
      }

      setIsFriend(data.length > 0); // Set as friend if any match is found
    };

    checkFriendshipStatus();
  }, [user, profile.user_id]);

  const handleFriendRequest = async () => {
    if (!user) return;

    await supabase
      .from("friend_requests")
      .insert({ sender_id: user.id, receiver_id: profile.user_id });

    alert("Friend request sent!");
  };

  const handleRemoveFriend = async () => {
    if (!user) return;

    const { error } = await supabase
      .from("friends")
      .delete()
      .or(
        `and(user_id.eq.${user.id},friend_id.eq.${profile.user_id}),and(user_id.eq.${profile.user_id},friend_id.eq.${user.id})`
      ); // Delete friendship in either direction

    if (error) {
      console.error("Error removing friend:", error);
      return;
    }

    setIsFriend(false); // Update state after removal
    alert("Friend removed.");
  };

  return (
    <>
      <div className="profile-container">
        <img
          src={
            profile.avatar_url
              ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${profile.avatar_url}`
              : "/profile2.png"
          }
          alt={`${profile.username}'s avatar`}
          className="profile-avatar"
        />

        <div className="profile-details">
          <div className="username-container">
            <h2 className="profile-username">{profile.username}</h2>
            <div className="profile-action">
          {isOwnProfile ? (
            <Link href="/account">
              <button className="action-button">Edit Profile</button>
            </Link>
          ) : isFriend ? (
            <button className="action-button" onClick={handleRemoveFriend}>
              Remove Friend
            </button>
          ) : (
            <button className="action-button" onClick={handleFriendRequest}>
              Add Friend
            </button>
          )}
        </div>
          </div>
          <p className="friend-count">
              {friendCount} {friendCount === 1 ? "friend" : "friends"}
            </p>
          <p className="profile-fullname">{profile.full_name || "Full name"}</p>
          <p className="profile-bio">{profile.bio || "No bio available."}</p>
        </div>

        
      </div>

      <style>{`
        .profile-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background-color: black;
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 15px;
          color: white;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .profile-avatar {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          margin-right: 20px;
        }

        .profile-details {
          flex-grow: 1;
          text-align: left;
        }

        .username-container {
          display: flex;
          align-items: center;
        }

        .profile-username {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0;
        }

        .friend-count {
          margin-left: 10px;
          font-size: 1rem;
          color: #ccc;
        }

        .profile-fullname {
          margin: 5px 0;
          font-size: 1rem;
          font-weight: 500;
        }

        .profile-bio {
          margin: 5px 0;
          font-size: 0.9rem;
          color: #ccc;
        }

        .profile-action {
          display: flex;
          align-items: center;
        }

        .action-button {
          background-color: white;
          color: black;
          border: none;
          padding: 10px 20px;
          border-radius: 20px;
          font-size: 0.9rem;
          cursor: pointer;
          margin-left: 15px;
          transition: background-color 0.3s;
        }

        .action-button:hover {
          background-color: #d3d3d3;
        }
      `}</style>
    </>
  );
}
