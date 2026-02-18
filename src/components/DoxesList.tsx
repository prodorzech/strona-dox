import React from 'react';
import { Dox } from '../types';
import { escapeHtml } from '../utils';

interface DoxesListProps {
  doxes: Dox[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const DoxesList: React.FC<DoxesListProps> = ({ doxes, onEdit, onDelete }) => {
  if (doxes.length === 0) {
    return (
      <p style={{ textAlign: 'center', color: '#aaa', padding: '40px' }}>
        No doxes yet
      </p>
    );
  }

  return (
    <div className="doxes-list">
      {doxes.map((dox) => (
        <div key={dox.id} className="dox-item">
          <div className="dox-item-info">
            <h3 dangerouslySetInnerHTML={{ __html: escapeHtml(dox.nick) }} />
            <p className="dox-item-desc" dangerouslySetInnerHTML={{ __html: escapeHtml(dox.shortDesc) }} />
          </div>
          <div className="dox-item-actions">
            <button className="btn btn-secondary" onClick={() => onEdit(dox.id)}>
              Edit
            </button>
            <button className="btn btn-danger" onClick={() => onDelete(dox.id)}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DoxesList;
