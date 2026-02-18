import React from 'react';
import { Creator } from '../types';
import { escapeHtml } from '../utils';

interface CreatorsListProps {
  creators: Creator[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const CreatorsList: React.FC<CreatorsListProps> = ({ creators, onEdit, onDelete }) => {
  if (creators.length === 0) {
    return (
      <p style={{ textAlign: 'center', color: '#aaa', padding: '40px' }}>
        No creators yet
      </p>
    );
  }

  return (
    <div className="creators-list">
      {creators.map((creator) => (
        <div key={creator.id} className="creator-item">
          {creator.avatar && (
            <img
              src={creator.avatar}
              alt={escapeHtml(creator.name)}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid white',
              }}
            />
          )}
          <div className="creator-item-info">
            <h3 dangerouslySetInnerHTML={{ __html: escapeHtml(creator.name) }} />
            <p>
              <strong>Role:</strong>{' '}
              <span dangerouslySetInnerHTML={{ __html: escapeHtml(creator.role) }} />
            </p>
            <p>
              <strong>Description:</strong>{' '}
              <span dangerouslySetInnerHTML={{ __html: escapeHtml(creator.description) }} />
            </p>
          </div>
          <div className="creator-item-actions">
            <button className="btn btn-secondary" onClick={() => onEdit(creator.id)}>
              Edit
            </button>
            <button className="btn btn-danger" onClick={() => onDelete(creator.id)}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CreatorsList;
