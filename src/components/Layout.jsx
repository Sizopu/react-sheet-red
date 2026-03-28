import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useCharacter } from '../context/CharacterContext'
import { useLanguage } from '../context/LanguageContext'
import { translations } from '../i18n/translations'
import DiceDialog from './DiceDialog'
import { useState } from 'react'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentCharacterId, characters, exportAllCharacters, importCharacters } = useCharacter()
  const { language, switchLanguage } = useLanguage()
  const [diceDialogOpen, setDiceDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)

  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  const isCharactersPage = location.pathname === '/characters' || location.pathname === '/'
  const hasCharacter = currentCharacterId && characters.length > 0

  const handleFileImport = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        importCharacters(data)
        alert('Characters loaded successfully!')
        navigate('/characters')
      } catch (error) {
        alert('Error loading file: ' + error.message)
      }
    }
    reader.readAsText(file)
    event.target.value = ''
    setImportDialogOpen(false)
  }

  const handleNavigateToSheet = () => {
    if (currentCharacterId) {
      navigate('/sheet')
    } else if (characters.length > 0) {
      // Select first character if none selected
      navigate('/sheet')
    } else {
      navigate('/characters')
    }
  }

  return (
    <div className="app">
      <nav className="top-nav">
        <div className="nav-brand">CYBERPUNK RED</div>
        <div className="nav-links">
          <NavLink
            to="/characters"
            className={`nav-link ${isActive('/characters') ? 'active' : ''}`}
          >
            {t('Characters')}
          </NavLink>
          {!isCharactersPage && (
            <>
              <NavLink
                to="/sheet"
                className={`nav-link ${isActive('/sheet') ? 'active' : ''}`}
              >
                {t('Character Sheet')}
              </NavLink>
              <NavLink
                to="/implants"
                className={`nav-link ${isActive('/implants') ? 'active' : ''}`}
              >
                {t('Implants')}
              </NavLink>
              <NavLink
                to="/notes"
                className={`nav-link ${isActive('/notes') ? 'active' : ''}`}
              >
                {t('Notes')}
              </NavLink>
              <NavLink
                to="/mobs"
                className={`nav-link ${isActive('/mobs') ? 'active' : ''}`}
              >
                {t('Mobs')}
              </NavLink>
              <NavLink
                to="/scripts"
                className={`nav-link ${isActive('/scripts') ? 'active' : ''}`}
              >
                {t('Scripts')}
              </NavLink>
              <button className="nav-btn" onClick={() => setDiceDialogOpen(true)}>
                🎲 {t('Roll Dice')}
              </button>
            </>
          )}
          {isCharactersPage && (
            <>
              <button className="nav-btn save-btn" onClick={exportAllCharacters}>
                💾 {t('Save All')}
              </button>
              <button className="nav-btn load-btn" onClick={() => setImportDialogOpen(true)}>
                📂 {t('Load')}
              </button>
            </>
          )}
          <button className="nav-btn lang-btn" onClick={switchLanguage}>
            {language === 'en' ? 'RU' : 'EN'}
          </button>
        </div>
      </nav>
      
      <main className="main-content">
        <Outlet />
      </main>

      <DiceDialog 
        open={diceDialogOpen} 
        onClose={() => setDiceDialogOpen(false)} 
      />

      {/* Import Dialog */}
      {importDialogOpen && (
        <div className="dialog-overlay" onClick={() => setImportDialogOpen(false)}>
          <div className="dialog" onClick={e => e.stopPropagation()}>
            <div className="dialog-header">
              <span>Load Characters</span>
              <button className="dialog-close" onClick={() => setImportDialogOpen(false)}>×</button>
            </div>
            <div className="dialog-content">
              <p style={{ marginBottom: '16px', fontSize: '10px', color: '#8b949e' }}>
                Select a JSON file to import characters
              </p>
              <input 
                type="file" 
                accept=".json"
                onChange={handleFileImport}
                style={{ width: '100%' }}
              />
            </div>
            <div className="dialog-footer">
              <button className="dialog-btn" onClick={() => setImportDialogOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
