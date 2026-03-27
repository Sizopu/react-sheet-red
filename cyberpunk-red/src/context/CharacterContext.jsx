import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const CharacterContext = createContext(null)

// Точная копия оригинальной логики из utils.js
// Читаем currentCharacterId напрямую из localStorage каждый раз
function getCurrentCharacterId() {
  return localStorage.getItem('currentCharacterId')
}

function getCharStorageKey(key) {
  const charId = getCurrentCharacterId()
  if (charId) {
    return 'character_' + charId + '_' + key
  }
  return key
}

// Character-specific localStorage wrapper (как в оригинале)
export const charStorage = {
  getItem: function(key) {
    const charId = getCurrentCharacterId()
    if (charId) {
      return localStorage.getItem('character_' + charId + '_' + key)
    }
    return localStorage.getItem(key)
  },
  setItem: function(key, value) {
    const charId = getCurrentCharacterId()
    if (charId) {
      localStorage.setItem('character_' + charId + '_' + key, value)
    } else {
      localStorage.setItem(key, value)
    }
  }
}

export function CharacterProvider({ children }) {
  const [currentCharacterId, setCurrentCharacterId] = useState(() => {
    return localStorage.getItem('currentCharacterId')
  })
  const [characters, setCharacters] = useState(() => {
    const saved = localStorage.getItem('characters')
    return saved ? JSON.parse(saved) : []
  })
  const [characterData, setCharacterData] = useState({})
  const [reloadKey, setReloadKey] = useState(0)

  // Загрузка данных персонажа при изменении currentCharacterId
  useEffect(() => {
    if (currentCharacterId) {
      const key = `character_${currentCharacterId}_characterData`
      const saved = localStorage.getItem(key)
      setCharacterData(saved ? JSON.parse(saved) : {})
    } else {
      setCharacterData({})
    }
  }, [currentCharacterId, reloadKey])

  // Сохранение списка персонажей
  useEffect(() => {
    localStorage.setItem('characters', JSON.stringify(characters))
  }, [characters])

  // Прямое сохранение данных персонажа
  const saveCharacterData = useCallback((data) => {
    if (!currentCharacterId) return
    const key = `character_${currentCharacterId}_characterData`
    localStorage.setItem(key, JSON.stringify(data))
    setCharacterData({ ...data })
  }, [currentCharacterId])

  // Обновление поля персонажа - СРАЗУ сохраняем в localStorage
  const updateCharacterField = useCallback((field, value) => {
    const newData = { ...characterData, [field]: value }
    if (currentCharacterId) {
      const key = `character_${currentCharacterId}_characterData`
      localStorage.setItem(key, JSON.stringify(newData))
    }
    setCharacterData(newData)
  }, [currentCharacterId, characterData])

  // Добавление персонажа
  const addCharacter = useCallback((name, description = '') => {
    const newChar = {
      id: `char_${Date.now()}`,
      name,
      description,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    setCharacters(prev => [...prev, newChar])
    // Инициализация пустых данных для нового персонажа
    localStorage.setItem(`character_${newChar.id}_characterData`, JSON.stringify({}))
    return newChar
  }, [])

  // Обновление персонажа
  const updateCharacter = useCallback((id, updates) => {
    setCharacters(prev => prev.map(char => 
      char.id === id ? { ...char, ...updates, updatedAt: Date.now() } : char
    ))
  }, [])

  // Удаление персонажа
  const deleteCharacter = useCallback((id) => {
    setCharacters(prev => prev.filter(char => char.id !== id))
    if (currentCharacterId === id) {
      setCurrentCharacterId(null)
      localStorage.removeItem('currentCharacterId')
      setCharacterData({})
    }
    localStorage.removeItem(`character_${id}_characterData`)
  }, [currentCharacterId])

  // Выбор персонажа - сохраняем в localStorage и обновляем состояние
  const selectCharacter = useCallback((id) => {
    localStorage.setItem('currentCharacterId', id)
    setCurrentCharacterId(id)
    setReloadKey(prev => prev + 1)
  }, [])

  // Загрузка персонажа в sheet
  const loadCharacterToSheet = useCallback((id) => {
    selectCharacter(id)
    return '/sheet'
  }, [selectCharacter])

  // Экспорт всех персонажей
  const exportAllCharacters = useCallback(() => {
    const allData = characters.map(char => {
      const charData = JSON.parse(localStorage.getItem(`character_${char.id}_characterData`) || '{}')
      return {
        profile: char,
        character: charData
      }
    })
    
    const exportData = {
      version: '2.0',
      exportDate: new Date().toISOString(),
      characters: allData
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cyberpunk-all-characters-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [characters])

  // Импорт персонажей
  const importCharacters = useCallback((data) => {
    if (data.characters && Array.isArray(data.characters)) {
      const existingChars = [...characters]
      
      data.characters.forEach(charData => {
        const profile = charData.profile
        const charId = profile.id
        
        const existingIndex = existingChars.findIndex(c => c.id === charId)
        
        if (existingIndex >= 0) {
          existingChars[existingIndex] = profile
        } else {
          existingChars.push(profile)
        }
        
        if (charData.character) {
          localStorage.setItem(`character_${charId}_characterData`, JSON.stringify(charData.character))
        }
      })
      
      setCharacters(existingChars)
      setReloadKey(prev => prev + 1)
    }
  }, [characters])

  const value = {
    currentCharacterId,
    characters,
    characterData,
    addCharacter,
    updateCharacter,
    deleteCharacter,
    selectCharacter,
    loadCharacterToSheet,
    updateCharacterField,
    saveCharacterData,
    exportAllCharacters,
    importCharacters,
    charStorage, // Экспортируем charStorage для использования в компонентах
    reload: () => setReloadKey(prev => prev + 1)
  }

  return (
    <CharacterContext.Provider value={value}>
      {children}
    </CharacterContext.Provider>
  )
}

export function useCharacter() {
  const context = useContext(CharacterContext)
  if (!context) {
    throw new Error('useCharacter must be used within a CharacterProvider')
  }
  return context
}
