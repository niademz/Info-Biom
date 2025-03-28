/* eslint-disable @next/next/no-img-element */
import React from 'react';

interface ChatMessageProps {
  message: {
    type: string;
    content?: string; // Allow for plain text content
    [key: string]: any; // Allow any additional properties
  };
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  // Check if the message is plain text
  if (message.type === 'text' && message.content) {
    return (
      <div style={{ padding: '10px', margin: '10px 0', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <p>{message.content}</p>
      </div>
    );
  }

  switch (message.type) {
    case 'reddit_post':
      return (
        <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
          <h3>{message.title}</h3>
          <p>Posted by u/{message.author} in r/{message.subreddit}</p>
          <p>{message.score} points • {message.num_comments} comments</p>
          <a href={message.url} target="_blank" rel="noopener noreferrer">
            <img src={message.thumbnail} alt={message.title} style={{ width: '100%' }} />
          </a>
        </div>
      );

    case 'book':
      return (
        <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
          <h3>{message.title}</h3>
          <p>Authors: {message.authors.join(', ')}</p>
          <p>{message.description}</p>
          <a href={message.infoLink} target="_blank" rel="noopener noreferrer">
            <img src={message.thumbnail} alt={message.title} style={{ width: '100%' }} />
          </a>
        </div>
      );

    case 'youtube_video':
      return (
        <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
          <h3>{message.title}</h3>
          <a href={`https://www.youtube.com/watch?v=${message.id}`} target="_blank" rel="noopener noreferrer">
            <img src={message.thumbnail} alt={message.title} style={{ width: '100%' }} />
          </a>
        </div>
      );

    case 'news_article':
      return (
        <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
          <h3>{message.title}</h3>
          <a href={message.url} target="_blank" rel="noopener noreferrer">
            <img src={message.urlToImage} alt={message.title} style={{ width: '100%' }} />
          </a>
        </div>
      );

    case 'spotify_track':
      return (
        <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
          <h3>{message.name}</h3>
          <p>Artists: {message.artists.map((artist: any) => artist.name).join(', ')}</p>
          <a href={message.external_urls.spotify} target="_blank" rel="noopener noreferrer">
            <img src={message.album.images[0].url} alt={message.name} style={{ width: '100%' }} />
          </a>
        </div>
      );

    case 'spotify_album':
      return (
        <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
          <h3>{message.name}</h3>
          <p>Artists: {message.artists.map((artist: any) => artist.name).join(', ')}</p>
          <a href={message.external_urls.spotify} target="_blank" rel="noopener noreferrer">
            <img src={message.images[0].url} alt={message.name} style={{ width: '100%' }} />
          </a>
        </div>
      );

    default:
      return <div>Unknown message type</div>;
  }
};

export default ChatMessage;