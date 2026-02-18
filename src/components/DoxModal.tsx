import React, { useState, useEffect } from 'react';
import { Dox, DoxTable } from '../types';

interface DoxModalProps {
  isOpen: boolean;
  dox: Dox | null;
  onClose: () => void;
  onSave: (doxData: Omit<Dox, 'id'>) => void;
}

interface TableRowData {
  id: string;
  key: string;
  value: string;
}

interface InternalTable {
  title: string;
  rows: TableRowData[];
}

const DoxModal: React.FC<DoxModalProps> = ({ isOpen, dox, onClose, onSave }) => {
  const [nick, setNick] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [fullDesc, setFullDesc] = useState('');
  const [tables, setTables] = useState<InternalTable[]>([]);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (dox) {
      setNick(dox.nick);
      setShortDesc(dox.shortDesc);
      setFullDesc(dox.fullDesc);
      // Convert DoxTable[] to InternalTable[]
      const internalTables = (dox.tables || []).map(table => ({
        title: table.title,
        rows: Object.entries(table.data).map(([key, value]) => ({
          id: `row_${Date.now()}_${Math.random()}`,
          key,
          value
        }))
      }));
      setTables(internalTables);
      setImages(dox.images || []);
    } else {
      resetForm();
    }
  }, [dox]);

  const resetForm = () => {
    setNick('');
    setShortDesc('');
    setFullDesc('');
    setTables([]);
    setImages([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Convert InternalTable[] back to DoxTable[]
    const doxTables: DoxTable[] = tables.map(table => ({
      title: table.title,
      data: table.rows.reduce((acc, row) => {
        if (row.key.trim()) {
          acc[row.key] = row.value;
        }
        return acc;
      }, {} as Record<string, string>)
    }));

    onSave({
      nick,
      shortDesc,
      fullDesc,
      tables: doxTables,
      images,
    });
    resetForm();
  };

  const addTable = () => {
    setTables([...tables, { title: '', rows: [] }]);
  };

  const removeTable = (index: number) => {
    setTables(tables.filter((_, i) => i !== index));
  };

  const updateTableTitle = (index: number, title: string) => {
    const newTables = [...tables];
    newTables[index].title = title;
    setTables(newTables);
  };

  const addTableRow = (tableIndex: number) => {
    const newTables = [...tables];
    newTables[tableIndex].rows.push({
      id: `row_${Date.now()}_${Math.random()}`,
      key: '',
      value: ''
    });
    setTables(newTables);
  };

  const updateTableRow = (tableIndex: number, rowId: string, key: string, value: string) => {
    const newTables = [...tables];
    const rowIndex = newTables[tableIndex].rows.findIndex(r => r.id === rowId);
    if (rowIndex !== -1) {
      newTables[tableIndex].rows[rowIndex] = { id: rowId, key, value };
      setTables(newTables);
    }
  };

  const removeTableRow = (tableIndex: number, rowId: string) => {
    const newTables = [...tables];
    newTables[tableIndex].rows = newTables[tableIndex].rows.filter(r => r.id !== rowId);
    setTables(newTables);
  };

  const handleImageFiles = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    if (images.length + fileArray.length > 20) {
      alert(`You can only add ${20 - images.length} more images`);
      return;
    }

    let loadedCount = 0;
    const newImages = [...images];

    fileArray.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        console.warn(`Skipped non-image file: ${file.name}`);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert(`Image ${file.name} is too large (max 5MB)`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        newImages.push(event.target?.result as string);
        loadedCount++;
        if (loadedCount === fileArray.length) {
          setImages(newImages);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="modal active">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <div className="modal-body">
          <h2 id="formTitle">{dox ? 'Edit Dox' : 'Add New Dox'}</h2>
          <form id="doxForm" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nickInput">Nick</label>
              <input
                type="text"
                id="nickInput"
                placeholder="Enter nick"
                value={nick}
                onChange={(e) => setNick(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="shortDescInput">Short Description</label>
              <textarea
                id="shortDescInput"
                placeholder="Short description"
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="fullDescInput">Full Description</label>
              <textarea
                id="fullDescInput"
                placeholder="Full description"
                value={fullDesc}
                onChange={(e) => setFullDesc(e.target.value)}
                required
              />
            </div>

            <div id="tablesContainer">
              <h3>Data Tables</h3>
              <div id="tablesList">
                {tables.map((table, tableIndex) => (
                  <div key={tableIndex} className="table-item">
                    <input
                      type="text"
                      placeholder="Table Title"
                      className="table-title"
                      value={table.title}
                      onChange={(e) => updateTableTitle(tableIndex, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        background: 'var(--dark-gray)',
                        border: '1px solid var(--gray)',
                        borderRadius: '4px',
                        color: 'white',
                        marginBottom: '10px',
                      }}
                    />
                    <div className="table-rows">
                      {table.rows.map((row) => (
                        <TableRow
                          key={row.id}
                          rowId={row.id}
                          rowKey={row.key}
                          rowValue={row.value}
                          onUpdate={(key, value) => updateTableRow(tableIndex, row.id, key, value)}
                          onRemove={() => removeTableRow(tableIndex, row.id)}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      className="add-row-btn"
                      onClick={() => addTableRow(tableIndex)}
                    >
                      + Add Row
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      style={{ width: '100%', marginTop: '10px' }}
                      onClick={() => removeTable(tableIndex)}
                    >
                      Remove Table
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" id="addTableBtn" className="btn btn-secondary" onClick={addTable}>
                + Add Table
              </button>
            </div>

            <div className="form-group">
              <label>Images (max 20)</label>
              <div
                className="image-upload-area"
                onClick={() => document.getElementById('imageInput')?.click()}
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
                  handleImageFiles(e.dataTransfer.files);
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
                <h3>Dodaj zdjęcia</h3>
                <p>Przeciągnij zdjęcia tutaj lub kliknij</p>
                <input
                  type="file"
                  id="imageInput"
                  multiple
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => handleImageFiles(e.target.files)}
                />
              </div>
              <div id="imagePreview" className="image-preview">
                {images.map((img, index) => (
                  <div key={index} className="image-preview-item">
                    <img src={img} alt="" />
                    <button type="button" onClick={() => removeImage(index)}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Save Dox
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

interface TableRowProps {
  rowId: string;
  rowKey: string;
  rowValue: string;
  onUpdate: (key: string, value: string) => void;
  onRemove: () => void;
}

const TableRow: React.FC<TableRowProps> = ({ rowId, rowKey, rowValue, onUpdate, onRemove }) => {
  return (
    <div className="table-row">
      <input
        type="text"
        placeholder="Key"
        value={rowKey}
        onChange={(e) => onUpdate(e.target.value, rowValue)}
        className="table-key"
      />
      <input
        type="text"
        placeholder="Value"
        value={rowValue}
        onChange={(e) => onUpdate(rowKey, e.target.value)}
        className="table-value"
      />
      <button type="button" className="add-row-btn" onClick={onRemove}>
        Remove
      </button>
    </div>
  );
};

export default DoxModal;
