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
      const data = saved ? JSON.parse(saved) : {}
      console.log('[CharacterContext] Loaded characterData for', currentCharacterId, ':', data)
      setCharacterData(data)
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

  // Экспорт всех персонажей - включаем ВСЕ данные
  const exportAllCharacters = useCallback(() => {
    const allData = characters.map(char => {
      // Получаем все данные персонажа из localStorage
      const characterData = JSON.parse(localStorage.getItem(`character_${char.id}_characterData`) || '{}')
      const skillsData = JSON.parse(localStorage.getItem(`character_${char.id}_skillsData`) || '{}')
      const specialisedSkillsData = JSON.parse(localStorage.getItem(`character_${char.id}_specialisedSkillsData`) || '[]')
      const weaponsData = JSON.parse(localStorage.getItem(`character_${char.id}_weaponsData`) || '[]')
      const rolesData = JSON.parse(localStorage.getItem(`character_${char.id}_rolesData`) || '[]')
      const customSkillNames = JSON.parse(localStorage.getItem(`character_${char.id}_customSkillNames`) || '{}')
      const avatar = localStorage.getItem(`character_${char.id}_avatar`) || ''

      return {
        profile: char,
        character: {
          ...characterData,
          // Убеждаемся, что все строковые JSON поля включены
          cyberwareImplants: characterData.cyberwareImplants || '[]',
          lifepathData: characterData.lifepathData || '{}',
          inventoryData: characterData.inventoryData || '[]',
          notesData: characterData.notesData || '[]',
          cyberdeckData: characterData.cyberdeckData || {},
          mobsData: characterData.mobsData || '[]',
          skills: skillsData.skills || {},
          expandableRows: skillsData.expandableRows || {},
          specialisedSkills: specialisedSkillsData,
          weapons: weaponsData,
          roles: rolesData,
          customSkillNames: customSkillNames,
          avatar: avatar,
          // Armor fields
          armor_head_sp: characterData.armor_head_sp,
          armor_head_notes: characterData.armor_head_notes,
          armor_head_penalty: characterData.armor_head_penalty,
          armor_body_sp: characterData.armor_body_sp,
          armor_body_notes: characterData.armor_body_notes,
          armor_body_penalty: characterData.armor_body_penalty,
          armor_shield_sp: characterData.armor_shield_sp,
          armor_shield_notes: characterData.armor_shield_notes,
          armor_shield_penalty: characterData.armor_shield_penalty
        }
      }
    })

    // Также экспортируем mobs из Mobs.jsx (они общие для всех персонажей)
    const mobsData = localStorage.getItem('mobs')
    const mobs = mobsData ? JSON.parse(mobsData) : []

    const exportData = {
      version: '2.1',
      exportDate: new Date().toISOString(),
      characters: allData,
      mobs: mobs
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

  // Импорт персонажей - загружаем ВСЕ данные
  const importCharacters = useCallback((data) => {
    if (data.characters && Array.isArray(data.characters)) {
      const existingChars = [...characters]
      let firstNewCharId = null

      data.characters.forEach(charData => {
        const profile = charData.profile
        const charId = profile.id
        const character = charData.character || {}

        const existingIndex = existingChars.findIndex(c => c.id === charId)

        if (existingIndex >= 0) {
          existingChars[existingIndex] = profile
        } else {
          existingChars.push(profile)
          if (!firstNewCharId) firstNewCharId = charId
        }

        // Сохраняем ВСЕ данные персонажа в один объект
        const fullCharData = {
          // Основные поля из character
          char_name: character.char_name,
          age: character.age,
          role: character.role,
          xp_current: character.xp_current,
          hp_current: character.hp_current,
          hp_max: character.hp_max,
          humanity_current: character.humanity_current,
          humanity_max: character.humanity_max,
          initiative: character.initiative,
          death_save: character.death_save,
          critically_wounded: character.critically_wounded,
          seriously_wounded: character.seriously_wounded,
          critical_injuries: character.critical_injuries,
          addictions: character.addictions,
          notes: character.notes,
          stat_int: character.stat_int,
          stat_ref: character.stat_ref,
          stat_dex: character.stat_dex,
          stat_tech: character.stat_tech,
          stat_cool: character.stat_cool,
          stat_will: character.stat_will,
          stat_luck_current: character.stat_luck_current,
          stat_luck_max: character.stat_luck_max,
          stat_move: character.stat_move,
          stat_body: character.stat_body,
          stat_emp_current: character.stat_emp_current,
          stat_emp_max: character.stat_emp_max,
          // Строковые JSON поля - сохраняем как есть
          cyberwareImplants: character.cyberwareImplants,
          lifepathData: character.lifepathData,
          inventoryData: character.inventoryData,
          notesData: character.notesData,
          cyberdeckData: character.cyberdeckData,
          mobsData: character.mobsData,
          // Armor fields
          armor_head_sp: character.armor_head_sp,
          armor_head_notes: character.armor_head_notes,
          armor_head_penalty: character.armor_head_penalty,
          armor_body_sp: character.armor_body_sp,
          armor_body_notes: character.armor_body_notes,
          armor_body_penalty: character.armor_body_penalty,
          armor_shield_sp: character.armor_shield_sp,
          armor_shield_notes: character.armor_shield_notes,
          armor_shield_penalty: character.armor_shield_penalty
        }

        // Сохраняем в localStorage
        localStorage.setItem(`character_${charId}_characterData`, JSON.stringify(fullCharData))
        console.log('[CharacterContext] Saved to localStorage:', charId, fullCharData)

        // Сохраняем skillsData
        if (character.skills || character.expandableRows) {
          localStorage.setItem(`character_${charId}_skillsData`, JSON.stringify({
            skills: character.skills || {},
            expandableRows: character.expandableRows || {}
          }))
        }

        // Сохраняем specialisedSkillsData
        if (character.specialisedSkills && character.specialisedSkills.length > 0) {
          localStorage.setItem(`character_${charId}_specialisedSkillsData`, JSON.stringify(character.specialisedSkills))
        }

        // Сохраняем weaponsData
        if (character.weapons && character.weapons.length > 0) {
          localStorage.setItem(`character_${charId}_weaponsData`, JSON.stringify(character.weapons))
        }

        // Сохраняем rolesData
        if (character.roles && character.roles.length > 0) {
          localStorage.setItem(`character_${charId}_rolesData`, JSON.stringify(character.roles))
        }

        // Сохраняем customSkillNames
        if (character.customSkillNames && Object.keys(character.customSkillNames).length > 0) {
          localStorage.setItem(`character_${charId}_customSkillNames`, JSON.stringify(character.customSkillNames))
        }

        // Сохраняем avatar
        if (character.avatar) {
          localStorage.setItem(`character_${charId}_avatar`, character.avatar)
        }
      })

      setCharacters(existingChars)

      // Импортируем mobs если они есть в файле
      if (data.mobs && Array.isArray(data.mobs)) {
        localStorage.setItem('mobs', JSON.stringify(data.mobs))
        console.log('[CharacterContext] Imported mobs:', data.mobs.length)
      }

      // Автоматически выбираем первого нового персонажа или первого в списке
      const charToSelect = firstNewCharId || (existingChars[0] ? existingChars[0].id : null)
      if (charToSelect) {
        localStorage.setItem('currentCharacterId', charToSelect)
        setCurrentCharacterId(charToSelect)
      }

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
