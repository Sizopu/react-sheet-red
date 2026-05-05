import { useAuth } from '../context/AuthContext'
import { useCharacter } from '../context/CharacterContext'
import { useLanguage } from '../context/LanguageContext'
import { translations } from '../i18n/translations'

export default function UserDialog({ onClose, onLogout }) {
  const { user } = useAuth()
  const { characters } = useCharacter()
  const { language } = useLanguage()

  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key
  }

  const handleLogout = () => {
    onLogout?.()
    onClose?.()
  }

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog" onClick={(e) => e.stopPropagation()} style={{ width: '350px' }}>
        <div className="dialog-header">
          <span>{t('User Info')}</span>
          <button className="dialog-close" onClick={onClose}>×</button>
        </div>
        <div className="dialog-content">
          <div style={{ marginBottom: '12px' }}>
            <strong>{t('Username')}:</strong> {user?.username}
          </div>
          <div style={{ marginBottom: '12px' }}>
            <strong>{t('Characters')}:</strong> {characters.length}
          </div>
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button className="dialog-btn cancel-btn" onClick={onClose}>
              {t('Close')}
            </button>
            <button className="dialog-btn logout-btn" onClick={handleLogout}>
              {t('Logout')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
