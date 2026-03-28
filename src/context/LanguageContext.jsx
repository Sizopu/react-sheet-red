import { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language')
    return saved || 'ru' // По умолчанию русский
  })

  useEffect(() => {
    localStorage.setItem('language', language)
  }, [language])

  const switchLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ru' : 'en')
  }

  const value = {
    language,
    switchLanguage
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
