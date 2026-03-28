import { translations, defaultLanguage } from './translations'

export function useTranslation() {
  const { language } = arguments[0] || { language: defaultLanguage }
  
  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key
  }

  return { t, language }
}

// Хук для использования в компонентах
export function createTranslateHook(LanguageContext) {
  return function useTranslate() {
    const { useContext } = require('react')
    const context = useContext(LanguageContext)
    const lang = context?.language || defaultLanguage
    
    const t = (key) => {
      return translations[lang]?.[key] || translations.en[key] || key
    }

    return { t, language: lang }
  }
}
