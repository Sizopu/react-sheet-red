import React, { useState, useEffect } from 'react'
import { useCharacter, charStorage } from '../context/CharacterContext'
import '../css/character.css'

const STATS = {
  INT: 'stat_int',
  REF: 'stat_ref',
  DEX: 'stat_dex',
  TECH: 'stat_tech',
  COOL: 'stat_cool',
  WILL: 'stat_will',
  LUCK: 'stat_luck_current',
  MOVE: 'stat_move',
  BODY: 'stat_body',
  EMP: 'stat_emp_current'
}

const SKILL_GROUPS = {
  AWARENESS_SKILLS: [
    ['concentration', 'WILL'],
    ['conceal/reveal object', 'INT'],
    ['lip reading', 'INT'],
    ['perception', 'INT'],
    ['tracking', 'INT']
  ],
  BODY_SKILLS: [
    ['athletics', 'DEX'],
    ['contortionist', 'DEX'],
    ['dance', 'DEX'],
    ['endurance', 'WILL'],
    ['resist torture/drugs', 'WILL'],
    ['stealth', 'DEX']
  ],
  CONTROL_SKILLS: [
    ['drive land vehicle', 'REF'],
    ['pilot air vehicle', 'REF'],
    ['pilot sea vehicle', 'REF'],
    ['riding', 'REF']
  ],
  EDUCATION_SKILLS: [
    ['accounting', 'INT'],
    ['animal handling', 'INT'],
    ['bureaucracy', 'INT'],
    ['business', 'INT'],
    ['composition', 'INT'],
    ['criminology', 'INT'],
    ['cryptography', 'INT'],
    ['deduction', 'INT'],
    ['education', 'INT'],
    ['gamble', 'INT'],
    ['language', 'INT'],
    ['library search', 'INT'],
    ['local expert', 'INT'],
    ['science', 'INT'],
    ['tactics', 'INT'],
    ['wilderness survival', 'INT']
  ],
  FIGHTING_SKILLS: [
    ['brawling', 'DEX'],
    ['evasion', 'DEX'],
    ['martial arts', 'DEX'],
    ['melee weapon', 'DEX']
  ],
  PERFORMANCE_SKILLS: [
    ['acting', 'COOL'],
    ['play instrument', 'COOL']
  ],
  RANGED_WEAPON_SKILLS: [
    ['archery', 'REF'],
    ['autofire', 'REF'],
    ['handgun', 'REF'],
    ['heavy weapons', 'REF'],
    ['shoulder arms', 'REF']
  ],
  SOCIAL_SKILLS: [
    ['bribery', 'COOL'],
    ['conversation', 'EMP'],
    ['human perception', 'EMP'],
    ['interrogation', 'COOL'],
    ['persuasion', 'COOL'],
    ['personal grooming', 'COOL'],
    ['streetwise', 'COOL'],
    ['trading', 'COOL'],
    ['wardrobe/style', 'COOL']
  ],
  TECHNIQUE_SKILLS: [
    ['air vehicle tech', 'TECH'],
    ['basic tech', 'TECH'],
    ['cybertech', 'TECH'],
    ['demolitions', 'TECH'],
    ['electronics/security tech', 'TECH'],
    ['first aid', 'TECH'],
    ['forgery', 'TECH'],
    ['land vehicle tech', 'TECH'],
    ['paint/draw/sculpt', 'TECH'],
    ['paramedic', 'TECH'],
    ['photography', 'TECH'],
    ['pick lock', 'TECH'],
    ['pick pocket', 'DEX'],
    ['sea vehicle tech', 'TECH'],
    ['weaponstech', 'TECH']
  ]
}

const EXPANDABLE_SKILLS = {
  EDUCATION_SKILLS: ['language', 'local expert', 'science'],
  FIGHTING_SKILLS: ['martial arts'],
  PERFORMANCE_SKILLS: ['play instrument']
}

// Навыки, требующие x2 опыта (Specialized Skills)
const X2_SKILLS = [
  'martial arts',
  'conceal/reveal object',
  'lip reading',
  'tracking',
  'contortionist',
  'resist torture/drugs',
  'pilot air vehicle',
  'pilot sea vehicle',
  'riding',
  'composition',
  'criminology',
  'cryptography',
  'deduction',
  'education',
  'library search',
  'science',
  'tactics',
  'wilderness survival',
  'evasion',
  'heavy weapons',
  'human perception',
  'interrogation',
  'paramedic',
  'paint/draw/sculpt',
  'photography',
  'pick lock',
  'pick pocket'
]

// Ролевые способности Cyberpunk RED
const ROLES_LIST = [
  'Solo',
  'Rockerboy',
  'Netrunner',
  'Tech',
  'Medtech',
  'Media',
  'Exec',
  'Lawman',
  'Fixer',
  'Nomad'
]

const ROLE_ABILITIES_LIST = {
  Solo: ['Combat Sense', 'Adrenaline Rush', 'Tactical Analysis'],
  Rockerboy: ['Charismatic Leadership', 'Stage Presence', 'Inspiring Performance'],
  Netrunner: ['Interface On The Go', 'Personal Terminal', 'Cyberdeck'],
  Tech: ['Juryrig', 'Improvisation', 'Invention'],
  Medtech: ['Diagnostic Tools', 'Surgical Tools', 'Pharmaceutical Tools'],
  Media: ['Credibility', 'Press Pass', 'Media Connections'],
  Exec: ['Resources', 'Corporate Power', 'Network'],
  Lawman: ['Authority', 'Backup', 'Jurisdiction'],
  Fixer: ['Find Anything', 'Black Market', 'Connections'],
  Nomad: ['Moto Family', 'Nomad Family', 'Family Honor']
}

// Стоимость прокачки навыков (Cyberpunk RED)
// Стоимость = Текущий уровень * 20 (для обычных) или * 40 (для x2 навыков)
const getSkillUpgradeCost = (currentLvl, isX2Skill = false) => {
  if (currentLvl >= 10) return Infinity
  const baseCost = (currentLvl + 1) * 20
  return isX2Skill ? baseCost * 2 : baseCost
}

// Стоимость понижения уровня (возвращает XP, потраченные на прокачку до текущего уровня)
// При понижении с 1 до 0: возвращаем (1) * 20 = 20 XP
// При понижении с 2 до 1: возвращаем (2) * 20 = 40 XP
const getSkillDowngradeRefund = (currentLvl, isX2Skill = false) => {
  if (currentLvl <= 0) return 0
  const baseCost = currentLvl * 20
  return isX2Skill ? baseCost * 2 : baseCost
}

export default function CharacterSheet() {
  const { currentCharacterId, characterData, updateCharacterField, saveCharacterData, charStorage } = useCharacter()

  // Состояния для данных (как в оригинале)
  const [skills, setSkills] = useState({})
  const [expandableSkillRows, setExpandableSkillRows] = useState({})
  const [expandedSkills, setExpandedSkills] = useState({})
  const [customSkillNames, setCustomSkillNames] = useState({})
  const [specialisedSkills, setSpecialisedSkills] = useState([{ id: 1, stat: '', name: '', mod: 0, lvl: 0 }])
  const [weapons, setWeapons] = useState([{ id: 1, name: '', dmg: '', mag: '', rof: '', notes: '', attackSlots: [{ formula: '', notes: '' }] }])
  const [roles, setRoles] = useState([{ id: 1, role: '', ability: '', lvl: 1 }])
  const [diceResult, setDiceResult] = useState(null)
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [adaptiveProgression, setAdaptiveProgression] = useState(false)

  // Загрузка данных (как loadAllCharacterData в оригинале)
  useEffect(() => {
    if (!currentCharacterId) return

    // Загрузка skills
    const skillsData = charStorage.getItem('skillsData')
    if (skillsData) {
      const parsed = JSON.parse(skillsData)
      setSkills(parsed.skills || {})
      setExpandableSkillRows(parsed.expandableRows || {})
      // Auto-expand skills that have rows
      const expandableRows = parsed.expandableRows || {}
      const expanded = {}
      Object.keys(expandableRows).forEach(key => {
        if (expandableRows[key] && expandableRows[key].length > 0) {
          expanded[key] = true
        }
      })
      setExpandedSkills(expanded)
    }

    // Загрузка custom skill names
    const customNamesData = charStorage.getItem('customSkillNames')
    if (customNamesData) {
      setCustomSkillNames(JSON.parse(customNamesData))
    }

    // Загрузка specialised skills
    const specSkillsData = charStorage.getItem('specialisedSkillsData')
    if (specSkillsData) {
      const parsed = JSON.parse(specSkillsData)
      if (parsed.length > 0) setSpecialisedSkills(parsed)
    }

    // Загрузка weapons
    const weaponsData = charStorage.getItem('weaponsData')
    if (weaponsData) {
      const parsed = JSON.parse(weaponsData)
      if (parsed.length > 0) setWeapons(parsed)
    }

    // Загрузка roles
    const rolesData = charStorage.getItem('rolesData')
    if (rolesData) {
      const parsed = JSON.parse(rolesData)
      if (parsed.length > 0) setRoles(parsed)
    }

    // Загрузка avatar
    const avatar = charStorage.getItem('avatar')
    if (avatar) {
      setAvatarPreview(avatar)
    }
  }, [currentCharacterId])

  // Показываем контент только после загрузки
  if (!currentCharacterId) {
    return (
      <div className="sheet">
        <div style={{ padding: '20px', textAlign: 'center', color: '#8b949e', gridColumn: '1 / -1' }}>
          Please select a character first (go to Characters page and click "Load to Character Sheet")
        </div>
      </div>
    )
  }

  // Авто-сохранение при изменении данных (как в оригинале)
  useEffect(() => {
    if (!currentCharacterId) return

    const timeoutId = setTimeout(() => {
      // Save skills
      charStorage.setItem('skillsData', JSON.stringify({ skills, expandableRows: expandableSkillRows }))

      // Save specialised skills
      charStorage.setItem('specialisedSkillsData', JSON.stringify(specialisedSkills))

      // Save weapons
      charStorage.setItem('weaponsData', JSON.stringify(weapons))

      // Save roles
      charStorage.setItem('rolesData', JSON.stringify(roles))

      // Save custom skill names
      charStorage.setItem('customSkillNames', JSON.stringify(customSkillNames))

      // Save avatar
      if (avatarPreview) {
        charStorage.setItem('avatar', avatarPreview)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [skills, expandableSkillRows, specialisedSkills, weapons, roles, customSkillNames, avatarPreview])

  const getStatValue = (statKey) => {
    const fieldId = STATS[statKey]
    return parseInt(characterData[fieldId]) || 0
  }

  const handleStatChange = (field, value) => {
    updateCharacterField(field, value)
  }

  const calculateBase = (statKey, mod, lvl) => {
    return getStatValue(statKey) + (parseInt(mod) || 0) + (parseInt(lvl) || 0)
  }

  const performSkillRoll = (baseValue, skillName) => {
    const roll = Math.floor(Math.random() * 10) + 1
    
    // Критический успех - бросаем еще один d10
    let extraRoll = null
    let total = baseValue + roll
    
    if (roll === 10) {
      extraRoll = Math.floor(Math.random() * 10) + 1
      total += extraRoll
    }
    
    setDiceResult({
      roll,
      extraRoll,
      base: baseValue,
      total,
      skillName,
      isCritSuccess: roll === 10,
      isCritFail: roll === 1
    })
  }

  const handleInitiativeRoll = () => {
    const refValue = getStatValue('REF')
    const roll = Math.floor(Math.random() * 10) + 1
    const total = roll + refValue
    updateCharacterField('initiative', total.toString())
    setDiceResult({
      roll,
      total,
      skillName: 'Initiative'
    })
  }

  // Skill handlers
  const updateSkill = (group, skillName, field, value) => {
    const key = `${group}_${skillName}`
    setSkills(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value }
    }))
  }

  // Получение стоимости прокачки навыка
  const getSkillUpgradeCost = (currentLvl, isX2Skill = false) => {
    if (currentLvl >= 10) return Infinity
    const baseCost = (currentLvl + 1) * 20
    return isX2Skill ? baseCost * 2 : baseCost
  }

  // Стоимость понижения уровня (возвращает XP)
  // При понижении с 1 до 0: возвращаем (0 + 1) * 20 = 20 XP
  // При понижении с 2 до 1: возвращаем (1 + 1) * 20 = 40 XP
  const getSkillDowngradeRefund = (currentLvl, isX2Skill = false) => {
    if (currentLvl <= 0) return 0
    const baseCost = (currentLvl - 1 + 1) * 20 // = currentLvl * 20
    return isX2Skill ? baseCost * 2 : baseCost
  }

  // Проверка, является ли навык x2
  const isX2Skill = (skillName) => {
    return X2_SKILLS.includes(skillName)
  }

  // Прокачка навыка за XP (только при включённом Adaptive Progression)
  const upgradeSkill = (group, skillName, currentLvl, isExpandable = false, rowId = null) => {
    if (!adaptiveProgression) return

    const x2 = isX2Skill(skillName)
    const cost = getSkillUpgradeCost(currentLvl, x2)
    const currentXP = parseInt(characterData.xp_current || '0')

    if (currentXP >= cost && currentLvl < 10) {
      updateCharacterField('xp_current', (currentXP - cost).toString())

      if (isExpandable && rowId) {
        const key = `${group}_${skillName}`
        setExpandableSkillRows(prev => ({
          ...prev,
          [key]: prev[key].map(row =>
            row.id === rowId ? { ...row, lvl: row.lvl + 1 } : row
          )
        }))
      } else {
        const key = `${group}_${skillName}`
        setSkills(prev => ({
          ...prev,
          [key]: { ...prev[key], lvl: (prev[key]?.lvl || 0) + 1 }
        }))
      }
    }
  }

  // Понижение уровня навыка (возврат XP)
  const downgradeSkill = (group, skillName, currentLvl, isExpandable = false, rowId = null) => {
    if (!adaptiveProgression) return
    if (currentLvl <= 0) return

    const x2 = isX2Skill(skillName)
    const refund = getSkillDowngradeRefund(currentLvl, x2)

    // Читаем XP через charStorage
    const charDataStr = charStorage.getItem('characterData')
    const charData = charDataStr ? JSON.parse(charDataStr) : {}
    const currentXP = parseInt(charData.xp_current || '0')
    const newXP = currentXP + refund
    
    console.log('downgradeSkill:', { currentLvl, refund, currentXP, newXP })

    // Сохраняем через charStorage
    charData.xp_current = newXP.toString()
    charStorage.setItem('characterData', JSON.stringify(charData))
    saveCharacterData(charData)

    if (isExpandable && rowId) {
      const key = `${group}_${skillName}`
      setExpandableSkillRows(prev => ({
        ...prev,
        [key]: prev[key].map(row =>
          row.id === rowId ? { ...row, lvl: Math.max(0, (row.lvl || 0) - 1) } : row
        )
      }))
    } else {
      const key = `${group}_${skillName}`
      setSkills(prev => ({
        ...prev,
        [key]: { ...prev[key], lvl: Math.max(0, (prev[key]?.lvl || 0) - 1) }
      }))
    }
  }

  // Прокачка специализированного навыка
  const upgradeSpecialisedSkill = (id, currentLvl) => {
    if (!adaptiveProgression) return

    const cost = getSkillUpgradeCost(currentLvl, false)
    const currentXP = parseInt(characterData.xp_current || '0')

    if (currentXP >= cost && currentLvl < 10) {
      updateCharacterField('xp_current', (currentXP - cost).toString())
      setSpecialisedSkills(prev => prev.map(skill =>
        skill.id === id ? { ...skill, lvl: (skill.lvl || 0) + 1 } : skill
      ))
    }
  }

  // Понижение специализированного навыка
  const downgradeSpecialisedSkill = (id, currentLvl) => {
    if (!adaptiveProgression) return
    if (currentLvl <= 0) return

    const refund = getSkillDowngradeRefund(currentLvl, false)
    
    // Читаем XP через charStorage
    const charDataStr = charStorage.getItem('characterData')
    const charData = charDataStr ? JSON.parse(charDataStr) : {}
    const currentXP = parseInt(charData.xp_current || '0')
    const newXP = currentXP + refund
    
    // Сохраняем через charStorage
    charData.xp_current = newXP.toString()
    charStorage.setItem('characterData', JSON.stringify(charData))
    saveCharacterData(charData)
    
    setSpecialisedSkills(prev => prev.map(skill =>
      skill.id === id ? { ...skill, lvl: Math.max(0, (skill.lvl || 0) - 1) } : skill
    ))
  }

  const addExpandableSkillRow = (group, skillName, statKey) => {
    const key = `${group}_${skillName}`
    setExpandableSkillRows(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), { id: Date.now(), mod: 0, lvl: 0, name: '' }]
    }))
  }

  const toggleExpandedSkill = (group, skillName) => {
    const key = `${group}_${skillName}`
    setExpandedSkills(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const removeExpandableSkillRow = (group, skillName, rowId) => {
    const key = `${group}_${skillName}`
    setExpandableSkillRows(prev => ({
      ...prev,
      [key]: prev[key].filter(r => r.id !== rowId)
    }))
  }

  const updateExpandableSkillRow = (group, skillName, rowId, field, value) => {
    const key = `${group}_${skillName}`
    setExpandableSkillRows(prev => ({
      ...prev,
      [key]: prev[key].map(r => r.id === rowId ? { ...r, [field]: value } : r)
    }))
  }

  const updateCustomSkillName = (group, skillName, customName) => {
    const key = `${group}_${skillName}`
    if (customName.trim() === '') {
      setCustomSkillNames(prev => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    } else {
      setCustomSkillNames(prev => ({
        ...prev,
        [key]: customName
      }))
    }
  }

  const getSkillDisplayName = (group, skillName) => {
    const key = `${group}_${skillName}`
    return customSkillNames[key] || skillName
  }

  // Specialised skills handlers
  const addSpecialisedSkill = () => {
    setSpecialisedSkills(prev => [...prev, { id: Date.now(), stat: '', name: '', mod: 0, lvl: 0 }])
  }

  const removeSpecialisedSkill = (id) => {
    if (specialisedSkills.length > 1) {
      setSpecialisedSkills(prev => prev.filter(s => s.id !== id))
    }
  }

  const updateSpecialisedSkill = (id, field, value) => {
    setSpecialisedSkills(prev => prev.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ))
  }

  // Weapon handlers
  const addWeapon = () => {
    setWeapons(prev => [...prev, { id: Date.now(), name: '', dmg: '', mag: '', rof: '', notes: '', attackSlots: [{ formula: '', notes: '' }] }])
  }

  const removeWeapon = (id) => {
    if (weapons.length > 1) {
      setWeapons(prev => prev.filter(w => w.id !== id))
    }
  }

  const updateWeapon = (id, field, value) => {
    setWeapons(prev => prev.map(w => 
      w.id === id ? { ...w, [field]: value } : w
    ))
  }

  const addAttackSlot = (weaponId) => {
    setWeapons(prev => prev.map(w => 
      w.id === weaponId 
        ? { ...w, attackSlots: [...w.attackSlots, { formula: '', notes: '' }] }
        : w
    ))
  }

  const removeAttackSlot = (weaponId, slotIndex) => {
    if (slotIndex === 0) return
    setWeapons(prev => prev.map(w => 
      w.id === weaponId 
        ? { ...w, attackSlots: w.attackSlots.filter((_, i) => i !== slotIndex) }
        : w
    ))
  }

  const updateAttackSlot = (weaponId, slotIndex, field, value) => {
    setWeapons(prev => prev.map(w => {
      if (w.id !== weaponId) return w
      const newSlots = [...w.attackSlots]
      newSlots[slotIndex] = { ...newSlots[slotIndex], [field]: value }
      return { ...w, attackSlots: newSlots }
    }))
  }

  const rollWeaponDamage = (weaponId, slotIndex, formula) => {
    const diceMatch = formula.match(/(\d+)[dD](\d+)\s*(?:\+\s*(\d+))?/)
    if (!diceMatch) {
      alert('Invalid formula. Use format: NdM + K (e.g., 3d6 + 5)')
      return
    }

    const count = parseInt(diceMatch[1])
    const sides = parseInt(diceMatch[2])
    const bonus = parseInt(diceMatch[3] || '0')
    
    const seriouslyWounded = characterData.seriously_wounded || false
    const swModifier = seriouslyWounded ? -2 : 0

    let rolls = []
    let sum = 0
    for (let i = 0; i < count; i++) {
      const roll = Math.floor(Math.random() * sides) + 1
      rolls.push(roll)
      sum += roll
    }
    const finalTotal = sum + bonus + swModifier
    
    const weapon = weapons.find(w => w.id === weaponId)
    
    setDiceResult({
      rolls,
      total: finalTotal,
      bonus,
      count,
      sides,
      skillName: `${weapon?.name || 'Weapon'} Damage${swModifier ? ' (SW -2)' : ''}`,
      formula,
      isWeapon: true
    })
  }

  // Role handlers
  const addRole = () => {
    if (roles.length >= 3) {
      alert('Maximum 3 roles allowed')
      return
    }

    // Стоимость добавления = стоимость прокачки с 1 до 2 уровня = 40 XP
    const cost = getSkillUpgradeCost(1, false)
    const currentXP = parseInt(characterData.xp_current || '0')

    if (adaptiveProgression && currentXP < cost) {
      alert(`Not enough XP. Need ${cost} XP to add a role.`)
      return
    }

    if (adaptiveProgression) {
      updateCharacterField('xp_current', (currentXP - cost).toString())
    }

    setRoles(prev => [...prev, { id: Date.now(), role: '', ability: '', lvl: 1 }])
  }

  const removeRole = (id) => {
    if (roles.length <= 1) {
      alert('You must have at least one role')
      return
    }

    const role = roles.find(r => r.id === id)
    if (!role) return

    // Возврат XP за удаление (как за понижение до 0)
    if (adaptiveProgression) {
      const refund = getSkillDowngradeRefund(role.lvl, false)
      updateCharacterField('xp_current', (parseInt(characterData.xp_current || '0') + refund).toString())
    }

    setRoles(prev => prev.filter(r => r.id !== id))
  }

  const updateRole = (id, field, value) => {
    setRoles(prev => prev.map(r =>
      r.id === id ? { ...r, [field]: value } : r
    ))
  }

  // Получение текущего Role персонажа (для первой роли)
  const getCharacterRole = () => {
    return roles[0]?.role || characterData.role || 'Solo'
  }

  // Прокачка ролевой способности
  const upgradeRoleAbility = (id, currentLvl) => {
    if (!adaptiveProgression) return

    const cost = getSkillUpgradeCost(currentLvl, false)
    const currentXP = parseInt(characterData.xp_current || '0')

    if (currentXP >= cost && currentLvl < 10) {
      updateCharacterField('xp_current', (currentXP - cost).toString())
      setRoles(prev => prev.map(role =>
        role.id === id ? { ...role, lvl: role.lvl + 1 } : role
      ))
    }
  }

  // Понижение ролевой способности
  const downgradeRoleAbility = (id, currentLvl) => {
    if (!adaptiveProgression) return
    if (currentLvl <= 0) return

    const refund = getSkillDowngradeRefund(currentLvl, false)
    
    // Читаем XP через charStorage
    const charDataStr = charStorage.getItem('characterData')
    const charData = charDataStr ? JSON.parse(charDataStr) : {}
    const currentXP = parseInt(charData.xp_current || '0')
    const newXP = currentXP + refund
    
    // Сохраняем через charStorage
    charData.xp_current = newXP.toString()
    charStorage.setItem('characterData', JSON.stringify(charData))
    saveCharacterData(charData)
    
    setRoles(prev => prev.map(role =>
      role.id === id ? { ...role, lvl: Math.max(0, (role.lvl || 0) - 1) } : role
    ))
  }

  // Avatar handlers
  const handleAvatarSave = () => {
    if (avatarUrl) {
      setAvatarPreview(avatarUrl)
      charStorage.setItem('avatar', avatarUrl)
      setAvatarDialogOpen(false)
      setAvatarUrl('')
    }
  }

  const handleAvatarRemove = () => {
    setAvatarPreview(null)
    charStorage.setItem('avatar', '')
    setAvatarDialogOpen(false)
  }

  return (
    <div className="sheet">
      {/* LEFT COLUMN */}
      <div className="left-column">
        {/* ID BLOCK */}
        <div className="block id-block">
          <div className="block-header">id</div>
          <div className="id-content">
            <div className="fingerprint-area" onClick={() => setAvatarDialogOpen(true)}>
              {avatarPreview ? (
                <img className="avatar-image" src={avatarPreview} alt="Avatar" />
              ) : (
                <div className="avatar-placeholder">
                  <div className="fingerprint"></div>
                </div>
              )}
              <div className="id-date">[{new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}]</div>
            </div>
            <div className="id-fields">
              <div className="id-row">
                <label>name</label>
                <input 
                  type="text" 
                  id="char-name"
                  value={characterData.char_name || ''}
                  onChange={(e) => updateCharacterField('char_name', e.target.value)}
                />
              </div>
              <div className="id-row">
                <label>age</label>
                <input 
                  type="text" 
                  id="age"
                  value={characterData.age || ''}
                  onChange={(e) => updateCharacterField('age', e.target.value)}
                />
              </div>
              <div className="id-row role-ability-row">
                <label>roles</label>
                <div className="role-ability-container" id="role-ability-container">
                  {roles.map((roleItem, index) => {
                    const characterRole = roleItem.role || 'Solo'
                    const roleAbilities = ROLE_ABILITIES_LIST[characterRole] || []
                    const currentLvl = roleItem.lvl || 1
                    const upgradeCost = getSkillUpgradeCost(currentLvl, false)
                    const downgradeRefund = getSkillDowngradeRefund(currentLvl, false)
                    const canUpgrade = adaptiveProgression && parseInt(characterData.xp_current || '0') >= upgradeCost && currentLvl < 10
                    const canDowngrade = adaptiveProgression && currentLvl > 0
                    const isPrimary = index === 0

                    return (
                      <div key={roleItem.id} className="role-ability-entry" style={{ marginBottom: '10px', padding: '6px', background: '#161b22', borderRadius: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontSize: '7px', color: '#f78166', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {isPrimary ? 'Primary' : `Role #${index + 1}`}
                          </span>
                          {!isPrimary && !adaptiveProgression && (
                            <button
                              className="delete-ss-btn"
                              onClick={() => removeRole(roleItem.id)}
                              style={{
                                width: '16px',
                                height: '16px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                opacity: 1
                              }}
                              title="Remove role"
                            >
                              ×
                            </button>
                          )}
                        </div>
                        <div style={{ marginBottom: '4px' }}>
                          <select
                            className="role-select"
                            value={roleItem.role || ''}
                            onChange={(e) => updateRole(roleItem.id, 'role', e.target.value)}
                            style={{ width: '100%', padding: '4px 6px', fontSize: '10px' }}
                          >
                            <option value="">Select role...</option>
                            {ROLES_LIST.map((r) => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                        </div>
                        <div style={{ marginBottom: '4px' }}>
                          <select
                            className="role-ability-name"
                            value={roleItem.ability || ''}
                            onChange={(e) => updateRole(roleItem.id, 'ability', e.target.value)}
                            style={{ width: '100%', padding: '4px 6px', fontSize: '10px' }}
                          >
                            <option value="">Select ability...</option>
                            {roleAbilities.map((abilityName, idx) => (
                              <option key={idx} value={abilityName}>{abilityName}</option>
                            ))}
                          </select>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '7px', color: '#8b949e', textTransform: 'uppercase' }}>LVL</span>
                          <input
                            type="number"
                            className="role-ability-lvl"
                            placeholder="LVL"
                            min="1"
                            max="10"
                            value={roleItem.lvl}
                            onChange={(e) => updateRole(roleItem.id, 'lvl', Math.max(1, parseInt(e.target.value) || 1))}
                            readOnly={adaptiveProgression}
                            style={{ width: '45px', padding: '3px 4px', fontSize: '10px' }}
                          />
                          {adaptiveProgression && (
                            <>
                              <button
                                className="upgrade-btn"
                                onClick={() => downgradeRoleAbility(roleItem.id, currentLvl)}
                                disabled={!canDowngrade}
                                style={{
                                  width: '20px',
                                  height: '18px',
                                  fontSize: '12px',
                                  background: '#da3633',
                                  border: '1px solid #da3633',
                                  cursor: canDowngrade ? 'pointer' : 'not-allowed',
                                  opacity: canDowngrade ? 1 : 0.5
                                }}
                                title={`Downgrade to LVL ${currentLvl - 1}, refund ${downgradeRefund} XP`}
                              >
                                −
                              </button>
                              <button
                                className="upgrade-btn"
                                onClick={() => upgradeRoleAbility(roleItem.id, currentLvl)}
                                disabled={!canUpgrade}
                                style={{
                                  width: '20px',
                                  height: '18px',
                                  fontSize: '12px',
                                  cursor: canUpgrade ? 'pointer' : 'not-allowed',
                                  opacity: canUpgrade ? 1 : 0.5
                                }}
                                title={`Upgrade to LVL ${currentLvl + 1} for ${upgradeCost} XP`}
                              >
                                +
                              </button>
                              {!isPrimary && (
                                <button
                                  className="delete-ss-btn"
                                  onClick={() => removeRole(roleItem.id)}
                                  style={{
                                    width: '16px',
                                    height: '16px',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    opacity: 1
                                  }}
                                  title="Remove role"
                                >
                                  ×
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  {roles.length < 3 && (
                    <button
                      className="add-skill-btn"
                      onClick={addRole}
                      style={{ marginTop: '4px', fontSize: '10px', padding: '6px 12px', width: 'auto', minWidth: '100px' }}
                    >
                      + Add Role
                    </button>
                  )}
                </div>
              </div>
              <div className="id-row">
                <label>XP</label>
                <input
                  type="number"
                  id="xp_current"
                  className="xp-input"
                  placeholder="0"
                  value={characterData.xp_current || ''}
                  onChange={(e) => updateCharacterField('xp_current', e.target.value)}
                />
              </div>
              <div className="id-row">
                <label></label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '9px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  <input
                    type="checkbox"
                    checked={adaptiveProgression}
                    onChange={(e) => setAdaptiveProgression(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <span style={{ color: '#f78166', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Adaptive</span>
                </label>
              </div>
              <div className="id-row">
                <label>humanity</label>
                <input 
                  type="number" 
                  id="humanity_current"
                  className="humanity-input"
                  value={characterData.humanity_current || ''}
                  onChange={(e) => updateCharacterField('humanity_current', e.target.value)}
                />
                <span>/</span>
                <input 
                  type="number" 
                  id="humanity_max"
                  className="humanity-input"
                  value={characterData.humanity_max || ''}
                  onChange={(e) => updateCharacterField('humanity_max', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* INITIATIVE */}
        <div className="block initiative-block">
          <div className="block-header">initiative</div>
          <div className="initiative-content">
            <input 
              type="text" 
              id="initiative"
              className="initiative-input"
              value={characterData.initiative || ''}
              onChange={(e) => updateCharacterField('initiative', e.target.value)}
            />
            <button className="roll-init-btn" id="roll-init-btn" onClick={handleInitiativeRoll}>🎲</button>
          </div>
        </div>

        {/* STATS */}
        <div className="block stats-block">
          <div className="block-header">STATS</div>
          <div className="stats-vertical">
            {Object.entries(STATS).map(([key, fieldId]) => {
              const isMaxField = key === 'LUCK' || key === 'EMP'
              const maxFieldId = key === 'LUCK' ? 'stat_luck_max' : key === 'EMP' ? 'stat_emp_max' : null

              return (
                <div key={key} className="stat-row">
                  <label>{key}</label>
                  <input
                    type="number"
                    id={fieldId}
                    className="stat-input"
                    value={characterData[fieldId] || ''}
                    onChange={(e) => handleStatChange(fieldId, e.target.value)}
                  />
                  {isMaxField && maxFieldId && (
                    <>
                      <span>/</span>
                      <input
                        type="number"
                        id={maxFieldId}
                        className="stat-input stat-input-small"
                        value={characterData[maxFieldId] || ''}
                        onChange={(e) => handleStatChange(maxFieldId, e.target.value)}
                      />
                    </>
                  )}
                  {!isMaxField && (
                    <span className="stat-mod">MOD</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* MIDDLE COLUMN */}
      <div className="middle-column">
        {/* HEALTH & INJURIES */}
        <div className="row-blocks">
          <div className="block health-block">
            <div className="block-header">
              <span className="health-icons">⚡</span> HEALTH <span className="health-icons">⚡</span>
            </div>
            <div className="health-content">
              <div className="health-row">
                <label>HIT points</label>
                <input 
                  type="number"
                  id="hp_current"
                  value={characterData.hp_current || ''}
                  onChange={(e) => updateCharacterField('hp_current', e.target.value)}
                />
                <span>/</span>
                <input 
                  type="number"
                  id="hp_max"
                  value={characterData.hp_max || ''}
                  onChange={(e) => updateCharacterField('hp_max', e.target.value)}
                />
              </div>
              <div className="health-row">
                <label>SERIOUSLY wounded</label>
                <input 
                  type="checkbox"
                  id="seriously_wounded"
                  checked={characterData.seriously_wounded || false}
                  onChange={(e) => updateCharacterField('seriously_wounded', e.target.checked)}
                />
              </div>
              <div className="health-penalty">-2 TO ALL ACTIONS WHEN SERIOUSLY WOUNDED</div>
              <div className="health-row">
                <label>DEATH save</label>
                <input 
                  type="number"
                  id="death_save"
                  value={characterData.death_save || ''}
                  onChange={(e) => updateCharacterField('death_save', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="block injuries-block">
            <div className="block-header">INJURIES / ADDICTIONS</div>
            <div className="injuries-content">
              <div className="injuries-section">
                <label>CRITICAL injuries</label>
                <textarea 
                  id="critical_injuries"
                  value={characterData.critical_injuries || ''}
                  onChange={(e) => updateCharacterField('critical_injuries', e.target.value)}
                />
              </div>
              <div className="injuries-section">
                <label>addictions</label>
                <textarea 
                  id="addictions"
                  value={characterData.addictions || ''}
                  onChange={(e) => updateCharacterField('addictions', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ARMOR */}
        <div className="block armor-block">
          <div className="block-header">ARMOR</div>
          <div className="armor-content">
            {['head', 'body', 'shield'].map(part => (
              <div key={part} className="armor-section">
                <div className="armor-header">
                  <span>{part.toUpperCase()}</span>
                  <span>SP</span>
                  <span>NOTES</span>
                  <span>PENALTY</span>
                </div>
                <div className="armor-row">
                  <input 
                    type="number" 
                    id={`armor_${part}_sp`}
                    className="armor-sp"
                    value={characterData[`armor_${part}_sp`] || ''}
                    onChange={(e) => updateCharacterField(`armor_${part}_sp`, e.target.value)}
                  />
                  <input 
                    type="text" 
                    id={`armor_${part}_notes`}
                    className="armor-notes"
                    value={characterData[`armor_${part}_notes`] || ''}
                    onChange={(e) => updateCharacterField(`armor_${part}_notes`, e.target.value)}
                  />
                  <input 
                    type="text" 
                    id={`armor_${part}_penalty`}
                    className="armor-penalty"
                    value={characterData[`armor_${part}_penalty`] || ''}
                    onChange={(e) => updateCharacterField(`armor_${part}_penalty`, e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SPECIALISED SKILLS */}
        <div className="block specialised-skills-block">
          <div className="block-header">
            SPECIALISED skills 
            <button className="add-btn" id="add-ss-btn" onClick={addSpecialisedSkill}>+</button>
          </div>
          <div className="specialised-skills-content">
            <table className="specialised-skills-table">
              <thead>
                <tr>
                  <th>STAT</th>
                  <th>NAME</th>
                  <th>MOD</th>
                  <th>LVL</th>
                  <th>STAT</th>
                  <th>BASE</th>
                  <th></th>
                </tr>
              </thead>
              <tbody id="specialised-skills-body">
                {specialisedSkills.map((skill) => (
                  <React.Fragment key={skill.id}>
                    <tr>
                    <td>
                      <input 
                        type="text" 
                        className="ss-stat"
                        value={skill.stat}
                        onChange={(e) => updateSpecialisedSkill(skill.id, 'stat', e.target.value.toUpperCase())}
                      />
                    </td>
                    <td>
                      <input 
                        type="text" 
                        className="ss-name"
                        value={skill.name}
                        onChange={(e) => updateSpecialisedSkill(skill.id, 'name', e.target.value)}
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        className="ss-mod"
                        value={skill.mod}
                        onChange={(e) => updateSpecialisedSkill(skill.id, 'mod', parseInt(e.target.value) || 0)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="ss-lvl"
                        value={skill.lvl}
                        onChange={(e) => updateSpecialisedSkill(skill.id, 'lvl', parseInt(e.target.value) || 0)}
                        readOnly={adaptiveProgression}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="ss-stat-val"
                        readOnly
                        value={skill.stat ? getStatValue(skill.stat) : ''}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="ss-base"
                        readOnly
                        value={calculateBase(skill.stat, skill.mod, skill.lvl)}
                      />
                    </td>
                    <td className="ss-action-cell">
                      <button
                        className="roll-ss-btn"
                        onClick={() => performSkillRoll(calculateBase(skill.stat, skill.mod, skill.lvl), skill.name || 'Specialised Skill')}
                      >
                        🎲
                      </button>
                      <button
                        className="delete-ss-btn"
                        onClick={() => removeSpecialisedSkill(skill.id)}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                  {adaptiveProgression && (
                    <tr>
                      <td colSpan="6" style={{ padding: '4px 0' }}>
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center', paddingLeft: '10px' }}>
                          <button
                            className="upgrade-btn"
                            onClick={() => downgradeSpecialisedSkill(skill.id, skill.lvl || 0)}
                            disabled={(skill.lvl || 0) <= 0}
                            style={{
                              width: '24px',
                              height: '20px',
                              fontSize: '14px',
                              background: '#da3633',
                              border: '1px solid #da3633',
                              cursor: (skill.lvl || 0) > 0 ? 'pointer' : 'not-allowed',
                              opacity: (skill.lvl || 0) > 0 ? 1 : 0.5
                            }}
                            title={`Downgrade to LVL ${(skill.lvl || 0) - 1}, refund ${getSkillDowngradeRefund(skill.lvl || 0, false)} XP`}
                          >
                            −
                          </button>
                          <button
                            className="upgrade-btn"
                            onClick={() => upgradeSpecialisedSkill(skill.id, skill.lvl || 0)}
                            disabled={parseInt(characterData.xp_current || '0') < getSkillUpgradeCost(skill.lvl || 0, false) || (skill.lvl || 0) >= 10}
                            style={{
                              cursor: (parseInt(characterData.xp_current || '0') >= getSkillUpgradeCost(skill.lvl || 0, false) && (skill.lvl || 0) < 10) ? 'pointer' : 'not-allowed',
                              opacity: (parseInt(characterData.xp_current || '0') >= getSkillUpgradeCost(skill.lvl || 0, false) && (skill.lvl || 0) < 10) ? 1 : 0.5
                            }}
                            title={`Upgrade to LVL ${(skill.lvl || 0) + 1} for ${getSkillUpgradeCost(skill.lvl || 0, false)} XP`}
                          >
                            +
                          </button>
                          <span style={{ fontSize: '9px', color: '#8b949e' }}>
                            Cost: {getSkillUpgradeCost(skill.lvl, false)} XP
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

        {/* WEAPONS */}
        <div className="block weapons-block">
          <div className="block-header">
            WEAPONS 
            <button className="add-btn" id="add-weapon-btn" onClick={addWeapon}>+</button>
          </div>
          <div className="weapons-content" id="weapons-container">
            {weapons.map((weapon) => (
              <div key={weapon.id} className="weapon-row">
                <div className="weapon-label">Weapon</div>
                <div className="weapon-label">DMG</div>
                <div className="weapon-label">MAG</div>
                <div className="weapon-label">ROF</div>
                <div></div>
                <input 
                  type="text" 
                  className="weapon-name-input" 
                  placeholder="Weapon name"
                  value={weapon.name}
                  onChange={(e) => updateWeapon(weapon.id, 'name', e.target.value)}
                />
                <input 
                  type="text" 
                  className="weapon-dmg-input" 
                  placeholder="DMG"
                  value={weapon.dmg}
                  onChange={(e) => updateWeapon(weapon.id, 'dmg', e.target.value)}
                />
                <input 
                  type="text" 
                  className="weapon-mag-input" 
                  placeholder="MAG"
                  value={weapon.mag}
                  onChange={(e) => updateWeapon(weapon.id, 'mag', e.target.value)}
                />
                <input 
                  type="text" 
                  className="weapon-rof-input" 
                  placeholder="ROF"
                  value={weapon.rof}
                  onChange={(e) => updateWeapon(weapon.id, 'rof', e.target.value)}
                />
                <button className="delete-btn" onClick={() => removeWeapon(weapon.id)}>×</button>
                <div className="weapon-dice-container">
                  <div className="attack-slots">
                    {weapon.attackSlots.map((slot, slotIndex) => (
                      <div key={slotIndex} className="attack-slot">
                        <input 
                          type="text" 
                          className="weapon-dice-formula" 
                          placeholder="3d6 + 2d10 + 5"
                          value={slot.formula}
                          onChange={(e) => updateAttackSlot(weapon.id, slotIndex, 'formula', e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              rollWeaponDamage(weapon.id, slotIndex, slot.formula)
                            }
                          }}
                        />
                        <button 
                          className="weapon-roll-btn" 
                          onClick={() => rollWeaponDamage(weapon.id, slotIndex, slot.formula)}
                        >
                          🎲
                        </button>
                        <button 
                          className="remove-attack-btn" 
                          onClick={() => removeAttackSlot(weapon.id, slotIndex)}
                          style={{ display: slotIndex === 0 ? 'none' : 'inline-flex' }}
                        >
                          −
                        </button>
                        <input 
                          type="text" 
                          className="weapon-attack-notes" 
                          placeholder="Attack notes (e.g., headshot, burst)"
                          value={slot.notes}
                          onChange={(e) => updateAttackSlot(weapon.id, slotIndex, 'notes', e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                  <button className="add-attack-btn" onClick={() => addAttackSlot(weapon.id)}>+ Attack</button>
                </div>
                <div className="weapon-notes">
                  <span className="weapon-notes-label">NOTES</span>
                  <input 
                    type="text" 
                    className="weapon-notes-input" 
                    placeholder="Notes"
                    value={weapon.notes}
                    onChange={(e) => updateWeapon(weapon.id, 'notes', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* NOTES */}
        <div className="block notes-block">
          <div className="block-header">NOTES</div>
          <div className="notes-content">
            <textarea 
              id="notes"
              value={characterData.notes || ''}
              onChange={(e) => updateCharacterField('notes', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="right-column">
        <div className="block skills-block">
          <div className="block-header">SKILLS</div>
          <div className="skills-content" id="skills-container">
            {Object.entries(SKILL_GROUPS).map(([group, skillsList]) => {
              const isExpandableGroup = EXPANDABLE_SKILLS[group]
              
              return (
                <div key={group} className="skill-group">
                  <div className="skill-group-title">{group.replace(/_/g, ' ')}</div>
                  <table className="skill-table">
                    <thead>
                      <tr>
                        <th colSpan="6" className="skill-name-header">SKILL</th>
                      </tr>
                      <tr>
                        <th>MOD</th>
                        <th>LVL</th>
                        <th>STAT</th>
                        <th>BASE</th>
                        <th colSpan="2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {skillsList.map(([skillName, statKey]) => {
                        const skillKey = `${group}_${skillName}`
                        const skillData = skills[skillKey] || { mod: 0, lvl: 0 }
                        const isExpandable = isExpandableGroup?.includes(skillName)
                        const expandableRows = expandableSkillRows[skillKey] || []

                        return (
                          <React.Fragment key={skillKey}>
                            <tr className="skill-name-row">
                              <td colSpan="6" className="skill-name-cell-full">
                                <input 
                                  type="text" 
                                  className="skill-name-input-full" 
                                  value={getSkillDisplayName(group, skillName)}
                                  onChange={(e) => updateCustomSkillName(group, skillName, e.target.value)}
                                  placeholder={skillName}
                                />
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <input
                                  type="number"
                                  className="mod-input"
                                  value={skillData.mod || 0}
                                  onChange={(e) => updateSkill(group, skillName, 'mod', parseInt(e.target.value) || 0)}
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className="lvl-input"
                                  value={skillData.lvl || 0}
                                  onChange={(e) => updateSkill(group, skillName, 'lvl', parseInt(e.target.value) || 0)}
                                  readOnly={adaptiveProgression}
                                />
                              </td>
                              <td>
                                <input type="text" className="stat-input-display" readOnly value={getStatValue(statKey)} />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="base-input"
                                  readOnly
                                  value={calculateBase(statKey, skillData.mod, skillData.lvl)}
                                />
                              </td>
                              <td className="skill-action-cell">
                                {isExpandable && (
                                  <button
                                    className="add-skill-btn"
                                    onClick={() => {
                                      if (!expandedSkills[skillKey]) {
                                        toggleExpandedSkill(group, skillName)
                                      } else {
                                        addExpandableSkillRow(group, skillName, statKey)
                                      }
                                    }}
                                    title={expandedSkills[skillKey] ? 'Add another row' : 'Expand skill'}
                                  >
                                    {expandedSkills[skillKey] ? '+' : '+'}
                                  </button>
                                )}
                                <button
                                  className="roll-skill-btn"
                                  onClick={() => performSkillRoll(calculateBase(statKey, skillData.mod, skillData.lvl), skillName)}
                                >
                                  🎲
                                </button>
                                {isX2Skill(skillName) && (
                                  <span style={{ fontSize: '9px', color: '#f78166', marginLeft: '4px', display: 'block' }} title="Requires x2 XP">x2</span>
                                )}
                              </td>
                            </tr>
                            {adaptiveProgression && (
                              <tr>
                                <td colSpan="6" style={{ padding: '4px 0' }}>
                                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center', paddingLeft: '10px' }}>
                                    <button
                                      className="upgrade-btn"
                                      onClick={() => {
                                        console.log('Button clicked:', { group, skillName, lvl: skillData.lvl })
                                        downgradeSkill(group, skillName, skillData.lvl || 0, false, null)
                                      }}
                                      disabled={(skillData.lvl || 0) <= 0}
                                      style={{
                                        width: '24px',
                                        height: '20px',
                                        fontSize: '14px',
                                        background: '#da3633',
                                        border: '1px solid #da3633',
                                        cursor: (skillData.lvl || 0) > 0 ? 'pointer' : 'not-allowed',
                                        opacity: (skillData.lvl || 0) > 0 ? 1 : 0.5
                                      }}
                                      title={`Downgrade to LVL ${(skillData.lvl || 0) - 1}, refund ${getSkillDowngradeRefund(skillData.lvl || 0, isX2Skill(skillName))} XP`}
                                    >
                                      −
                                    </button>
                                    <button
                                      className="upgrade-btn"
                                      onClick={() => upgradeSkill(group, skillName, skillData.lvl || 0, false, null)}
                                      disabled={parseInt(characterData.xp_current || '0') < getSkillUpgradeCost(skillData.lvl || 0, isX2Skill(skillName)) || (skillData.lvl || 0) >= 10}
                                      style={{
                                        cursor: (parseInt(characterData.xp_current || '0') >= getSkillUpgradeCost(skillData.lvl || 0, isX2Skill(skillName)) && (skillData.lvl || 0) < 10) ? 'pointer' : 'not-allowed',
                                        opacity: (parseInt(characterData.xp_current || '0') >= getSkillUpgradeCost(skillData.lvl || 0, isX2Skill(skillName)) && (skillData.lvl || 0) < 10) ? 1 : 0.5
                                      }}
                                      title={`Upgrade to LVL ${(skillData.lvl || 0) + 1} for ${getSkillUpgradeCost(skillData.lvl || 0, isX2Skill(skillName))} XP${isX2Skill(skillName) ? ' (x2)' : ''}`}
                                    >
                                      +
                                    </button>
                                    <span style={{ fontSize: '9px', color: '#8b949e' }}>
                                      Cost: {getSkillUpgradeCost(skillData.lvl || 0, isX2Skill(skillName))} XP{isX2Skill(skillName) ? ' (x2)' : ''}
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            )}
                            {expandedSkills[skillKey] && expandableRows.map((row) => (
                              <React.Fragment key={row.id}>
                                <tr className="expandable-skill-row skill-name-row">
                                  <td colSpan="6" className="skill-name-cell-full" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <input 
                                      type="text" 
                                      className="skill-name-input-full" 
                                      value={row.name || getSkillDisplayName(group, skillName)}
                                      onChange={(e) => updateExpandableSkillRow(group, skillName, row.id, 'name', e.target.value)}
                                      placeholder={skillName}
                                      style={{ flex: 1 }} 
                                    />
                                    <button
                                      className="delete-skill-btn"
                                      onClick={() => {
                                        setExpandedSkills(prev => ({ ...prev, [skillKey]: false }))
                                      }}
                                      style={{ marginRight: '8px' }}
                                      title="Collapse skill"
                                    >
                                      −
                                    </button>
                                  </td>
                                </tr>
                                <tr className="expandable-skill-row">
                                  <td>
                                    <input
                                      type="number"
                                      className="mod-input"
                                      value={row.mod || 0}
                                      onChange={(e) => updateExpandableSkillRow(group, skillName, row.id, 'mod', parseInt(e.target.value) || 0)}
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="number"
                                      className="lvl-input"
                                      value={row.lvl || 0}
                                      onChange={(e) => updateExpandableSkillRow(group, skillName, row.id, 'lvl', parseInt(e.target.value) || 0)}
                                      readOnly={adaptiveProgression}
                                    />
                                  </td>
                                  <td>
                                    <input type="text" className="stat-input-display" readOnly value={getStatValue(statKey)} />
                                  </td>
                                  <td>
                                    <input
                                      type="text"
                                      className="base-input"
                                      readOnly
                                      value={calculateBase(statKey, row.mod, row.lvl)}
                                    />
                                  </td>
                                  <td className="skill-action-cell">
                                    <button
                                      className="delete-skill-btn"
                                      onClick={() => removeExpandableSkillRow(group, skillName, row.id)}
                                    >
                                      ×
                                    </button>
                                    <button
                                      className="roll-skill-btn"
                                      onClick={() => performSkillRoll(calculateBase(statKey, row.mod, row.lvl), skillName)}
                                    >
                                      🎲
                                    </button>
                                    {isX2Skill(skillName) && (
                                      <span style={{ fontSize: '9px', color: '#f78166', marginLeft: '4px', display: 'block' }} title="Requires x2 XP">x2</span>
                                    )}
                                  </td>
                                </tr>
                                {adaptiveProgression && (
                                  <tr>
                                    <td colSpan="6" style={{ padding: '4px 0' }}>
                                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center', paddingLeft: '10px' }}>
                                        <button
                                          className="upgrade-btn"
                                          onClick={() => downgradeSkill(group, skillName, row.lvl || 0, true, row.id)}
                                          disabled={(row.lvl || 0) <= 0}
                                          style={{
                                            width: '24px',
                                            height: '20px',
                                            fontSize: '14px',
                                            background: '#da3633',
                                            border: '1px solid #da3633',
                                            cursor: (row.lvl || 0) > 0 ? 'pointer' : 'not-allowed',
                                            opacity: (row.lvl || 0) > 0 ? 1 : 0.5
                                          }}
                                          title={`Downgrade to LVL ${(row.lvl || 0) - 1}, refund ${getSkillDowngradeRefund(row.lvl || 0, isX2Skill(skillName))} XP`}
                                        >
                                          −
                                        </button>
                                        <button
                                          className="upgrade-btn"
                                          onClick={() => upgradeSkill(group, skillName, row.lvl || 0, true, row.id)}
                                          disabled={parseInt(characterData.xp_current || '0') < getSkillUpgradeCost(row.lvl || 0, isX2Skill(skillName)) || (row.lvl || 0) >= 10}
                                          style={{
                                            cursor: (parseInt(characterData.xp_current || '0') >= getSkillUpgradeCost(row.lvl || 0, isX2Skill(skillName)) && (row.lvl || 0) < 10) ? 'pointer' : 'not-allowed',
                                            opacity: (parseInt(characterData.xp_current || '0') >= getSkillUpgradeCost(row.lvl || 0, isX2Skill(skillName)) && (row.lvl || 0) < 10) ? 1 : 0.5
                                          }}
                                          title={`Upgrade to LVL ${(row.lvl || 0) + 1} for ${getSkillUpgradeCost(row.lvl || 0, isX2Skill(skillName))} XP${isX2Skill(skillName) ? ' (x2)' : ''}`}
                                        >
                                          +
                                        </button>
                                        <span style={{ fontSize: '9px', color: '#8b949e' }}>
                                          Cost: {getSkillUpgradeCost(row.lvl || 0, isX2Skill(skillName))} XP{isX2Skill(skillName) ? ' (x2)' : ''}
                                        </span>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            ))}
                          </React.Fragment>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* AVATAR DIALOG */}
      {avatarDialogOpen && (
        <div className="dialog-overlay" onClick={() => setAvatarDialogOpen(false)}>
          <div className="dialog avatar-dialog" onClick={e => e.stopPropagation()}>
            <div className="dialog-header">
              <span>Set Character Avatar</span>
              <button className="dialog-close" onClick={() => setAvatarDialogOpen(false)}>×</button>
            </div>
            <div className="dialog-content">
              <div className="avatar-dialog-section">
                <label>Imgur Image URL</label>
                <input 
                  type="url" 
                  id="avatar-url-input"
                  className="avatar-url-input"
                  placeholder="https://i.imgur.com/your-image.png"
                  value={avatarUrl}
                  onChange={(e) => {
                    setAvatarUrl(e.target.value)
                    setAvatarPreview(e.target.value)
                  }}
                />
                <p className="avatar-help-text">Paste a direct link to an image from Imgur (ends with .png, .jpg, .gif, or .webp)</p>
              </div>
              {avatarUrl && (
                <div className="avatar-preview-section" id="avatar-preview-section">
                  <label>Preview</label>
                  <img id="avatar-preview" className="avatar-preview" src={avatarUrl} alt="Preview" />
                </div>
              )}
            </div>
            <div className="dialog-footer">
              <button className="dialog-btn" id="avatar-remove-btn" onClick={handleAvatarRemove}>Remove Avatar</button>
              <button className="dialog-btn dialog-btn-primary" id="avatar-save-btn" onClick={handleAvatarSave}>Save Avatar</button>
            </div>
          </div>
        </div>
      )}

      {/* DICE RESULT TOAST */}
      {diceResult && (
        <div className="dice-result-toast">
          <div className="dice-result-header">
            <span>{diceResult.skillName}</span>
            <button onClick={() => setDiceResult(null)}>×</button>
          </div>
          <div className="dice-result-body">
            {diceResult.isWeapon ? (
              <>
                <div className="dice-rolls">
                  {diceResult.rolls.map((roll, i) => (
                    <div 
                      key={i} 
                      className={`dice-roll-item ${
                        roll === diceResult.sides ? 'crit-success' : roll === 1 ? 'crit-fail' : ''
                      }`}
                    >
                      {roll}
                    </div>
                  ))}
                </div>
                <div className="dice-total-display">
                  <span className="dice-total-label">Total:</span>
                  <span className="dice-total-value">{diceResult.total}</span>
                </div>
                <p className="dice-description">
                  Roll: {diceResult.count}d{diceResult.sides} {diceResult.bonus > 0 ? `+ ${diceResult.bonus}` : ''}
                </p>
              </>
            ) : (
              <>
                <div className="dice-rolls">
                  {/* Основной бросок d10 */}
                  {diceResult.roll !== undefined && (
                    <div
                      className={`dice-roll-item ${
                        diceResult.isCritSuccess ? 'crit-success' : diceResult.isCritFail ? 'crit-fail' : ''
                      }`}
                    >
                      {diceResult.roll}
                    </div>
                  )}
                  {/* Дополнительный бросок при критическом успехе */}
                  {diceResult.extraRoll && (
                    <div className="dice-roll-item crit-success pop-in">
                      {diceResult.extraRoll}
                    </div>
                  )}
                </div>
                <div className="dice-total-display">
                  <span className="dice-total-label">Total:</span>
                  <span className="dice-total-value">{diceResult.total}</span>
                </div>
                <div className="dice-result-detail">
                  {diceResult.base && (
                    <>
                      <span>Base: {diceResult.base}</span>
                      {diceResult.extraRoll && (
                        <span style={{ color: '#2ea043' }}>Extra: +{diceResult.extraRoll}</span>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
