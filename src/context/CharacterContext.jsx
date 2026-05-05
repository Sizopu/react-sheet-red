import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { charactersAPI } from '../services/api'

const CharacterContext = createContext(null)

export const charStorage = {
  getItem: function(key) {
    const charId = localStorage.getItem('currentCharacterId')
    if (charId) {
      return localStorage.getItem('character_' + charId + '_' + key)
    }
    return localStorage.getItem(key)
  },
  setItem: function(key, value) {
    const charId = localStorage.getItem('currentCharacterId')
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
  const [characters, setCharacters] = useState([])
  const [characterData, setCharacterData] = useState({})
  const [loading, setLoading] = useState(false)
  const [isSynced, setIsSynced] = useState(true)
  const hasLoadedRef = useRef(false)

  // Загрузка персонажей с бэкенда (вызывается только один раз или при смене пользователя)
  const loadCharactersFromBackend = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setCharacters([])
      hasLoadedRef.current = false
      return
    }

    // Если уже загружали в этой сессии - не загружаем снова
    if (hasLoadedRef.current && characters.length > 0) {
      return
    }

    setLoading(true)
    try {
      const res = await charactersAPI.getAll()
      const backendChars = res.data || []
      
      const formatted = backendChars.map(char => ({
        id: `char_${char.id}`,
        name: char.name,
        description: char.data?.description || '',
        createdAt: char.data?.createdAt || Date.now(),
        updatedAt: char.data?.updatedAt || Date.now()
      }))
      
      setCharacters(formatted)
      hasLoadedRef.current = true
      console.log('[CharacterContext] Loaded', formatted.length, 'characters from backend')
    } catch (error) {
      console.error('Error loading characters:', error)
      setCharacters([])
    } finally {
      setLoading(false)
    }
  }, [characters.length])

  // Загрузка данных текущего персонажа из localStorage
  const loadCurrentCharacterData = useCallback(() => {
    if (!currentCharacterId) {
      setCharacterData({})
      return
    }
    
    const key = `character_${currentCharacterId}_characterData`
    const saved = localStorage.getItem(key)
    const data = saved ? JSON.parse(saved) : {}
    setCharacterData(data)
  }, [currentCharacterId])

  // При монтировании загружаем персонажей
  useEffect(() => {
    loadCharactersFromBackend()
    loadCurrentCharacterData()
  }, [])

  // При смене текущего персонажа загружаем его данные
  useEffect(() => {
    loadCurrentCharacterData()
  }, [currentCharacterId, loadCurrentCharacterData])

  // Слушаем событие смены пользователя
  useEffect(() => {
    const handleAuthChanged = () => {
      console.log('[CharacterContext] Auth changed, reloading...')
      hasLoadedRef.current = false
      loadCharactersFromBackend()
      setCurrentCharacterId(localStorage.getItem('currentCharacterId'))
    }
    
    window.addEventListener('authChanged', handleAuthChanged)
    return () => window.removeEventListener('authChanged', handleAuthChanged)
  }, [loadCharactersFromBackend])

  // Сохранение персонажа на бэкенд
  const saveCharacterToBackend = useCallback(async (character) => {
    try {
      const backendId = parseInt(character.id.replace('char_', ''))
      if (isNaN(backendId)) return
      
      const data = JSON.parse(localStorage.getItem(`character_${character.id}_characterData`) || '{}')
      await charactersAPI.update(backendId, {
        name: character.name,
        data: { ...data, updatedAt: Date.now() }
      })
      setIsSynced(true)
    } catch (error) {
      console.error('Error saving character:', error)
      setIsSynced(false)
    }
  }, [])

  // Добавление персонажа
  const addCharacter = useCallback(async (name, description = '') => {
    const tempId = `char_temp_${Date.now()}`
    const newChar = {
      id: tempId,
      name,
      description,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    
    setCharacters(prev => [...prev, newChar])
    localStorage.setItem(`character_${tempId}_characterData`, JSON.stringify({
      description,
      createdAt: newChar.createdAt,
      updatedAt: newChar.updatedAt
    }))
    setIsSynced(false)
    
    try {
      const res = await charactersAPI.create({
        name,
        data: { description, createdAt: newChar.createdAt, updatedAt: newChar.updatedAt }
      })
      
      const backendId = res.data.id
      const newLocalId = `char_${backendId}`
      
      localStorage.setItem(`character_${newLocalId}_characterData`, localStorage.getItem(`character_${tempId}_characterData`))
      localStorage.removeItem(`character_${tempId}_characterData`)
      
      setCharacters(prev => prev.map(c => 
        c.id === tempId ? { ...c, id: newLocalId, name, description } : c
      ))
      
      if (currentCharacterId === tempId) {
        setCurrentCharacterId(newLocalId)
        localStorage.setItem('currentCharacterId', newLocalId)
      }
      
      setIsSynced(true)
    } catch (error) {
      console.error('Error saving character to backend:', error)
    }
    
    return newChar
  }, [currentCharacterId])

  // Обновление персонажа
  const updateCharacter = useCallback((id, updates) => {
    setCharacters(prev => prev.map(char => 
      char.id === id ? { ...char, ...updates, updatedAt: Date.now() } : char
    ))
  }, [])

  // Удаление персонажа
  const deleteCharacter = useCallback(async (id) => {
    try {
      const backendId = parseInt(id.replace('char_', ''))
      if (!isNaN(backendId)) {
        await charactersAPI.delete(backendId)
      }
    } catch (error) {
      console.error('Error deleting character:', error)
    }
    
    setCharacters(prev => prev.filter(char => char.id !== id))
    if (currentCharacterId === id) {
      setCurrentCharacterId(null)
      localStorage.removeItem('currentCharacterId')
      setCharacterData({})
    }
    localStorage.removeItem(`character_${id}_characterData`)
  }, [currentCharacterId])

  // Выбор персонажа
  const selectCharacter = useCallback((id) => {
    localStorage.setItem('currentCharacterId', id)
    setCurrentCharacterId(id)
  }, [])

  // Загрузка персонажа в sheet
  const loadCharacterToSheet = useCallback((id) => {
    selectCharacter(id)
    return '/sheet'
  }, [selectCharacter])

  // Обновление поля персонажа
  const updateCharacterField = useCallback((field, value) => {
    if (!currentCharacterId) return
    
    const newData = { ...characterData, [field]: value }
    localStorage.setItem(`character_${currentCharacterId}_characterData`, JSON.stringify(newData))
    setCharacterData(newData)
  }, [currentCharacterId, characterData])

  // Сохранение данных персонажа
  const saveCharacterData = useCallback(async (data) => {
    if (!currentCharacterId) return
    
    localStorage.setItem(`character_${currentCharacterId}_characterData`, JSON.stringify(data))
    setCharacterData(data)
    
    try {
      const backendId = parseInt(currentCharacterId.replace('char_', ''))
      if (!isNaN(backendId)) {
        const char = characters.find(c => c.id === currentCharacterId)
        if (char) {
          await charactersAPI.update(backendId, { name: char.name, data })
        }
      }
    } catch (error) {
      console.error('Error saving character data:', error)
    }
  }, [currentCharacterId, characters])

  // Экспорт всех персонажей
  const exportAllCharacters = useCallback(() => {
    const allData = characters.map(char => {
      const characterData = JSON.parse(localStorage.getItem(`character_${char.id}_characterData`) || '{}')
      return { profile: char, character: characterData }
    })

    const exportData = {
      version: '2.1',
      exportDate: new Date().toISOString(),
      characters: allData
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cyberpunk-characters-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [characters])

  // Импорт персонажей
  const importCharacters = useCallback(async (data) => {
    if (data.characters && Array.isArray(data.characters)) {
      for (const charData of data.characters) {
        const profile = charData.profile
        const character = charData.character || {}
        
        try {
          const backendChar = await charactersAPI.create({
            name: profile.name,
            data: character
          })
          
          const localId = `char_${backendChar.data.id}`
          localStorage.setItem(`character_${localId}_characterData`, JSON.stringify(character))
        } catch (error) {
          console.error('Error importing character:', error)
        }
      }
      
      hasLoadedRef.current = false
      loadCharactersFromBackend()
    }
  }, [loadCharactersFromBackend])

  const value = {
    currentCharacterId,
    characters,
    characterData,
    loading,
    isSynced,
    addCharacter,
    updateCharacter,
    deleteCharacter,
    selectCharacter,
    loadCharacterToSheet,
    updateCharacterField,
    saveCharacterData,
    exportAllCharacters,
    importCharacters,
    loadCharactersFromBackend,
    saveCharacterToBackend
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
