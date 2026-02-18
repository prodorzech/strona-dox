import React, { useState, useEffect } from 'react';
import { Creator } from '../types';

interface CreatorModalProps {
  isOpen: boolean;
  creator: Creator | null;
  onClose: () => void;
  onSave: (creatorData: Omit<Creator, 'id'>) => void;
}

const CreatorModal: React.FC<CreatorModalProps> = ({ isOpen, creator, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [description, setDescription] = useState('');
  const [avatar, setAvatar] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (creator) {
      setName(creator.name);
      setRole(creator.role);
      setDescription(creator.description);
      setAvatar(creator.avatar);
    } else {
      resetForm();
    }
  }, [creator]);

  const resetForm = () => {
    setName('');
    setRole('');
    setDescription('');
    setAvatar(undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !role.trim() || !description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    onSave({
      name: name.trim(),
      role: role.trim(),
      description: description.trim(),
      avatar,
    });
    resetForm();
  };

  const handleAvatarFile = (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image is too large (max 5MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatar(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="modal active">
      <div className="modal-content">
        <button className="modal-close modal-close-creator" onClick={onClose}>
          &times;
        </button>
        <div className="modal-body">
          <h2 id="creatorFormTitle">{creator ? 'Edit Creator' : 'Add Creator'}</h2>
          <form id="creatorForm" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="creatorNameInput">Name</label>
              <input
                type="text"
                id="creatorNameInput"
                placeholder="Creator name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="creatorRoleInput">Role</label>
              <input
                type="text"
                id="creatorRoleInput"
                placeholder="e.g. Developer, Designer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="creatorDescInput">Description</label>
              <textarea
                id="creatorDescInput"
                placeholder="Creator description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Avatar</label>
              <div
                className="image-upload-area"
                id="avatarUploadArea"
                onClick={() => document.getElementById('avatarInput')?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add('drag-over');
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove('drag-over');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('drag-over');
                  if (e.dataTransfer.files[0]) {
                    handleAvatarFile(e.dataTransfer.files[0]);
                  }
                }}
              >
                <svg
                  className="upload-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <h3>Dodaj avatar</h3>
                <p>Przeciągnij zdjęcie tutaj lub kliknij</p>
                <input
                  type="file"
                  id="avatarInput"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => handleAvatarFile(e.target.files?.[0] || null)}
                />
              </div>
              <div id="avatarPreview" className="avatar-preview-single">
                {avatar && <img src={avatar} alt="Avatar" />}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Save Creator
              </button>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatorModal;
