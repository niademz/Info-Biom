/* eslint-disable @next/next/no-img-element */
import React from 'react';

interface PinterestCardProps {
    id: string;
    title: string;
    image_url: string;
    link: string;
    save_count: number;
}

const PinterestCard: React.FC<PinterestCardProps> = ({ id, title, image_url, link, save_count }) => {
    return (
        <div style={styles.cardContainer}>
            <img src={image_url} alt={title} style={styles.image} />
            <div style={styles.infoContainer}>
                <h3 style={styles.title}>{title}</h3>
                <p style={styles.saveCount}>{save_count} saves</p>
                <a href={link} target="_blank" rel="noopener noreferrer" style={styles.link}>
                    View on Pinterest
                </a>
            </div>
        </div>
    );
};

const styles = {
    cardContainer: {
        width: '300px',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#FFFFFF',
        transition: 'transform 0.2s ease-in-out',
    },
    image: {
        width: '100%',
        height: '200px',
        objectFit: 'cover' as const,
    },
    infoContainer: {
        padding: '16px',
    },
    title: {
        margin: '0 0 8px 0',
        fontSize: '1.1rem',
        fontWeight: 'bold' as const,
        color: '#333',
    },
    saveCount: {
        margin: '0 0 8px 0',
        fontSize: '0.9rem',
        color: '#666',
    },
    link: {
        display: 'inline-block',
        padding: '8px 16px',
        backgroundColor: '#E60023',
        color: '#FFFFFF',
        textDecoration: 'none',
        borderRadius: '20px',
        fontSize: '0.9rem',
        fontWeight: 'bold' as const,
    },
};

export default PinterestCard;