import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCharacter } from '../context/CharacterContext'
import '../css/main.css'

export default function Characters() {
  const navigate = useNavigate()
  const { characters, addCharacter, updateCharacter, deleteCharacter, loadCharacterToSheet } = useCharacter()
  const [selectedId, setSelectedId] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '' })

  const handleOpenDialog = (editId = null) => {
    if (editId) {
      const char = characters.find(c => c.id === editId)
      if (char) {
        setFormData({ name: char.name || '', description: char.description || '' })
      }
      setEditingId(editId)
    } else {
      setFormData({ name: '', description: '' })
      setEditingId(null)
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingId(null)
    setFormData({ name: '', description: '' })
  }

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('Please enter a character name')
      return
    }

    if (editingId) {
      updateCharacter(editingId, {
        name: formData.name.trim(),
        description: formData.description.trim()
      })
    } else {
      const newChar = addCharacter(formData.name.trim(), formData.description.trim())
      setSelectedId(newChar.id)
    }
    handleCloseDialog()
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleLoadToSheet = (charId) => {
    loadCharacterToSheet(charId)
    navigate('/sheet')
  }

  const selectedCharacter = characters.find(c => c.id === selectedId)

  return (
    <div className="characters-page">
      <div className="characters-container">
        {/* Left Panel - Character List */}
        <div className="characters-sidebar">
          <div className="characters-header">
            <span>CHARACTERS</span>
            <button className="add-character-btn" onClick={() => handleOpenDialog()}>+</button>
          </div>
          <div className="characters-list">
            {characters.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#8b949e', fontSize: '10px' }}>
                No characters yet. Click + to create one.
              </div>
            ) : (
              characters.map(char => (
                <div 
                  key={char.id} 
                  className={`character-item ${selectedId === char.id ? 'active' : ''}`}
                >
                  <div 
                    className="character-item-info"
                    onClick={() => setSelectedId(char.id)}
                  >
                    <div className="character-item-name">{char.name || 'Unnamed'}</div>
                    {char.description && (
                      <div className="character-item-desc">{char.description}</div>
                    )}
                    <div className="character-item-date">{formatDate(char.createdAt)}</div>
                  </div>
                  <div className="character-item-actions">
                    <button 
                      className="character-item-btn" 
                      onClick={(e) => {
                        e.stopPropagation()
                        handleOpenDialog(char.id)
                      }}
                      title="Edit"
                    >
                      ✎
                    </button>
                    <button 
                      className="character-item-btn" 
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteCharacter(char.id)
                      }}
                      title="Delete"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Character Details */}
        <div className="character-details-panel">
          <div className="character-details">
            {!selectedId ? (
              <div className="details-placeholder">
                <p>Select a character or create a new one</p>
              </div>
            ) : selectedCharacter ? (
              <div className="character-detail-content">
                <div className="character-detail-section">
                  <h3>Character Info</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <div className="detail-item-label">Name</div>
                      <div className="detail-item-value">{selectedCharacter.name}</div>
                    </div>
                    {selectedCharacter.description && (
                      <div className="detail-item">
                        <div className="detail-item-label">Description</div>
                        <div className="detail-item-value">{selectedCharacter.description}</div>
                      </div>
                    )}
                    <div className="detail-item">
                      <div className="detail-item-label">Created</div>
                      <div className="detail-item-value">{formatDate(selectedCharacter.createdAt)}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-item-label">Last Modified</div>
                      <div className="detail-item-value">{formatDate(selectedCharacter.updatedAt || selectedCharacter.createdAt)}</div>
                    </div>
                  </div>
                </div>

                <div className="character-actions">
                  <button 
                    className="action-btn action-btn-primary" 
                    onClick={() => handleLoadToSheet(selectedCharacter.id)}
                  >
                    Load to Character Sheet
                  </button>
                  <button 
                    className="action-btn action-btn-danger" 
                    onClick={() => deleteCharacter(selectedCharacter.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Add/Edit Character Dialog */}
      {dialogOpen && (
        <div className="dialog-overlay" onClick={handleCloseDialog}>
          <div className="dialog character-dialog" onClick={e => e.stopPropagation()}>
            <div className="dialog-header">
              <span>{editingId ? 'Edit Character' : 'New Character'}</span>
              <button className="dialog-close" onClick={handleCloseDialog}>×</button>
            </div>
            <div className="dialog-content">
              <div className="form-group">
                <label>Character Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Enter character name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Description (optional)</label>
                <textarea 
                  className="form-textarea" 
                  placeholder="Character description..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>
            <div className="dialog-footer">
              <button className="dialog-btn" onClick={handleCloseDialog}>
                Cancel
              </button>
              <button className="dialog-btn dialog-btn-primary" onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
