import React, { useState, useEffect } from 'react';
import { Dox, Creator, TabType } from '../types';
import DoxesList from './DoxesList';
import CreatorsList from './CreatorsList';
import DoxModal from './DoxModal';
import CreatorModal from './CreatorModal';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<TabType>('doxes');
  const [doxes, setDoxes] = useState<Dox[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [isDoxModalOpen, setIsDoxModalOpen] = useState(false);
  const [isCreatorModalOpen, setIsCreatorModalOpen] = useState(false);
  const [editingDox, setEditingDox] = useState<Dox | null>(null);
  const [editingCreator, setEditingCreator] = useState<Creator | null>(null);

  useEffect(() => {
    loadDoxes();
    loadCreators();
  }, []);

  const loadDoxes = async () => {
    try {
      const res = await fetch('/api/doxes');
      const data = await res.json();
      setDoxes(data);
    } catch (err) {
      console.error('Error loading doxes:', err);
    }
  };

  const loadCreators = async () => {
    try {
      const res = await fetch('/api/creators');
      const data = await res.json();
      setCreators(data);
    } catch (err) {
      console.error('Error loading creators:', err);
    }
  };

  const handleEditDox = async (id: string) => {
    try {
      const res = await fetch(`/api/doxes/${id}`);
      const dox = await res.json();
      setEditingDox(dox);
      setIsDoxModalOpen(true);
    } catch (err) {
      console.error('Error loading dox:', err);
    }
  };

  const handleDeleteDox = async (id: string) => {
    if (confirm('Are you sure you want to delete this dox?')) {
      try {
        const res = await fetch(`/api/doxes/${id}`, {
          method: 'DELETE',
        });
        const data = await res.json();
        if (data.success) {
          loadDoxes();
        }
      } catch (err) {
        console.error('Error deleting dox:', err);
      }
    }
  };

  const handleSaveDox = async (doxData: Omit<Dox, 'id'>) => {
    const url = editingDox ? `/api/doxes/${editingDox.id}` : '/api/doxes';
    const method = editingDox ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(doxData),
      });
      const data = await res.json();
      if (data.success) {
        setIsDoxModalOpen(false);
        setEditingDox(null);
        loadDoxes();
      }
    } catch (err) {
      console.error('Error saving dox:', err);
    }
  };

  const handleEditCreator = async (id: string) => {
    try {
      const res = await fetch(`/api/creators/${id}`);
      const creator = await res.json();
      setEditingCreator(creator);
      setIsCreatorModalOpen(true);
    } catch (err) {
      console.error('Error loading creator:', err);
    }
  };

  const handleDeleteCreator = async (id: string) => {
    if (confirm('Are you sure you want to delete this creator?')) {
      try {
        const res = await fetch(`/api/creators/${id}`, {
          method: 'DELETE',
        });
        const data = await res.json();
        if (data.success) {
          loadCreators();
        }
      } catch (err) {
        console.error('Error deleting creator:', err);
      }
    }
  };

  const handleSaveCreator = async (creatorData: Omit<Creator, 'id'>) => {
    const url = editingCreator ? `/api/creators/${editingCreator.id}` : '/api/creators';
    const method = editingCreator ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(creatorData),
      });
      const data = await res.json();
      if (data.success) {
        setIsCreatorModalOpen(false);
        setEditingCreator(null);
        loadCreators();
      } else {
        alert('Error saving creator: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error saving creator:', err);
      alert('Error saving creator');
    }
  };

  const handleAddDox = () => {
    setEditingDox(null);
    setIsDoxModalOpen(true);
  };

  const handleAddCreator = () => {
    setEditingCreator(null);
    setIsCreatorModalOpen(true);
  };

  const switchTab = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === 'doxes') {
      loadDoxes();
    } else if (tab === 'creators') {
      loadCreators();
    }
  };

  return (
    <div id="dashboardPage" className="page active">
      <header className="admin-header">
        <h1>Admin Panel - Pandora Box</h1>
        <button id="logoutBtn" className="btn btn-secondary" onClick={onLogout}>
          Logout
        </button>
      </header>

      <div className="admin-container">
        <section className="admin-section">
          <div className="section-header">
            <h2>Manage Content</h2>
          </div>

          <div className="admin-tabs">
            <button
              className={`admin-tab-btn ${activeTab === 'doxes' ? 'active' : ''}`}
              onClick={() => switchTab('doxes')}
            >
              Doxes
            </button>
            <button
              className={`admin-tab-btn ${activeTab === 'creators' ? 'active' : ''}`}
              onClick={() => switchTab('creators')}
            >
              Creators
            </button>
          </div>

          {/* Doxes Tab */}
          <div
            id="doxesTab"
            className={`admin-tab-content ${activeTab === 'doxes' ? 'active' : ''}`}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px',
              }}
            >
              <h3 style={{ margin: 0 }}>Manage Doxes</h3>
              <button id="addDoxBtn" className="btn btn-primary" onClick={handleAddDox}>
                + Add New Dox
              </button>
            </div>
            <DoxesList doxes={doxes} onEdit={handleEditDox} onDelete={handleDeleteDox} />
          </div>

          {/* Creators Tab */}
          <div
            id="creatorsTab"
            className={`admin-tab-content ${activeTab === 'creators' ? 'active' : ''}`}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px',
              }}
            >
              <h3 style={{ margin: 0 }}>Manage Creators</h3>
              <button id="addCreatorBtn" className="btn btn-primary" onClick={handleAddCreator}>
                + Add Creator
              </button>
            </div>
            <CreatorsList
              creators={creators}
              onEdit={handleEditCreator}
              onDelete={handleDeleteCreator}
            />
          </div>
        </section>
      </div>

      {/* Modals */}
      <DoxModal
        isOpen={isDoxModalOpen}
        dox={editingDox}
        onClose={() => {
          setIsDoxModalOpen(false);
          setEditingDox(null);
        }}
        onSave={handleSaveDox}
      />

      <CreatorModal
        isOpen={isCreatorModalOpen}
        creator={editingCreator}
        onClose={() => {
          setIsCreatorModalOpen(false);
          setEditingCreator(null);
        }}
        onSave={handleSaveCreator}
      />
    </div>
  );
};

export default Dashboard;
