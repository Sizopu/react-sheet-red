import { useState, useEffect } from 'react'
import { useCharacter } from '../context/CharacterContext'
import '../css/notes.css'

export default function Notes() {
  const { characterData, saveCharacterData, currentCharacterId } = useCharacter()
  
  // Инициализация с дефолтными значениями
  const [notes, setNotes] = useState([])
  const [selectedNoteId, setSelectedNoteId] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Загрузка notes только при изменении currentCharacterId
  useEffect(() => {
    if (!currentCharacterId) return
    
    if (characterData.notesData) {
      try {
        const parsed = typeof characterData.notesData === 'string'
          ? JSON.parse(characterData.notesData)
          : characterData.notesData
        if (Array.isArray(parsed)) {
          setNotes(parsed)
        }
      } catch (e) {
        console.error('Error parsing notes:', e)
      }
    }
    setIsLoaded(true)
  }, [currentCharacterId])

  // Сохранение notes через saveCharacterData (с задержкой для избежания лагов)
  useEffect(() => {
    if (!currentCharacterId || !isLoaded) return
    
    const timeout = setTimeout(() => {
      saveCharacterData({
        ...characterData,
        notesData: JSON.stringify(notes)
      })
    }, 500)
    
    return () => clearTimeout(timeout)
  }, [notes])

  // Проверка что персонаж выбран
  if (!currentCharacterId) {
    return (
      <div className="notes-page">
        <div style={{ padding: '20px', textAlign: 'center', color: '#8b949e' }}>
          Please select a character first (go to Characters page and click "Load to Character Sheet")
        </div>
      </div>
    )
  }

  const addNote = (type = 'note') => {
    const note = {
      id: Date.now(),
      type,
      title: type === 'table' ? 'New Table' : 'New Note',
      content: '',
      tableRows: type === 'table' ? 3 : 0,
      tableCols: type === 'table' ? 3 : 0,
      tableData: type === 'table' ? [] : [],
      createdAt: new Date().toISOString()
    }

    if (type === 'table') {
      const tableData = []
      for (let i = 0; i < note.tableRows; i++) {
        const row = []
        for (let j = 0; j < note.tableCols; j++) {
          row.push('')
        }
        tableData.push(row)
      }
      note.tableData = tableData
    }

    const newNotes = [...notes, note]
    setNotes(newNotes)
    setSelectedNoteId(note.id)
    setDropdownOpen(false)
  }

  const deleteNote = (id) => {
    const newNotes = notes.filter(n => n.id !== id)
    setNotes(newNotes)
    if (selectedNoteId === id) setSelectedNoteId(null)
  }

  const selectNote = (id) => {
    setSelectedNoteId(id)
  }

  const updateNote = (id, field, value) => {
    const newNotes = notes.map(n => 
      n.id === id ? { ...n, [field]: value } : n
    )
    setNotes(newNotes)
  }

  const addTableRow = (noteId) => {
    const newNotes = notes.map(n => {
      if (n.id !== noteId || n.type !== 'table') return n
      const newRow = Array(n.tableCols).fill('')
      return {
        ...n,
        tableData: [...n.tableData, newRow],
        tableRows: n.tableRows + 1
      }
    })
    setNotes(newNotes)
  }

  const addTableCol = (noteId) => {
    const newNotes = notes.map(n => {
      if (n.id !== noteId || n.type !== 'table') return n
      return {
        ...n,
        tableData: n.tableData.map(row => [...row, '']),
        tableCols: n.tableCols + 1
      }
    })
    setNotes(newNotes)
  }

  const deleteTableRow = (noteId, rowIndex) => {
    const newNotes = notes.map(n => {
      if (n.id !== noteId || n.type !== 'table' || n.tableRows <= 1) return n
      return {
        ...n,
        tableData: n.tableData.filter((_, i) => i !== rowIndex),
        tableRows: n.tableRows - 1
      }
    })
    setNotes(newNotes)
  }

  const deleteTableCol = (noteId, colIndex) => {
    const newNotes = notes.map(n => {
      if (n.id !== noteId || n.type !== 'table' || n.tableCols <= 1) return n
      return {
        ...n,
        tableData: n.tableData.map(row => row.filter((_, i) => i !== colIndex)),
        tableCols: n.tableCols - 1
      }
    })
    setNotes(newNotes)
  }

  const updateTableCell = (noteId, rowIndex, colIndex, value) => {
    const newNotes = notes.map(n => {
      if (n.id !== noteId || n.type !== 'table') return n
      const newTableData = [...n.tableData]
      newTableData[rowIndex] = [...newTableData[rowIndex]]
      newTableData[rowIndex][colIndex] = value
      return { ...n, tableData: newTableData }
    })
    setNotes(newNotes)
  }

  const selectedNote = notes.find(n => n.id === selectedNoteId)

  return (
    <div className="notes-page">
      <div className="notes-container">
        {/* Left Panel - Notes List */}
        <div className="notes-sidebar">
          <div className="notes-header">
            <span>NOTES</span>
            <div style={{ position: 'relative' }}>
              <button className="add-note-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>+</button>
              {dropdownOpen && (
                <div className="note-type-dropdown" style={{ position: 'absolute', top: '100%', right: '0', left: 'auto', margin: '5px 0 0 0' }}>
                  <button onClick={() => addNote('note')}>📄 Note</button>
                  <button onClick={() => addNote('table')}>📊 Table</button>
                </div>
              )}
            </div>
          </div>

          <div className="notes-list">
            {notes.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#8b949e', fontSize: '10px' }}>
                No notes yet. Click + to create one.
              </div>
            ) : (
              notes.map(note => (
                <div 
                  key={note.id} 
                  className={`note-item ${selectedNoteId === note.id ? 'selected' : ''}`}
                  onClick={() => selectNote(note.id)}
                >
                  <div className="note-item-icon">
                    {note.type === 'table' ? '📊' : '📄'}
                  </div>
                  <div className="note-item-title">{note.title || 'Untitled'}</div>
                  <button 
                    className="note-item-delete" 
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteNote(note.id)
                    }}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Note Editor */}
        <div className="notes-content-panel">
          <div className="note-editor">
            {!selectedNoteId ? (
              <div className="editor-placeholder">
                <p>Select a note or create a new one</p>
              </div>
            ) : selectedNote ? (
              selectedNote.type === 'note' ? (
                <div className="note-editor-content">
                  <input 
                    type="text" 
                    className="note-title-input" 
                    value={selectedNote.title}
                    placeholder="Note title..."
                    onChange={(e) => updateNote(selectedNote.id, 'title', e.target.value)}
                  />
                  <textarea 
                    className="note-content-input" 
                    placeholder="Write your note here..."
                    value={selectedNote.content}
                    onChange={(e) => updateNote(selectedNote.id, 'content', e.target.value)}
                  />
                </div>
              ) : (
                <div className="table-editor-content">
                  <input 
                    type="text" 
                    className="note-title-input" 
                    value={selectedNote.title}
                    placeholder="Table title..."
                    onChange={(e) => updateNote(selectedNote.id, 'title', e.target.value)}
                  />
                  <div className="table-controls">
                    <button className="table-add-row" onClick={() => addTableRow(selectedNote.id)}>
                      + Row
                    </button>
                    <button className="table-add-col" onClick={() => addTableCol(selectedNote.id)}>
                      + Column
                    </button>
                  </div>
                  <div className="table-wrapper">
                    <table className="notes-table">
                      <thead>
                        <tr>
                          {selectedNote.tableData[0]?.map((cell, j) => (
                            <th key={j}>
                              <input 
                                type="text" 
                                className="table-header-input" 
                                placeholder={`Col ${j + 1}`}
                                value={cell}
                                onChange={(e) => updateTableCell(selectedNote.id, 0, j, e.target.value)}
                              />
                              {selectedNote.tableCols > 1 && (
                                <button 
                                  className="table-col-delete"
                                  onClick={() => deleteTableCol(selectedNote.id, j)}
                                >
                                  ×
                                </button>
                              )}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedNote.tableData.slice(1).map((row, i) => (
                          <tr key={i + 1}>
                            {row.map((cell, j) => (
                              <td key={j}>
                                <input 
                                  type="text" 
                                  className="table-cell-input" 
                                  value={cell}
                                  onChange={(e) => updateTableCell(selectedNote.id, i + 1, j, e.target.value)}
                                />
                              </td>
                            ))}
                            {selectedNote.tableRows > 1 && (
                              <td className="row-delete-cell">
                                <button 
                                  className="table-row-delete"
                                  onClick={() => deleteTableRow(selectedNote.id, i + 1)}
                                >
                                  ×
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
