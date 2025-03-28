// app/[username]/FavoritesSection.tsx
import React from 'react';
import Link from 'next/link';
import { FaHeart } from 'react-icons/fa6';

const FavoritesSection = () => {
  return (
    <Link href="/favorites" style={{ textDecoration: 'none' }}>
      <div style={containerStyle}>
        <h2 style={headerStyle}>
          Favorites <FaHeart style={iconStyle} />
        </h2>
        <p style={descriptionStyle}>A feed of all your saved content</p>
      </div>
    </Link>
  );
};

// Inline styles
const containerStyle: React.CSSProperties = {
  marginTop: '30px',
  background: 'linear-gradient(to right, #cdf564, #f037a5)', // Adjusted to match the image
  padding: '20px',
  borderRadius: '20px', // Rounded corners
  color: 'black',
  textAlign: 'left',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  height: '150px'
};

const headerStyle: React.CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: 'bold',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  margin: 0,
  color: '#fffaf3'
};

const iconStyle: React.CSSProperties = {
  color: '#fffaf3',
  fontSize: '1.3rem',
};

const descriptionStyle: React.CSSProperties = {
  fontSize: '1rem',
  marginTop: '5px',
  marginBottom: 0,
  color: '#fffaf3',
};

export default FavoritesSection;
