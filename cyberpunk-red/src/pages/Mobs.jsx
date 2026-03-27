import { useState, useEffect, useCallback, useRef } from 'react'
import { useCharacter } from '../context/CharacterContext'
import { rollDice } from '../utils/dice'
import '../css/mobs.css'

const SKILL_PRESETS = [
  { name: "Athletics", stat: "DEX" },
  { name: "Brawling", stat: "DEX" },
  { name: "Evasion", stat: "DEX" },
  { name: "Stealth", stat: "DEX" },
  { name: "Handgun", stat: "REF" },
  { name: "Rifle", stat: "REF" },
  { name: "Shotgun", stat: "REF" },
  { name: "SMG", stat: "REF" },
  { name: "Melee Weapon", stat: "DEX" },
  { name: "Martial Arts", stat: "DEX" },
  { name: "Driving", stat: "REF" },
  { name: "Pilot", stat: "REF" },
  { name: "Perception", stat: "INT" },
  { name: "Concentration", stat: "WILL" },
  { name: "Persuasion", stat: "COOL" },
  { name: "Intimidation", stat: "COOL" },
  { name: "Streetwise", stat: "COOL" },
  { name: "First Aid", stat: "TECH" },
  { name: "Electronics", stat: "TECH" },
  { name: "Demolitions", stat: "TECH" },
  { name: "Endurance", stat: "WILL" },
  { name: "Resist Torture", stat: "WILL" },
  { name: "Trading", stat: "COOL" },
  { name: "Gambling", stat: "INT" },
  { name: "Leadership", stat: "COOL" },
  { name: "Tactics", stat: "INT" }
]

export default function Mobs() {
  const { characterData, saveCharacterData, currentCharacterId } = useCharacter()
  const [mobs, setMobs] = useState([])
  const [selectedMobId, setSelectedMobId] = useState(null)
  const [diceResult, setDiceResult] = useState(null)
  
  const mobsRef = useRef(mobs)
  const saveTimeoutRef = useRef(null)

  // Update ref when state changes
  useEffect(() => {
    mobsRef.current = mobs
  }, [mobs])

  // Load saved mobs
  useEffect(() => {
    if (characterData.mobsData) {
      const saved = JSON.parse(characterData.mobsData)
      if (Array.isArray(saved) && saved.length > 0) {
        setMobs(saved)
      }
    }
  }, [characterData])

  // Auto-save with debounce
  useEffect(() => {
    if (!currentCharacterId) return
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveCharacterData({
        ...characterData,
        mobsData: JSON.stringify(mobsRef.current)
      })
    }, 500)
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [mobs, currentCharacterId])

  const addMob = useCallback(() => {
    const mob = {
      id: Date.now(),
      name: 'New Mob',
      stats: {
        int: 0, ref: 0, dex: 0, tech: 0, cool: 0,
        will: 0, luck: 0, move: 0, body: 0, emp: 0
      },
      hitPoints: { current: 0, max: 0 },
      seriouslyWounded: false,
      deathSave: 0,
      initiative: 0,
      weapons: [{ name: '', dmg: '', mag: '', rof: '', notes: '', attackSlots: [] }],
      handWeapons: [{ name: '', dmg: '', rof: '', notes: '', attackSlots: [] }],
      armor: {
        head: { sp: '', notes: '', penalty: '' },
        body: { sp: '', notes: '', penalty: '' }
      },
      skills: [],
      skillBases: '',
      cyberware: ''
    }
    setMobs(prev => [...prev, mob])
    setSelectedMobId(mob.id)
  }, [])

  const deleteMob = useCallback((id) => {
    setMobs(prev => prev.filter(m => m.id !== id))
    if (selectedMobId === id) setSelectedMobId(null)
  }, [selectedMobId])

  const selectMob = useCallback((id) => {
    setSelectedMobId(id)
  }, [])

  const updateMob = useCallback((id, field, value) => {
    setMobs(prev => prev.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ))
  }, [])

  const updateMobStat = useCallback((id, stat, value) => {
    setMobs(prev => prev.map(m => 
      m.id === id ? { ...m, stats: { ...m.stats, [stat]: parseInt(value) || 0 } } : m
    ))
  }, [])

  const addWeapon = useCallback((mobId, type = 'weapon') => {
    setMobs(prev => prev.map(m => {
      if (m.id !== mobId) return m
      const weaponsKey = type === 'weapon' ? 'weapons' : 'handWeapons'
      return {
        ...m,
        [weaponsKey]: [...m[weaponsKey], { name: '', dmg: '', mag: '', rof: '', notes: '', attackSlots: [] }]
      }
    }))
  }, [])

  const updateWeapon = useCallback((mobId, type, index, field, value) => {
    setMobs(prev => prev.map(m => {
      if (m.id !== mobId) return m
      const weaponsKey = type === 'weapon' ? 'weapons' : 'handWeapons'
      const newWeapons = [...m[weaponsKey]]
      newWeapons[index] = { ...newWeapons[index], [field]: value }
      return { ...m, [weaponsKey]: newWeapons }
    }))
  }, [])

  const deleteWeapon = useCallback((mobId, type, index) => {
    setMobs(prev => prev.map(m => {
      if (m.id !== mobId) return m
      const weaponsKey = type === 'weapon' ? 'weapons' : 'handWeapons'
      if (m[weaponsKey].length > 1) {
        const newWeapons = [...m[weaponsKey]]
        newWeapons.splice(index, 1)
        return { ...m, [weaponsKey]: newWeapons }
      }
      return m
    }))
  }, [])

  const addAttackSlot = useCallback((mobId, type, weaponIndex) => {
    setMobs(prev => prev.map(m => {
      if (m.id !== mobId) return m
      const weaponsKey = type === 'weapon' ? 'weapons' : 'handWeapons'
      const newWeapons = m[weaponsKey].map((w, idx) => {
        if (idx !== weaponIndex) return w
        const existingSlots = w.attackSlots || []
        return {
          ...w,
          attackSlots: [...existingSlots, { formula: '', notes: '' }]
        }
      })
      return { ...m, [weaponsKey]: newWeapons }
    }))
  }, [])

  const removeAttackSlot = useCallback((mobId, type, weaponIndex, slotIndex) => {
    if (slotIndex === 0) return
    setMobs(prev => prev.map(m => {
      if (m.id !== mobId) return m
      const weaponsKey = type === 'weapon' ? 'weapons' : 'handWeapons'
      const newWeapons = [...m[weaponsKey]]
      newWeapons[weaponIndex].attackSlots.splice(slotIndex, 1)
      return { ...m, [weaponsKey]: newWeapons }
    }))
  }, [])

  const updateAttackSlot = useCallback((mobId, type, weaponIndex, slotIndex, field, value) => {
    setMobs(prev => prev.map(m => {
      if (m.id !== mobId) return m
      const weaponsKey = type === 'weapon' ? 'weapons' : 'handWeapons'
      const newWeapons = [...m[weaponsKey]]
      if (!newWeapons[weaponIndex].attackSlots[slotIndex]) {
        newWeapons[weaponIndex].attackSlots[slotIndex] = { formula: '', notes: '' }
      }
      newWeapons[weaponIndex].attackSlots[slotIndex][field] = value
      return { ...m, [weaponsKey]: newWeapons }
    }))
  }, [])

  const addSkill = useCallback((mobId) => {
    setMobs(prev => prev.map(m => 
      m.id !== mobId ? m : { ...m, skills: [...m.skills, { name: '', stat: 'INT', lvl: 0 }] }
    ))
  }, [])

  const updateSkill = useCallback((mobId, index, field, value) => {
    setMobs(prev => prev.map(m => {
      if (m.id !== mobId) return m
      const newSkills = [...m.skills]
      newSkills[index] = { ...newSkills[index], [field]: value }
      return { ...m, skills: newSkills }
    }))
  }, [])

  const deleteSkill = useCallback((mobId, index) => {
    setMobs(prev => prev.map(m => {
      if (m.id !== mobId) return m
      const newSkills = [...m.skills]
      newSkills.splice(index, 1)
      return { ...m, skills: newSkills }
    }))
  }, [])

  const rollMobInitiative = useCallback((mobId) => {
    const mob = mobs.find(m => m.id === mobId)
    if (!mob) return
    
    const refValue = mob.stats.ref
    const roll = Math.floor(Math.random() * 10) + 1
    const total = roll + refValue
    
    updateMob(mobId, 'initiative', total)
    setDiceResult({ roll, stat: refValue, total, skillName: mob.name || 'Mob' })
  }, [mobs, updateMob])

  const rollMobSkill = useCallback((mob, skillIndex) => {
    const skill = mob.skills[skillIndex]
    if (!skill) return

    const statValue = mob.stats[skill.stat.toLowerCase()] || 0
    const baseValue = statValue + (skill.lvl || 0)
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
      skillName: skill.name,
      isCritSuccess: roll === 10,
      isCritFail: roll === 1
    })
  }, [])

  const selectedMob = mobs.find(m => m.id === selectedMobId)

  return (
    <div className="mobs-page">
      <div className="mobs-container">
        {/* Left Panel - Mobs List */}
        <div className="mobs-sidebar">
          <div className="mobs-header">
            <span>MOBS</span>
            <button className="add-mob-btn" onClick={addMob}>+</button>
          </div>
          <div className="mobs-list">
            {mobs.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#8b949e', fontSize: '10px' }}>
                No mobs yet. Click + to create one.
              </div>
            ) : (
              mobs.map(mob => (
                <div 
                  key={mob.id} 
                  className={`mob-item ${selectedMobId === mob.id ? 'selected' : ''}`}
                >
                  <div 
                    className="mob-item-info"
                    onClick={() => selectMob(mob.id)}
                  >
                    <div className="mob-item-name">{mob.name || 'Untitled'}</div>
                    <div className="mob-item-initiative">
                      <span>INI:</span>
                      <input 
                        type="number" 
                        className="mob-init-input" 
                        value={mob.initiative || 0}
                        onClick={e => e.stopPropagation()}
                        onChange={(e) => updateMob(mob.id, 'initiative', parseInt(e.target.value) || 0)}
                      />
                      <button 
                        className="mob-roll-init-btn" 
                        onClick={(e) => {
                          e.stopPropagation()
                          rollMobInitiative(mob.id)
                        }}
                      >
                        🎲
                      </button>
                    </div>
                  </div>
                  <button 
                    className="mob-item-delete" 
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteMob(mob.id)
                    }}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Mob Editor */}
        <div className="mob-content-panel">
          <div className="mob-editor">
            {!selectedMobId ? (
              <div className="editor-placeholder">
                <p>Select a mob or create a new one</p>
              </div>
            ) : selectedMob ? (
              <div className="mob-editor-content">
                <input 
                  type="text" 
                  className="mob-name-input" 
                  value={selectedMob.name}
                  placeholder="Mob name..."
                  onChange={(e) => updateMob(selectedMob.id, 'name', e.target.value)}
                />

                {/* STATS */}
                <div className="mob-stats-block">
                  <div className="stats-label">STATS</div>
                  <div className="stats-grid">
                    {Object.entries(selectedMob.stats).map(([stat, value]) => (
                      <div key={stat} className="stat-field">
                        <label>{stat.toUpperCase()}</label>
                        <input 
                          type="number" 
                          value={value}
                          onChange={(e) => updateMobStat(selectedMob.id, stat, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* HEALTH */}
                <div className="mob-health-row">
                  <div className="health-field">
                    <label>HIT_points</label>
                    <input 
                      type="number" 
                      value={selectedMob.hitPoints.current}
                      onChange={(e) => updateMob(selectedMob.id, 'hitPoints', { 
                        ...selectedMob.hitPoints, 
                        current: parseInt(e.target.value) || 0 
                      })}
                    />
                  </div>
                  <div className="health-field">
                    <label>SERIOUSLY_wounded</label>
                    <input 
                      type="checkbox" 
                      checked={selectedMob.seriouslyWounded}
                      onChange={(e) => updateMob(selectedMob.id, 'seriouslyWounded', e.target.checked)}
                    />
                  </div>
                  <div className="health-field">
                    <label>DEATH_save</label>
                    <input 
                      type="number" 
                      value={selectedMob.deathSave}
                      onChange={(e) => updateMob(selectedMob.id, 'deathSave', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                {/* WEAPONS */}
                <div className="mob-combat-section">
                  <div className="weapons-section">
                    <div className="section-header">
                      <span>WEAPONS</span>
                      <button className="add-weapon-btn" onClick={() => addWeapon(selectedMob.id, 'weapon')}>+</button>
                    </div>
                    {selectedMob.weapons.map((weapon, i) => (
                      <div key={i}>
                        <div className="weapon-row">
                          <input 
                            type="text" 
                            className="weapon-name" 
                            placeholder="Weapon"
                            value={weapon.name}
                            onChange={(e) => updateWeapon(selectedMob.id, 'weapon', i, 'name', e.target.value)}
                          />
                          <input 
                            type="text" 
                            className="weapon-dmg" 
                            placeholder="DMG"
                            value={weapon.dmg}
                            onChange={(e) => updateWeapon(selectedMob.id, 'weapon', i, 'dmg', e.target.value)}
                          />
                          <input 
                            type="text" 
                            className="weapon-mag" 
                            placeholder="MAG"
                            value={weapon.mag}
                            onChange={(e) => updateWeapon(selectedMob.id, 'weapon', i, 'mag', e.target.value)}
                          />
                          <input 
                            type="text" 
                            className="weapon-rof" 
                            placeholder="ROF"
                            value={weapon.rof}
                            onChange={(e) => updateWeapon(selectedMob.id, 'weapon', i, 'rof', e.target.value)}
                          />
                          <button 
                            className="delete-weapon-btn" 
                            onClick={() => deleteWeapon(selectedMob.id, 'weapon', i)}
                          >
                            ×
                          </button>
                        </div>
                        <div className="weapon-notes-row">
                          <input 
                            type="text" 
                            className="weapon-notes" 
                            placeholder="NOTES"
                            value={weapon.notes}
                            onChange={(e) => updateWeapon(selectedMob.id, 'weapon', i, 'notes', e.target.value)}
                          />
                          <div className="mob-weapon-dice-container">
                            <div className="attack-slots">
                              {(weapon.attackSlots || []).map((slot, j) => (
                                <div key={j} className="attack-slot">
                                  <input 
                                    type="text" 
                                    className="mob-weapon-dice-formula" 
                                    placeholder="3d6 + 2d10 + 5"
                                    value={slot.formula}
                                    onChange={(e) => updateAttackSlot(selectedMob.id, 'weapon', i, j, 'formula', e.target.value)}
                                  />
                                  <button 
                                    className="mob-weapon-roll-btn"
                                    onClick={() => {
                                      const formula = slot.formula
                                      const match = formula.match(/(\d+)[dD](\d+)/)
                                      if (match) {
                                        const count = parseInt(match[1])
                                        const sides = parseInt(match[2])
                                        const { rolls, total } = rollDice(sides, count)
                                        setDiceResult({ rolls, total, count, sides, skillName: `${weapon.name || 'Weapon'} damage` })
                                      }
                                    }}
                                  >
                                    🎲
                                  </button>
                                  {j > 0 && (
                                    <button 
                                      className="remove-attack-btn"
                                      onClick={() => removeAttackSlot(selectedMob.id, 'weapon', i, j)}
                                    >
                                      −
                                    </button>
                                  )}
                                  <input 
                                    type="text" 
                                    className="mob-attack-notes" 
                                    placeholder="Attack notes"
                                    value={slot.notes}
                                    onChange={(e) => updateAttackSlot(selectedMob.id, 'weapon', i, j, 'notes', e.target.value)}
                                  />
                                </div>
                              ))}
                            </div>
                            <button
                              type="button"
                              className="add-attack-btn"
                              onClick={(e) => {
                                e.stopPropagation()
                                addAttackSlot(selectedMob.id, 'weapon', i)
                              }}
                            >
                              + Attack
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ARMOR */}
                  <div className="armor-section">
                    <div className="section-header">ARMOR</div>
                    <div className="armor-row">
                      <div className="armor-label">HEAD</div>
                      <input 
                        type="text" 
                        className="armor-sp" 
                        placeholder="SP"
                        value={selectedMob.armor.head.sp}
                        onChange={(e) => updateMob(selectedMob.id, 'armor', {
                          ...selectedMob.armor,
                          head: { ...selectedMob.armor.head, sp: e.target.value }
                        })}
                      />
                      <input 
                        type="text" 
                        className="armor-notes" 
                        placeholder="NOTES"
                        value={selectedMob.armor.head.notes}
                        onChange={(e) => updateMob(selectedMob.id, 'armor', {
                          ...selectedMob.armor,
                          head: { ...selectedMob.armor.head, notes: e.target.value }
                        })}
                      />
                      <input 
                        type="text" 
                        className="armor-penalty" 
                        placeholder="PENALTY"
                        value={selectedMob.armor.head.penalty}
                        onChange={(e) => updateMob(selectedMob.id, 'armor', {
                          ...selectedMob.armor,
                          head: { ...selectedMob.armor.head, penalty: e.target.value }
                        })}
                      />
                    </div>
                    <div className="armor-row">
                      <div className="armor-label">BODY</div>
                      <input 
                        type="text" 
                        className="armor-sp" 
                        placeholder="SP"
                        value={selectedMob.armor.body.sp}
                        onChange={(e) => updateMob(selectedMob.id, 'armor', {
                          ...selectedMob.armor,
                          body: { ...selectedMob.armor.body, sp: e.target.value }
                        })}
                      />
                      <input 
                        type="text" 
                        className="armor-notes" 
                        placeholder="NOTES"
                        value={selectedMob.armor.body.notes}
                        onChange={(e) => updateMob(selectedMob.id, 'armor', {
                          ...selectedMob.armor,
                          body: { ...selectedMob.armor.body, notes: e.target.value }
                        })}
                      />
                      <input 
                        type="text" 
                        className="armor-penalty" 
                        placeholder="PENALTY"
                        value={selectedMob.armor.body.penalty}
                        onChange={(e) => updateMob(selectedMob.id, 'armor', {
                          ...selectedMob.armor,
                          body: { ...selectedMob.armor.body, penalty: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                </div>

                {/* SKILLS */}
                <div className="mob-skills-section">
                  <div className="section-header">
                    <span>SKILLS</span>
                    <button className="add-mob-skill-btn" onClick={() => addSkill(selectedMob.id)}>+ Add Skill</button>
                  </div>
                  <div className="mob-skills-list">
                    {selectedMob.skills.map((skill, i) => (
                      <div key={i} className="mob-skill-row">
                        <select 
                          className="mob-skill-select"
                          value={skill.name}
                          onChange={(e) => {
                            const preset = SKILL_PRESETS.find(p => p.name === e.target.value)
                            if (preset) {
                              updateSkill(selectedMob.id, i, 'name', preset.name)
                              updateSkill(selectedMob.id, i, 'stat', preset.stat)
                            } else {
                              updateSkill(selectedMob.id, i, 'name', e.target.value)
                            }
                          }}
                        >
                          <option value="">-- Custom --</option>
                          {SKILL_PRESETS.map(preset => (
                            <option key={preset.name} value={preset.name}>
                              {preset.name} ({preset.stat})
                            </option>
                          ))}
                        </select>
                        <select 
                          className="mob-skill-stat"
                          value={skill.stat}
                          onChange={(e) => updateSkill(selectedMob.id, i, 'stat', e.target.value)}
                        >
                          {['INT', 'REF', 'DEX', 'TECH', 'COOL', 'WILL', 'LUCK', 'MOVE', 'BODY', 'EMP'].map(stat => (
                            <option key={stat} value={stat}>{stat}</option>
                          ))}
                        </select>
                        <input 
                          type="number" 
                          className="mob-skill-lvl" 
                          placeholder="LVL"
                          value={skill.lvl}
                          min="0"
                          max="10"
                          onChange={(e) => updateSkill(selectedMob.id, i, 'lvl', parseInt(e.target.value) || 0)}
                        />
                        <button 
                          className="mob-skill-roll-btn"
                          onClick={() => rollMobSkill(selectedMob, i)}
                        >
                          🎲
                        </button>
                        <button 
                          className="delete-mob-skill-btn"
                          onClick={() => deleteSkill(selectedMob.id, i)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CYBERWARE */}
                <div className="mob-cyberware">
                  <label>Cyberware/Special_equipment</label>
                  <textarea 
                    className="cyberware-input" 
                    placeholder="Cyberware..."
                    value={selectedMob.cyberware}
                    onChange={(e) => updateMob(selectedMob.id, 'cyberware', e.target.value)}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Dice Result Display */}
      {diceResult && (
        <div className="dice-result-toast">
          <div className="dice-result-header">
            <span>{diceResult.skillName || 'Roll'}</span>
            <button onClick={() => setDiceResult(null)}>×</button>
          </div>
          <div className="dice-result-body">
            {diceResult.rolls ? (
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
                  Roll: {diceResult.count}d{diceResult.sides}
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
                  {diceResult.extraRoll !== null && (
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
                  <span>Base: {diceResult.base}</span>
                  {diceResult.extraRoll !== null && (
                    <span style={{ color: '#2ea043' }}>Extra: +{diceResult.extraRoll}</span>
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
