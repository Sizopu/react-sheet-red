import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCharacter, charStorage } from '../context/CharacterContext'
import '../css/main.css'

export default function Characters() {
  const navigate = useNavigate()
  const { characters, addCharacter, updateCharacter, deleteCharacter, loadCharacterToSheet } = useCharacter()
  const [selectedId, setSelectedId] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [hoveredCharId, setHoveredCharId] = useState(null)
  const [hoveredCharData, setHoveredCharData] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  // Загрузка данных персонажа при наведении
  useEffect(() => {
    if (hoveredCharId) {
      // Читаем данные напрямую из localStorage для конкретного персонажа
      const characterData = JSON.parse(localStorage.getItem(`character_${hoveredCharId}_characterData`) || '{}')
      const skillsData = JSON.parse(localStorage.getItem(`character_${hoveredCharId}_skillsData`) || '{}')
      const rolesData = JSON.parse(localStorage.getItem(`character_${hoveredCharId}_rolesData`) || '[]')
      const specialisedSkills = JSON.parse(localStorage.getItem(`character_${hoveredCharId}_specialisedSkillsData`) || '[]')
      const weapons = JSON.parse(localStorage.getItem(`character_${hoveredCharId}_weaponsData`) || '[]')
      
      setHoveredCharData({
        ...characterData,
        skills: skillsData.skills || {},
        expandableRows: skillsData.expandableRows || {},
        roles: rolesData,
        specialisedSkills,
        weapons
      })
    } else {
      setHoveredCharData(null)
    }
  }, [hoveredCharId])

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

  // Обработчики для tooltip
  const handleCharacterHover = (charId, event) => {
    setHoveredCharId(charId)
    
    // Позиция tooltip
    const rect = event.currentTarget.getBoundingClientRect()
    setTooltipPosition({
      x: rect.right + 10,
      y: rect.top
    })
  }

  const handleCharacterLeave = () => {
    setHoveredCharId(null)
  }

  // Получение статистики навыков
  const getSkillsSummary = (skills) => {
    if (!skills || Object.keys(skills).length === 0) return 'No skills'
    const total = Object.keys(skills).length
    const withLevels = Object.values(skills).filter(s => (s.lvl || 0) > 0).length
    return `${withLevels}/${total} skills`
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
                  onMouseEnter={(e) => handleCharacterHover(char.id, e)}
                  onMouseLeave={() => handleCharacterLeave(char.id)}
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

        {/* Tooltip с информацией о персонаже */}
        {hoveredCharId && hoveredCharData && (
          <div 
            className="character-tooltip"
            style={{
              position: 'fixed',
              left: tooltipPosition.x,
              top: tooltipPosition.y,
              zIndex: 1000
            }}
          >
            <div className="character-tooltip-header">
              <span className="tooltip-name">{hoveredCharData.char_name || 'Unnamed'}</span>
              {hoveredCharData.age && <span className="tooltip-age">Age: {hoveredCharData.age}</span>}
            </div>
            
            {hoveredCharData.roles && hoveredCharData.roles.length > 0 && (
              <div className="tooltip-section">
                <div className="tooltip-section-title">Roles</div>
                {hoveredCharData.roles.map((role, idx) => (
                  <div key={role.id || idx} className="tooltip-role">
                    {role.role || 'N/A'} - {role.ability || 'N/A'} (Lvl {role.lvl || 1})
                  </div>
                ))}
              </div>
            )}
            
            <div className="tooltip-section">
              <div className="tooltip-section-title">Stats</div>
              <div className="tooltip-stats-grid">
                <div className="tooltip-stat"><span>INT:</span> {hoveredCharData.stat_int || 0}</div>
                <div className="tooltip-stat"><span>REF:</span> {hoveredCharData.stat_ref || 0}</div>
                <div className="tooltip-stat"><span>DEX:</span> {hoveredCharData.stat_dex || 0}</div>
                <div className="tooltip-stat"><span>TECH:</span> {hoveredCharData.stat_tech || 0}</div>
                <div className="tooltip-stat"><span>COOL:</span> {hoveredCharData.stat_cool || 0}</div>
                <div className="tooltip-stat"><span>WILL:</span> {hoveredCharData.stat_will || 0}</div>
                <div className="tooltip-stat"><span>LUCK:</span> {hoveredCharData.stat_luck_current || 0}/{hoveredCharData.stat_luck_max || 0}</div>
                <div className="tooltip-stat"><span>MOVE:</span> {hoveredCharData.stat_move || 0}</div>
                <div className="tooltip-stat"><span>BODY:</span> {hoveredCharData.stat_body || 0}</div>
                <div className="tooltip-stat"><span>EMP:</span> {hoveredCharData.stat_emp_current || 0}/{hoveredCharData.stat_emp_max || 0}</div>
              </div>
            </div>
            
            <div className="tooltip-section">
              <div className="tooltip-section-title">Vitals</div>
              <div className="tooltip-vitals">
                <span>HP: {hoveredCharData.hp_current || 0}/{hoveredCharData.hp_max || 0}</span>
                <span>XP: {hoveredCharData.xp_current || 0}</span>
                <span>Humanity: {hoveredCharData.humanity_current || 0}/{hoveredCharData.humanity_max || 0}</span>
              </div>
            </div>
            
            <div className="tooltip-section">
              <div className="tooltip-section-title">Skills</div>
              <div className="tooltip-skills">
                {getSkillsSummary(hoveredCharData.skills)}
              </div>
            </div>
          </div>
        )}

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
