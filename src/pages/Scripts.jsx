import React, { useState, useEffect } from 'react'
import { useCharacter } from '../context/CharacterContext'
import { useLanguage } from '../context/LanguageContext'
import { translations } from '../i18n/translations'
import { rollDice } from '../utils/dice'
import '../css/scripts.css'

const INTERFACE_ABILITIES = [
  'backdoor', 'cloak', 'control', 'eyedee',
  'pathfinder', 'scanner', 'slide', 'virus', 'zap'
]

export default function Scripts() {
  const { currentCharacterId } = useCharacter()
  const { language } = useLanguage()
  
  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key
  }

  // Инициализация состояний
  const [cyberdeckData, setCyberdeckData] = useState({
    model: '',
    icon: '',
    netActions: 0,
    black: 0,
    cost: 0
  })
  const [interfaceAbilities, setInterfaceAbilities] = useState([])
  const [notes, setNotes] = useState('')
  const [programsData, setProgramsData] = useState({
    poor: [{ id: 0 }],
    standard: [{ id: 0 }],
    excellent: [{ id: 0 }],
    cyberarm: [{ id: 0 }]
  })
  const [hardwareData, setHardwareData] = useState([{ id: 0, name: '', effect: '', cost: 0 }])
  const [diceResult, setDiceResult] = useState(null)
  const [helpOpen, setHelpOpen] = useState(false)

  // Загрузка данных при выборе персонажа
  useEffect(() => {
    if (!currentCharacterId) return
    
    const key = `character_${currentCharacterId}_characterData`
    const charDataStr = localStorage.getItem(key)
    if (!charDataStr) {
      console.log('Scripts: No data in localStorage')
      return
    }
    
    try {
      const charData = JSON.parse(charDataStr)
      console.log('Scripts: Loaded charData:', charData)
      if (charData.cyberdeckData) {
        const data = typeof charData.cyberdeckData === 'string' 
          ? JSON.parse(charData.cyberdeckData) 
          : charData.cyberdeckData
        console.log('Scripts: Parsed cyberdeckData:', data)
        if (data.cyberdeckInfo) {
          console.log('Scripts: Setting cyberdeckInfo:', data.cyberdeckInfo)
          setCyberdeckData(data.cyberdeckInfo)
        }
        if (data.interfaceAbilities) {
          console.log('Scripts: Setting interfaceAbilities:', data.interfaceAbilities)
          setInterfaceAbilities(data.interfaceAbilities)
        }
        if (data.cyberdeckNotes !== undefined) {
          console.log('Scripts: Setting notes:', data.cyberdeckNotes)
          setNotes(data.cyberdeckNotes)
        }
        if (data.programsData) {
          console.log('Scripts: Setting programsData:', data.programsData)
          setProgramsData(data.programsData)
        }
        if (data.hardwareData) {
          console.log('Scripts: Setting hardwareData:', data.hardwareData)
          setHardwareData(data.hardwareData)
        }
      }
    } catch (e) {
      console.error('Scripts: Error loading cyberdeck:', e)
    }
  }, [currentCharacterId])

  // Сохранение всех данных вместе
  useEffect(() => {
    if (!currentCharacterId) {
      console.log('Scripts: No currentCharacterId')
      return
    }
    
    const timeout = setTimeout(() => {
      const key = `character_${currentCharacterId}_characterData`
      const charDataStr = localStorage.getItem(key)
      let charData = {}
      if (charDataStr) {
        try { charData = JSON.parse(charDataStr) } catch (e) {
          console.error('Scripts: Error parsing charData:', e)
        }
      }
      
      const cyberdeckDataObj = {
        cyberdeckInfo: cyberdeckData,
        interfaceAbilities,
        cyberdeckNotes: notes,
        programsData,
        hardwareData
      }
      
      console.log('Scripts: Saving...', {
        key,
        cyberdeckInfo: cyberdeckData,
        hasInterfaceAbilities: interfaceAbilities.length > 0,
        hasNotes: notes.length > 0,
        programsData,
        hardwareData
      })
      
      localStorage.setItem(key, JSON.stringify({
        ...charData,
        cyberdeckData: JSON.stringify(cyberdeckDataObj)
      }))
      
      // Проверка
      const check = localStorage.getItem(key)
      console.log('Scripts: Saved, verification:', check ? 'OK' : 'FAILED')
    }, 500)
    
    return () => clearTimeout(timeout)
  }, [cyberdeckData, interfaceAbilities, notes, programsData, hardwareData, currentCharacterId])

  // Проверка что персонаж выбран
  if (!currentCharacterId) {
    return (
      <div className="cyberdeck-page">
        <div style={{ padding: '20px', textAlign: 'center', color: '#8b949e' }}>
          Please select a character first (go to Characters page and click "Load to Character Sheet")
        </div>
      </div>
    )
  }

  const updateCyberdeckField = (field, value) => {
    setCyberdeckData(prev => ({ ...prev, [field]: value }))
  }

  const toggleAbility = (ability) => {
    setInterfaceAbilities(prev =>
      prev.includes(ability)
        ? prev.filter(a => a !== ability)
        : [...prev, ability]
    )
  }

  const addProgramRow = (section) => {
    setProgramsData(prev => ({
      ...prev,
      [section]: [...prev[section], { id: Date.now() }]
    }))
  }

  const deleteProgramRow = (section, index) => {
    setProgramsData(prev => {
      const sectionData = prev[section]
      if (sectionData.length <= 1) {
        return { ...prev, [section]: sectionData.map(() => ({})) }
      }
      return {
        ...prev,
        [section]: sectionData.filter((_, i) => i !== index)
      }
    })
  }

  const updateProgram = (section, index, field, value) => {
    setProgramsData(prev => ({
      ...prev,
      [section]: prev[section].map((prog, i) =>
        i === index ? { ...prog, [field]: value } : prog
      )
    }))
  }

  const updateProgramSlots = (section, index, slotType, value) => {
    setProgramsData(prev => ({
      ...prev,
      [section]: prev[section].map((prog, i) =>
        i === index ? { ...prog, slots: { ...prog.slots, [slotType]: value } } : prog
      )
    }))
  }

  const addHardwareRow = () => {
    setHardwareData(prev => [...prev, { id: Date.now(), name: '', effect: '', cost: 0 }])
  }

  const deleteHardwareRow = (index) => {
    setHardwareData(prev => {
      if (prev.length <= 1) {
        return prev.map(() => ({ id: Date.now(), name: '', effect: '', cost: 0 }))
      }
      return prev.filter((_, i) => i !== index)
    })
  }

  const updateHardware = (index, field, value) => {
    setHardwareData(prev => prev.map((hw, i) =>
      i === index ? { ...hw, [field]: value } : hw
    ))
  }

  const rollProgramDice = (section, index, type, formula) => {
    const diceMatch = formula.match(/(\d+)[dD](\d+)\s*(?:\+\s*(\d+))?/)
    if (!diceMatch) {
      alert('Invalid formula. Use format: NdM + K (e.g., 2d6 + 3)')
      return
    }

    const count = parseInt(diceMatch[1])
    const sides = parseInt(diceMatch[2])
    const bonus = parseInt(diceMatch[3] || '0')

    const { rolls, total } = rollDice(sides, count)
    const finalTotal = total + bonus

    setDiceResult({
      rolls,
      total: finalTotal,
      bonus,
      count,
      sides,
      skillName: `${type.toUpperCase()} Roll`
    })
  }

  return (
    <div className="cyberdeck-page">
      {/* Top Info Block */}
      <div className="cyberdeck-top-blocks">
        {/* Left Top - Cyberdeck Info */}
        <div className="cyberdeck-info-block">
          <div className="cyberdeck-info-row">
            <div className="cyberdeck-info-label">{t('Model')}</div>
            <input
              type="text"
              className="cyberdeck-info-input"
              value={cyberdeckData.model}
              onChange={(e) => updateCyberdeckField('model', e.target.value)}
            />
          </div>
          <div className="cyberdeck-info-row">
            <div className="cyberdeck-info-label">{t('Icon')}</div>
            <input
              type="text"
              className="cyberdeck-info-input"
              value={cyberdeckData.icon}
              onChange={(e) => updateCyberdeckField('icon', e.target.value)}
            />
          </div>
          <div className="cyberdeck-info-row">
            <div className="cyberdeck-info-label">{t('NET Actions')}</div>
            <input
              type="number"
              className="cyberdeck-net-actions"
              value={cyberdeckData.netActions}
              min="0"
              max="10"
              onChange={(e) => updateCyberdeckField('netActions', parseInt(e.target.value) || 0)}
            />
            <div className="cyberdeck-info-label">{t('Black')}</div>
            <input
              type="number"
              className="cyberdeck-black"
              value={cyberdeckData.black}
              min="0"
              max="10"
              onChange={(e) => updateCyberdeckField('black', parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="cyberdeck-info-row">
            <div className="cyberdeck-info-label">{t('Cyberdeck Cost')}</div>
            <input
              type="number"
              className="cyberdeck-info-input"
              value={cyberdeckData.cost}
              onChange={(e) => updateCyberdeckField('cost', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        {/* Right Top - Tests & Abilities */}
        <div className="cyberdeck-tests-block">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <button className="cyberdeck-help-btn" onClick={() => setHelpOpen(true)}>📖 {t('Help')}</button>
          </div>
          <div className="cyberdeck-test-row">
            <div className="cyberdeck-test-label">{t('Test')} = {t('Interface')} + 1d10 {t('vs. DV')}</div>
          </div>
          <div className="cyberdeck-test-row">
            <div className="cyberdeck-combat-label">
              <strong>{t('Net Combat')}</strong> = {t('Interface')} + {t('Program')}/{t('Black ICE')} ATK + 1d10 {t('vs.')}<br />
              {t("Target's Interface")} or {t('Program')}/{t('Black ICE')} DEF + 1d10
            </div>
          </div>
          <div className="cyberdeck-abilities-block">
            <div className="cyberdeck-abilities-title">{t('Interface Abilities')}</div>
            <div className="cyberdeck-abilities-grid">
              {INTERFACE_ABILITIES.map(ability => (
                <label key={ability} className="ability-label">
                  <input
                    type="checkbox"
                    checked={interfaceAbilities.includes(ability)}
                    onChange={() => toggleAbility(ability)}
                  />
                  {ability.charAt(0).toUpperCase() + ability.slice(1)}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="cyberdeck-main-content">
        {/* Left Panel - Programs Table */}
        <div className="programs-panel">
          <div className="programs-table-wrapper">
            <table className="programs-table">
              <thead>
                <tr>
                  <th className="col-section">{t('Section')}</th>
                  <th className="col-name">{t('Name')}</th>
                  <th className="col-class">{t('Class')}</th>
                  <th className="col-stat">PER</th>
                  <th className="col-stat">SPD</th>
                  <th className="col-attack">ATK</th>
                  <th className="col-defense">DEF</th>
                  <th className="col-stat">REZ</th>
                  <th className="col-effect">{t('Effect')}</th>
                  <th className="col-cost">{t('Cost')}</th>
                  <th className="col-action"></th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(programsData).map(([section, programs]) => (
                  programs.map((program, index) => (
                    <React.Fragment key={`${section}-${index}`}>
                      <tr className="section-main-row">
                        {index === 0 && (
                          <td
                            className="section-label-cell"
                            rowSpan={programs.length * 2}
                          >
                            {section.charAt(0).toUpperCase() + section.slice(1)}
                          </td>
                        )}
                        <td>
                          <input
                            type="text"
                            className="program-name"
                            value={program.name || ''}
                            onChange={(e) => updateProgram(section, index, 'name', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="program-class"
                            value={program.class || ''}
                            onChange={(e) => updateProgram(section, index, 'class', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="program-stat"
                            value={program.per || ''}
                            onChange={(e) => updateProgram(section, index, 'per', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="program-stat"
                            value={program.spd || ''}
                            onChange={(e) => updateProgram(section, index, 'spd', e.target.value)}
                          />
                        </td>
                        <td>
                          <div className="program-dice-wrapper">
                            <input
                              type="text"
                              className="program-atk-formula"
                              placeholder="ATK formula (e.g., 2d6+3)"
                              value={program.atkFormula || ''}
                              onChange={(e) => updateProgram(section, index, 'atkFormula', e.target.value)}
                            />
                            <button
                              className="program-roll-btn"
                              onClick={() => rollProgramDice(section, index, 'atk', program.atkFormula || '')}
                            >
                              🎲
                            </button>
                          </div>
                        </td>
                        <td>
                          <div className="program-dice-wrapper">
                            <input
                              type="text"
                              className="program-def-formula"
                              placeholder="DEF formula (e.g., 1d10+2)"
                              value={program.defFormula || ''}
                              onChange={(e) => updateProgram(section, index, 'defFormula', e.target.value)}
                            />
                            <button
                              className="program-roll-btn"
                              onClick={() => rollProgramDice(section, index, 'def', program.defFormula || '')}
                            >
                              🎲
                            </button>
                          </div>
                        </td>
                        <td>
                          <input
                            type="number"
                            className="program-stat"
                            value={program.rez || ''}
                            onChange={(e) => updateProgram(section, index, 'rez', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="program-effect"
                            value={program.effect || ''}
                            onChange={(e) => updateProgram(section, index, 'effect', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="program-cost"
                            value={program.cost || ''}
                            onChange={(e) => updateProgram(section, index, 'cost', e.target.value)}
                          />
                        </td>
                        <td>
                          <button
                            className="delete-row-btn"
                            onClick={() => deleteProgramRow(section, index)}
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                      <tr className="section-sub-row">
                        <td colSpan="10" className="sub-row-content">
                          <div className="sub-row-labels">
                            <span>Slots</span>
                            <span>Program Slots</span>
                            <span>Hardware Slots</span>
                          </div>
                          <div className="sub-row-inputs">
                            <input
                              type="number"
                              className="program-slots-input"
                              placeholder="0"
                              value={program.slots?.slots || ''}
                              onChange={(e) => updateProgramSlots(section, index, 'slots', e.target.value)}
                            />
                            <input
                              type="number"
                              className="program-slots-input"
                              placeholder="0"
                              value={program.slots?.program || ''}
                              onChange={(e) => updateProgramSlots(section, index, 'program', e.target.value)}
                            />
                            <input
                              type="number"
                              className="program-slots-input"
                              placeholder="0"
                              value={program.slots?.hardware || ''}
                              onChange={(e) => updateProgramSlots(section, index, 'hardware', e.target.value)}
                            />
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  ))
                ))}
              </tbody>
            </table>
          </div>
          <div className="programs-footer">
            <button className="add-section-btn" onClick={() => addProgramRow('poor')}>+ {t('Add Poor Program')}</button>
            <button className="add-section-btn" onClick={() => addProgramRow('standard')}>+ {t('Add Standard Program')}</button>
            <button className="add-section-btn" onClick={() => addProgramRow('excellent')}>+ {t('Add Excellent Program')}</button>
            <button className="add-section-btn" onClick={() => addProgramRow('cyberarm')}>+ {t('Add Cyberarm Program')}</button>
          </div>
        </div>

        {/* Right Panel - Hardware & Notes */}
        <div className="right-panel">
          {/* Hardware Table */}
          <div className="hardware-block">
            <div className="hardware-table-wrapper">
              <table className="hardware-table">
                <thead>
                  <tr>
                    <th className="hardware-name-col">{t('Hardware')}</th>
                    <th className="hardware-effect-col">{t('Effect')}</th>
                    <th className="hardware-cost-col">{t('Cost')}</th>
                    <th className="hardware-action-col"></th>
                  </tr>
                </thead>
                <tbody>
                  {hardwareData.map((hw, index) => (
                    <tr key={hw.id || index} className="hardware-row">
                      <td>
                        <input
                          type="text"
                          className="hardware-name"
                          value={hw.name || ''}
                          onChange={(e) => updateHardware(index, 'name', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="hardware-effect"
                          value={hw.effect || ''}
                          onChange={(e) => updateHardware(index, 'effect', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="hardware-cost"
                          value={hw.cost || ''}
                          onChange={(e) => updateHardware(index, 'cost', parseInt(e.target.value) || 0)}
                        />
                      </td>
                      <td>
                        <button
                          className="delete-hardware-btn"
                          onClick={() => deleteHardwareRow(index)}
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr className="hardware-add-row">
                    <td colSpan="4">
                      <button className="add-hardware-btn" onClick={addHardwareRow}>+ {t('Add Hardware')}</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          <div className="notes-block">
            <div className="notes-header">{t('Notes')}</div>
            <textarea
              className="notes-textarea"
              placeholder=""
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Help Dialog */}
      {helpOpen && (
        <div className="help-dialog-overlay" onClick={() => setHelpOpen(false)}>
          <div className="help-dialog" onClick={e => e.stopPropagation()}>
            <div className="help-dialog-header">
              <span>Cyberdeck Help</span>
              <button className="help-dialog-close" onClick={() => setHelpOpen(false)}>×</button>
            </div>
            <div className="help-dialog-content">
              <h3>Cyberdeck Reference</h3>
              <h4>Basic Info</h4>
              <ul>
                <li><strong>Model:</strong> Name of your cyberdeck</li>
                <li><strong>Icon:</strong> Visual representation in the Net</li>
                <li><strong>NET Actions:</strong> Actions per turn</li>
                <li><strong>Black:</strong> Black ICE resistance</li>
                <li><strong>Cost:</strong> Price in eurodollars</li>
              </ul>

              <h4>Net Combat</h4>
              <p>Test = Interface + 1d10 vs. DV</p>
              <p>Net Combat = Interface + Program/Black ICE ATK + 1d10 vs. Target's Interface or Program/Black ICE DEF + 1d10</p>

              <h4>Program Stats</h4>
              <ul>
                <li><strong>PER:</strong> Program hit points</li>
                <li><strong>SPD:</strong> Speed in initiative</li>
                <li><strong>ATK:</strong> Attack formula (e.g., 2d6+3)</li>
                <li><strong>DEF:</strong> Defense formula (e.g., 1d10+2)</li>
                <li><strong>REZ:</strong> Program hit points</li>
              </ul>

              <h4>Slots</h4>
              <ul>
                <li><strong>Slots:</strong> Total slots available</li>
                <li><strong>Program Slots:</strong> For software</li>
                <li><strong>Hardware Slots:</strong> For hardware modules</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Dice Result Display */}
      {diceResult && (
        <div className="dice-result-toast">
          <div className="dice-result-header">
            <span>{diceResult.skillName}</span>
            <button onClick={() => setDiceResult(null)}>×</button>
          </div>
          <div className="dice-result-body">
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
          </div>
        </div>
      )}
    </div>
  )
}
