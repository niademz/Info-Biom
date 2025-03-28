'use client'
import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Avatar from './Avatar'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Preferences() {
  const { user } = useUser()
  const router = useRouter()

  const [profile, setProfile] = useState({
    username: '',
    full_name: '',
    website: '',
    bio: '',
    avatar_url: null as string | null
  })

  const categories = [
    { 
      name: 'music', 
      options: [
        'Rock', 'Pop', 'Jazz', 'Classical', 'Hip Hop', 'Afrobeat', 'R&B', 'Reggae', 'Country', 'Blues', 
        'Folk', 'Electronic', 'House', 'Indie', 'Metal', 'Punk', 'K-Pop', 'J-Pop', 'Salsa', 'Bachata', 
        'Cumbia', 'Dancehall', 'Soul', 'Gospel', 'Trap', 'Alternative', 'Opera', 'Grunge', 'Dubstep', 
        'Trance', 'Drum & Bass', 'Techno', 'Latin Pop', 'Funk', 'Disco', 'Lo-fi', 'Ambient', 'World Music', 
        'Chillwave', 'New Age', 'Synthpop', 'Shoegaze', 'Progressive Rock'
      ] 
    },
    { 
      name: 'news', 
      options: [
        'Politics', 'Technology', 'Science', 'Entertainment', 'Sports', 'Business', 'World', 'Health', 
        'Environment', 'Education', 'Economics', 'Culture', 'Local News', 'Crime', 'Weather', 
        'Social Justice', 'Human Rights', 'Travel', 'Lifestyle', 'Fashion', 'Food & Drink', 
        'Space Exploration', 'Climate Change', 'Tech Startups', 'Mental Health', 'Public Policy', 
        'Pandemics', 'Art & Design', 'Energy', 'Innovation', 'Media', 'Agriculture', 'Transportation'
      ] 
    },
    { 
      name: 'youtube', 
      options: [
        'Vlogs', 'Tutorials', 'Gaming', 'Music', 'Comedy', 'Documentaries', 'How-tos', 'Unboxing', 'Reviews', 
        'Makeup Tutorials', 'Travel', 'Fitness', 'Cooking', 'DIY Projects', 'Tech Reviews', 'Educational', 
        'ASMR', 'Motivational', 'Skits', 'Podcasts', 'Fashion', 'Booktube', 'Beauty', 'Challenges', 
        'Science Explainers', 'Lifestyle Vlogs', 'Film Analysis', 'Reaction Videos', 'Art', 'History', 
        'Live Streams', 'Health & Wellness', 'Parenting', 'Finance', 'Career Tips', 'Mindfulness', 
        'Gardening', 'Sports Highlights', 'Outdoor Adventures', 'Music Production', 'Language Learning'
      ] 
    },
    { 
      name: 'reddit', 
      options: [
        'AskReddit', 'AITA', 'worldnews', 'funny', 'gaming', 'pics', 'aww', 'todayilearned', 'science', 
        'lifehacks', 'IAmA', 'Showerthoughts', 'relationship_advice', 'wholesomememes', 
        'technology', 'movies', 'books', 'dataisbeautiful', 'food', 'Art', 'explainlikeimfive', 
        'nosleep', 'TIL', 'Futurology', 'space', 'news', 'Music', 'History', 'changemyview', 
        'nostalgia', 'DIY', 'fitness', 'photography', 'travel', 'legaladvice', 'writing', 
        'creepy', 'askscience', 'philosophy', 'UpliftingNews', 'sports', 'Jokes', 'anime', 
        'offmychest', 'personalfinance', 'hiking', 'whatisthisthing', 'TrueCrime', 'GetMotivated'
      ] 
    },
    { 
      name: 'books', 
      options: [
        'Fiction', 'Non-fiction', 'Sci-Fi', 'Mystery', 'Biography', 'Fantasy', 'Historical Fiction', 
        'Thriller', 'Romance', 'Horror', 'Self-help', 'Memoir', 'Young Adult', 'Adventure', 
        'Graphic Novels', 'Classic Literature', 'Poetry', 'Crime', 'Psychological Thriller', 
        'Humor', 'Dystopian', 'Children’s Literature', 'Short Stories', 'Autobiography', 
        'Essays', 'Spirituality', 'Philosophy', 'Science', 'Political', 'Environmental', 
        'Travel Writing', 'Literary Fiction', 'Magical Realism', 'Satire', 'LGBTQ+', 
        'Contemporary Fiction', 'Urban Fantasy', 'Paranormal', 'Historical Non-fiction', 'War Stories'
      ] 
    }
  ];

  const [preferences, setPreferences] = useState<Record<string, string[]>>(() =>
    categories.reduce((acc, category) => ({ ...acc, [category.name]: [] }), {})
  )

  useEffect(() => {
    if (user) {
      fetchUserData()
    }
  }, [user])

  const fetchUserData = async () => {
    if (!user) return

    // Fetch profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
    } else if (profileData) {
      setProfile({
        username: profileData.username || '',
        full_name: profileData.full_name || '',
        website: profileData.website || '',
        bio: profileData.bio || '',
        avatar_url: profileData.avatar_url || null
      })
    }

    // Fetch preferences
    const { data: preferencesData, error: preferencesError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (preferencesError) {
      console.error('Error fetching preferences:', preferencesError)
    } else if (preferencesData) {
      setPreferences({
        music: preferencesData.music || [],
        news: preferencesData.news || [],
        youtube: preferencesData.youtube || [],
        reddit: preferencesData.reddit || [],
        books: preferencesData.books || []
      })
    }
  }

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  const handleOptionClick = (category: string, value: string) => {
    setPreferences(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(item => item !== value)
        : [...prev[category], value]
    }))
  }

  const handleAvatarUpload = (url: string) => {
    setProfile(prev => ({ ...prev, avatar_url: url }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      // Save profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({ 
          user_id: user.id,
          username: profile.username,
          full_name: profile.full_name,
          website: profile.website,
          bio: profile.bio,
          avatar_url: profile.avatar_url
        }, { onConflict: 'user_id' })

      if (profileError) throw profileError

      // Save preferences
      const { error: preferencesError } = await supabase
        .from('user_preferences')
        .upsert({ 
          user_id: user.id,
          music: preferences.music,
          news: preferences.news,
          youtube: preferences.youtube,
          reddit: preferences.reddit,
          books: preferences.books
        }, { onConflict: 'user_id' })

      if (preferencesError) throw preferencesError

      console.log('Profile and preferences saved successfully')
      router.push('/')
    } catch (error) {
      console.error('Error saving profile or preferences:', error)
      alert('Failed to save profile or preferences. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ 
        textAlign: 'center',
        fontSize: '2.5rem',
        marginBottom: '30px',
        letterSpacing: '0.04em',
        fontFamily: '"LOT", "Arial", sans-serif',
        color: '#fffaf3',
        fontWeight: 400,
      }}>Update Your Profile</h2>

      {/* Avatar component */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        <Avatar
          uid={user?.id || null}
          url={profile.avatar_url}
          size={150}
          onUpload={handleAvatarUpload}
        />
      </div>

      {/* Profile inputs with bubble styling */}
      <div style={{ marginBottom: '2rem' }}>
        <input
          type="text"
          name="username"
          value={profile.username}
          onChange={handleProfileChange}
          placeholder="Username"
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '10px',
            borderRadius: '20px',
            border: '2px solid #fffaf3',
            backgroundColor: '#2c2c2c',
            color: '#fffaf3',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border 0.3s',
          }}
        />
        <input
          type="text"
          name="full_name"
          value={profile.full_name}
          onChange={handleProfileChange}
          placeholder="Full Name"
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '10px',
            borderRadius: '20px',
            border: '2px solid #fffaf3',
            backgroundColor: '#2c2c2c',
            color: '#fffaf3',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border 0.3s',
          }}
        />
        <textarea
          name="bio"  // New bio field
          value={profile.bio}
          onChange={(e) => handleProfileChange(e as unknown as React.ChangeEvent<HTMLInputElement>)}
          placeholder="Write a short bio"
          maxLength={150}
          rows={3}
          style={{ width: '100%',
            padding: '10px',
            marginBottom: '10px',
            borderRadius: '20px',
            border: '2px solid #fffaf3',
            backgroundColor: '#2c2c2c',
            color: '#fffaf3',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border 0.3s',}}
        />
        <p style={{ textAlign: 'right', color: '#fffaf3', marginBottom: '10px' }}>
          {profile.bio.length} / 150
        </p>
        <input
          type="text"
          name="website"
          value={user?.emailAddresses}
          onChange={handleProfileChange}
          placeholder="email"
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '10px',
            borderRadius: '20px',
            border: '2px solid #fffaf3',
            backgroundColor: '#2c2c2c',
            color: '#fffaf3',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border 0.3s',
          }}
        />
      </div>

      <h2 style={{ 
        textAlign: 'center',
        fontSize: '2rem',
        marginBottom: '20px',
        fontFamily: '"LOT", "Arial", sans-serif',
        color: '#fffaf3',
        fontWeight: 400,
      }}>Update Your Preferences</h2>
      
      {/* Preferences bubbles */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px' }}>
        {categories.map(category => (
          <div key={category.name} style={{
            backgroundColor: '#fffaf3',
            borderRadius: '20px',
            padding: '10px 15px',
            color: 'black',
            fontFamily: 'Arial, sans-serif',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
          }}>
            {category.name.toUpperCase()}
          </div>
        ))}
      </div>

      {/* Options for each category */}
      {categories.map(category => (
        <div key={category.name} style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontFamily: 'Arial, sans-serif', fontSize: '1.2rem', marginBottom: '0.5rem', color: '#fffaf3' }}>
            {category.name.charAt(0).toUpperCase() + category.name.slice(1)} Options
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px',justifyContent: 'center' }}>
            {category.options.map(option => (
              <div key={option} onClick={() => handleOptionClick(category.name, option)} style={{
                backgroundColor: preferences[category.name].includes(option) ? '#2c2c2c' : '#2c2c2c',
                border: preferences[category.name].includes(option) ? '3px solid #fffaf3' : 'none', // Thicker border for highlighted
                borderRadius: '15px',
                padding: '5px 10px',
                cursor: 'pointer',
                transition: 'background-color 0.3s, border 0.3s',
                color: '#fffaf3',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span>{option}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      <button type="submit" style={{
        display: 'block',
        width: '100%',
        padding: '10px',
        backgroundColor: '#fffaf3',
        color: 'black',
        border: 'none',
        borderRadius: '5px',
        fontSize: '1rem',
        font: 'Arial,sans-serif',
        cursor: 'pointer',
        marginTop: '2rem',
      }}>Update Profile and Preferences</button>
    </form>
  )
}