/* eslint-disable @next/next/no-img-element */
import React from 'react';

interface PostCardProps {
  platform: 'youtube' | 'news' | 'spotify' | 'pinterest';
  content: string;
  url?: string;
  imageUrl?: string;
  saveCount?: number;
}

const PostCard: React.FC<PostCardProps> = ({ platform, content, url, imageUrl, saveCount }) => {
  const getPlatformStyle = () => {
    switch (platform) {
      case 'youtube':
        return { backgroundColor: '#ff0000', color: '#fff' };
      case 'news':
        return { backgroundColor: '#f8f9fa', color: '#202124' };
      case 'spotify':
        return { backgroundColor: '#1DB954', color: '#fff' };
      case 'pinterest':
        return { backgroundColor: '#E60023', color: '#fff' };
      default:
        return {};
    }
  };

  return (
    <div style={{ ...getPlatformStyle(), padding: '16px', margin: '10px', borderRadius: '8px' }}>
      {imageUrl && <img src={imageUrl} alt={content} style={{ width: '100%', marginBottom: '10px', borderRadius: '4px' }} />}
      <p>{content}</p>
      {platform === 'pinterest' && saveCount !== undefined && (
        <p style={{ fontSize: '0.8em', marginTop: '5px' }}>{saveCount} saves</p>
      )}
      {url && <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginTop: '10px' }}>
        {platform === 'pinterest' ? 'View on Pinterest' : 'Read more'}
      </a>}
    </div>
  );
};

export default PostCard;