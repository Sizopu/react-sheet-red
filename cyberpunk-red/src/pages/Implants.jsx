import { useState, useEffect, useCallback, useRef } from 'react'
import { useCharacter } from '../context/CharacterContext'
import '../css/implants.css'

const IMPLANT_TYPES = {
  fashionware: {
    name: 'Fashionware',
    color: '#e91e63',
    description: 'Импланты для личного украшения',
    defaultZones: ['hair', 'skin']
  },
  neuralware: {
    name: 'Neuralware',
    color: '#9c27b0',
    description: 'Импланты для улучшения умственных способностей',
    defaultZones: ['brain', 'neck']
  },
  cyberoptics: {
    name: 'Cyberoptics',
    color: '#2196f3',
    description: 'Импланты для улучшения визуальных способностей',
    defaultZones: ['eyes']
  },
  cyberaudio: {
    name: 'Cyberaudio',
    color: '#00bcd4',
    description: 'Импланты для улучшения слуха',
    defaultZones: ['ears']
  },
  internal: {
    name: 'Internal',
    color: '#4caf50',
    description: 'Внутренние импланты (органы)',
    defaultZones: ['ribs', 'heart']
  },
  external: {
    name: 'External',
    color: '#ff9800',
    description: 'Внешние импланты (кожа)',
    defaultZones: ['right-shoulder', 'left-shoulder', 'chest']
  },
  limb: {
    name: 'Cyberlimb',
    color: '#795548',
    description: 'Кибернетические конечности',
    defaultZones: ['right-arm', 'left-arm', 'right-leg', 'left-leg']
  },
  borgware: {
    name: 'Borgware',
    color: '#607d8b',
    description: 'Полная замена тела кибернетикой',
    defaultZones: ['borg-head', 'borg-torso']
  }
}

const ZONE_POSITIONS = {
  'hair': { top: '4%', left: '50%' },
  'skin': { top: '25%', left: '55%' },
  'brain': { top: '7%', left: '50%' },
  'neck': { top: '14%', left: '50%' },
  'eyes': { top: '10%', left: '50%' },
  'ears': { top: '12%', left: '50%' },
  'ribs': { top: '28%', left: '50%' },
  'heart': { top: '24%', left: '50%' },
  'right-shoulder': { top: '19%', left: '30%' },
  'left-shoulder': { top: '19%', left: '70%' },
  'chest': { top: '22%', left: '50%' },
  'right-arm': { top: '30%', left: '22%' },
  'left-arm': { top: '30%', left: '78%' },
  'right-leg': { top: '56%', left: '44%' },
  'left-leg': { top: '56%', left: '56%' },
  'borg-head': { top: '5%', left: '50%' },
  'borg-torso': { top: '32%', left: '50%' }
}

const ZONE_LABELS = {
  'hair': 'Hair', 'skin': 'Skin',
  'brain': 'Brain', 'neck': 'Neck',
  'eyes': 'Eyes', 'ears': 'Ears',
  'ribs': 'Ribs', 'heart': 'Heart',
  'right-shoulder': 'R.Shoulder', 'left-shoulder': 'L.Shoulder',
  'chest': 'Chest',
  'right-arm': 'R.Arm', 'left-arm': 'L.Arm',
  'right-leg': 'R.Leg', 'left-leg': 'L.Leg',
  'borg-head': 'Head', 'borg-torso': 'Torso'
}

export default function Implants() {
  const { characterData, updateCharacterField, saveCharacterData, currentCharacterId } = useCharacter()
  
  const [implants, setImplants] = useState([])
  const [selectedImplantId, setSelectedImplantId] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  
  const [lifepathData, setLifepathData] = useState({
    aliases: '',
    impCurrent: 0,
    impMax: 0,
    repValue: 0,
    repEvents: '',
    culturalOrigins: '',
    personality: '',
    clothingStyles: '',
    hairstyle: '',
    valueMost: '',
    feelingsPeople: '',
    valuedPerson: '',
    valuedPossession: '',
    familyBackground: '',
    childhoodEnvironment: '',
    familyCrisis: '',
    lifeGoals: '',
    fashion: '',
    friends: '',
    tragicLove: '',
    enemies: ['', '', '', ''],
    housing: '',
    rent: '',
    lifestyle: '',
    moneyTotal: 0,
    roleLifepath: ''
  })
  
  const [inventory, setInventory] = useState([{ gear: '', cost: 0, weight: 0, notes: '', cash: 0 }])
  
  // Refs for debouncing
  const implantsRef = useRef(implants)
  const lifepathDataRef = useRef(lifepathData)
  const inventoryRef = useRef(inventory)
  const saveTimeoutRef = useRef(null)

  // Update refs when state changes
  useEffect(() => {
    implantsRef.current = implants
  }, [implants])
  
  useEffect(() => {
    lifepathDataRef.current = lifepathData
  }, [lifepathData])
  
  useEffect(() => {
    inventoryRef.current = inventory
  }, [inventory])

  // Load saved data
  useEffect(() => {
    if (characterData.cyberdeckData) {
      const data = JSON.parse(characterData.cyberdeckData)
      if (data.implants) setImplants(data.implants)
      if (data.lifepathData) setLifepathData({ ...lifepathData, ...data.lifepathData })
      if (data.inventoryData) setInventory(data.inventoryData)
    } else {
      // Load from old keys for backwards compatibility
      if (characterData.cyberwareImplants) {
        setImplants(JSON.parse(characterData.cyberwareImplants))
      }
      if (characterData.lifepathData) {
        setLifepathData(JSON.parse(characterData.lifepathData))
      }
      if (characterData.inventoryData) {
        setInventory(JSON.parse(characterData.inventoryData))
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
        cyberwareImplants: JSON.stringify(implantsRef.current),
        lifepathData: JSON.stringify(lifepathDataRef.current),
        inventoryData: JSON.stringify(inventoryRef.current)
      })
    }, 500)
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [implants, lifepathData, inventory])

  const addImplant = useCallback((type, preferredZone = null) => {
    const typeInfo = IMPLANT_TYPES[type]
    const zone = preferredZone || typeInfo.defaultZones[0]
    
    const implant = {
      id: Date.now(),
      type,
      name: '',
      zone,
      humanityLoss: 0,
      description: '',
      effects: ['', '', ''],
      cost: 0,
      rarity: 'common'
    }
    
    setImplants(prev => [...prev, implant])
    setSelectedImplantId(implant.id)
    setDropdownOpen(false)
  }, [])

  const deleteImplant = useCallback((id) => {
    setImplants(prev => prev.filter(i => i.id !== id))
    if (selectedImplantId === id) setSelectedImplantId(null)
  }, [selectedImplantId])

  const updateImplant = useCallback((id, field, value) => {
    setImplants(prev => prev.map(i => 
      i.id === id ? { ...i, [field]: value } : i
    ))
  }, [])

  const updateLifepathField = useCallback((field, value) => {
    setLifepathData(prev => ({ ...prev, [field]: value }))
  }, [])

  const addInventoryRow = useCallback(() => {
    setInventory(prev => [...prev, { gear: '', cost: 0, weight: 0, notes: '', cash: 0 }])
  }, [])

  const updateInventoryRow = useCallback((index, field, value) => {
    setInventory(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ))
  }, [])

  const removeInventoryRow = useCallback((index) => {
    if (inventory.length > 1) {
      setInventory(prev => prev.filter((_, i) => i !== index))
    }
  }, [inventory.length])

  const calculateHumanityTotal = () => {
    return implants.reduce((sum, i) => sum + (parseInt(i.humanityLoss) || 0), 0)
  }

  const calculateTotalWeight = () => {
    return inventory.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0)
  }

  const calculateTotalCash = () => {
    return inventory.reduce((sum, item) => sum + (parseFloat(item.cash) || 0), 0)
  }

  return (
    <div className="cyberware-page">
      <div className="cyberware-container">
        {/* Left Panel - Lifepath & Inventory */}
        <div className="left-panel">
          {/* ALIASES Block */}
          <div className="cyber-block aliases-block">
            <div className="cyber-block-header">ALIASES</div>
            <div className="cyber-block-content">
              <input 
                type="text" 
                className="aliases-input" 
                placeholder="Enter aliases..."
                value={lifepathData.aliases}
                onChange={(e) => updateLifepathField('aliases', e.target.value)}
              />
            </div>
          </div>

          {/* IMPROVEMENT POINTS & REPUTATION */}
          <div className="imp-row">
            <div className="imp-block">
              <div className="cyber-block-header">IMPROVEMENT POINTS</div>
              <div className="imp-content">
                <div className="imp-inputs">
                  <div className="imp-input-field">
                    <label>Current</label>
                    <input 
                      type="number" 
                      id="imp-current" 
                      value={lifepathData.impCurrent} 
                      min="0"
                      onChange={(e) => updateLifepathField('impCurrent', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="imp-input-field">
                    <label>Max</label>
                    <input 
                      type="number" 
                      id="imp-max" 
                      value={lifepathData.impMax} 
                      min="0"
                      onChange={(e) => updateLifepathField('impMax', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="rep-block">
              <div className="cyber-block-header">REPUTATION</div>
              <div className="rep-content">
                <div className="rep-input-field">
                  <label>REP</label>
                  <input 
                    type="number" 
                    id="rep-value" 
                    value={lifepathData.repValue} 
                    min="0"
                    onChange={(e) => updateLifepathField('repValue', parseInt(e.target.value) || 0)}
                  />
                </div>
                <textarea 
                  id="rep-events" 
                  placeholder="Reputation events..."
                  value={lifepathData.repEvents}
                  onChange={(e) => updateLifepathField('repEvents', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* LIFEPATH Block */}
          <div className="cyber-block lifepath-block">
            <div className="cyber-block-header lifepath-header">LIFEPATH</div>
            <div className="lifepath-content">
              <div className="lifepath-row">
                <div className="lifepath-field">
                  <label>CULTURAL ORIGINS</label>
                  <input 
                    type="text" 
                    id="cultural-origins"
                    value={lifepathData.culturalOrigins}
                    onChange={(e) => updateLifepathField('culturalOrigins', e.target.value)}
                  />
                </div>
                <div className="lifepath-field">
                  <label>PERSONALITY</label>
                  <input 
                    type="text" 
                    id="personality"
                    value={lifepathData.personality}
                    onChange={(e) => updateLifepathField('personality', e.target.value)}
                  />
                </div>
              </div>
              <div className="lifepath-row">
                <div className="lifepath-field">
                  <label>CLOTHING STYLES</label>
                  <input 
                    type="text" 
                    id="clothing-styles"
                    value={lifepathData.clothingStyles}
                    onChange={(e) => updateLifepathField('clothingStyles', e.target.value)}
                  />
                </div>
                <div className="lifepath-field">
                  <label>HAIRSTYLE</label>
                  <input 
                    type="text" 
                    id="hairstyle"
                    value={lifepathData.hairstyle}
                    onChange={(e) => updateLifepathField('hairstyle', e.target.value)}
                  />
                </div>
              </div>
              <div className="lifepath-row">
                <div className="lifepath-field">
                  <label>VALUE MOST</label>
                  <input 
                    type="text" 
                    id="value-most"
                    value={lifepathData.valueMost}
                    onChange={(e) => updateLifepathField('valueMost', e.target.value)}
                  />
                </div>
                <div className="lifepath-field">
                  <label>FEELINGS ABOUT PEOPLE</label>
                  <input 
                    type="text" 
                    id="feelings-people"
                    value={lifepathData.feelingsPeople}
                    onChange={(e) => updateLifepathField('feelingsPeople', e.target.value)}
                  />
                </div>
              </div>
              <div className="lifepath-row">
                <div className="lifepath-field">
                  <label>VALUED PERSON</label>
                  <input 
                    type="text" 
                    id="valued-person"
                    value={lifepathData.valuedPerson}
                    onChange={(e) => updateLifepathField('valuedPerson', e.target.value)}
                  />
                </div>
                <div className="lifepath-field">
                  <label>VALUED POSSESSION</label>
                  <input 
                    type="text" 
                    id="valued-possession"
                    value={lifepathData.valuedPossession}
                    onChange={(e) => updateLifepathField('valuedPossession', e.target.value)}
                  />
                </div>
              </div>
              <div className="lifepath-row">
                <div className="lifepath-field">
                  <label>FAMILY BACKGROUND</label>
                  <input 
                    type="text" 
                    id="family-background"
                    value={lifepathData.familyBackground}
                    onChange={(e) => updateLifepathField('familyBackground', e.target.value)}
                  />
                </div>
                <div className="lifepath-field">
                  <label>CHILDHOOD ENVIRONMENT</label>
                  <input 
                    type="text" 
                    id="childhood-environment"
                    value={lifepathData.childhoodEnvironment}
                    onChange={(e) => updateLifepathField('childhoodEnvironment', e.target.value)}
                  />
                </div>
              </div>
              <div className="lifepath-row">
                <div className="lifepath-field">
                  <label>FAMILY CRISIS</label>
                  <input 
                    type="text" 
                    id="family-crisis"
                    value={lifepathData.familyCrisis}
                    onChange={(e) => updateLifepathField('familyCrisis', e.target.value)}
                  />
                </div>
                <div className="lifepath-field">
                  <label>LIFE GOALS</label>
                  <input 
                    type="text" 
                    id="life-goals"
                    value={lifepathData.lifeGoals}
                    onChange={(e) => updateLifepathField('lifeGoals', e.target.value)}
                  />
                </div>
              </div>
              <div className="lifepath-row full-width">
                <div className="lifepath-field">
                  <label>FASHION</label>
                  <input 
                    type="text" 
                    id="fashion"
                    value={lifepathData.fashion}
                    onChange={(e) => updateLifepathField('fashion', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* INVENTORY Block */}
          <div className="cyber-block inventory-block">
            <div className="cyber-block-header inventory-header">INVENTORY</div>
            <div className="inventory-content">
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th className="gear-col">GEAR</th>
                    <th className="cost-col">COST</th>
                    <th className="weight-col">WEIGHT</th>
                    <th className="notes-col">NOTES</th>
                    <th className="cash-col">Cash €$</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody id="inventory-body">
                  {inventory.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <input 
                          type="text" 
                          className="inventory-gear" 
                          value={item.gear}
                          onChange={(e) => updateInventoryRow(index, 'gear', e.target.value)}
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          className="inventory-cost" 
                          value={item.cost}
                          onChange={(e) => updateInventoryRow(index, 'cost', parseInt(e.target.value) || 0)}
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          className="inventory-weight" 
                          value={item.weight}
                          onChange={(e) => updateInventoryRow(index, 'weight', parseFloat(e.target.value) || 0)}
                        />
                      </td>
                      <td>
                        <input 
                          type="text" 
                          className="inventory-notes" 
                          value={item.notes}
                          onChange={(e) => updateInventoryRow(index, 'notes', e.target.value)}
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          className="inventory-cash" 
                          value={item.cash}
                          onChange={(e) => updateInventoryRow(index, 'cash', parseFloat(e.target.value) || 0)}
                        />
                      </td>
                      <td>
                        <button 
                          className="delete-inv-btn" 
                          onClick={() => removeInventoryRow(index)}
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="inventory-footer">
                <div className="inventory-totals">
                  <div className="total-item">
                    <label>TOTAL WEIGHT</label>
                    <span id="total-weight-value">{calculateTotalWeight()}</span>
                  </div>
                  <div className="total-item">
                    <label>TOTAL CASH</label>
                    <span id="total-cash-value">{calculateTotalCash()}</span>
                  </div>
                </div>
              </div>
              <button className="add-row-btn" onClick={addInventoryRow}>+</button>
            </div>
          </div>
        </div>

        {/* Middle Panel - Lifepath Details */}
        <div className="middle-panel">
          {/* LIFEPATH Top */}
          <div className="cyber-block lifepath-top-block">
            <div className="cyber-block-header lifepath-header">LIFEPATH</div>
            <div className="lifepath-top-content">
              <div className="lifepath-sub-row">
                <div className="lifepath-sub-field">
                  <label>Friends</label>
                  <textarea 
                    id="friends"
                    value={lifepathData.friends}
                    onChange={(e) => updateLifepathField('friends', e.target.value)}
                  />
                </div>
                <div className="lifepath-sub-field">
                  <label>Tragic love affairs</label>
                  <textarea 
                    id="tragic-love"
                    value={lifepathData.tragicLove}
                    onChange={(e) => updateLifepathField('tragicLove', e.target.value)}
                  />
                </div>
              </div>
              <div className="lifepath-sub-row">
                <div className="lifepath-sub-field enemies-field">
                  <label>Enemies</label>
                  <div className="enemies-grid">
                    {['Who?', 'What caused it?', 'What can they throw at you?', "What's gonna happen?"].map((placeholder, i) => (
                      <input 
                        key={i}
                        type="text" 
                        placeholder={placeholder}
                        value={lifepathData.enemies[i] || ''}
                        onChange={(e) => {
                          const newEnemies = [...lifepathData.enemies]
                          newEnemies[i] = e.target.value
                          updateLifepathField('enemies', newEnemies)
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ROLE SPECIFIC LIFEPATH */}
          <div className="cyber-block role-lifepath-block">
            <div className="cyber-block-header lifepath-header">ROLE SPECIFIC LIFEPATH</div>
            <div className="role-lifepath-content">
              <textarea 
                id="role-lifepath-text"
                placeholder="Role specific lifepath..."
                value={lifepathData.roleLifepath}
                onChange={(e) => updateLifepathField('roleLifepath', e.target.value)}
              />
            </div>
          </div>

          {/* Housing */}
          <div className="housing-block">
            <div className="cyber-block-header lifepath-header">HOUSING</div>
            <div className="housing-content">
              <div className="housing-row">
                <div className="lifepath-field">
                  <label>Housing</label>
                  <input 
                    type="text" 
                    id="housing"
                    value={lifepathData.housing}
                    onChange={(e) => updateLifepathField('housing', e.target.value)}
                  />
                </div>
                <div className="lifepath-field">
                  <label>Rent</label>
                  <input 
                    type="text" 
                    id="rent"
                    value={lifepathData.rent}
                    onChange={(e) => updateLifepathField('rent', e.target.value)}
                  />
                </div>
                <div className="lifepath-field">
                  <label>Lifestyle</label>
                  <input 
                    type="text" 
                    id="lifestyle"
                    value={lifepathData.lifestyle}
                    onChange={(e) => updateLifepathField('lifestyle', e.target.value)}
                  />
                </div>
              </div>
              <div className="money-display">
                <label>Total Money</label>
                <input 
                  type="number" 
                  className="money-input" 
                  id="money-total" 
                  placeholder="€$ 0"
                  value={lifepathData.moneyTotal}
                  onChange={(e) => updateLifepathField('moneyTotal', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Cyberware */}
        <div className="right-panel">
          <div className="cyberware-panel">
            <div className="cyber-block cyberware-header-block">
              <div className="cyber-block-header cyberware-main-header">CYBERWARE</div>
            </div>

            {/* Controls */}
            <div className="cyberware-controls">
              <div className="add-implant-wrapper">
                <button
                  className="add-implant-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <span>+</span> ADD CYBERWARE
                </button>
                {dropdownOpen && (
                  <div className="implant-type-dropdown active">
                    {Object.entries(IMPLANT_TYPES).map(([type, info]) => (
                      <button
                        key={type}
                        onClick={() => {
                          addImplant(type)
                          setDropdownOpen(false)
                        }}
                        style={{ borderLeftColor: info.color }}
                      >
                        {info.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Humanity Loss */}
            <div className="humanity-loss-top">
              <label>Humanity Loss</label>
              <div className="humanity-value" id="humanity-total">
                {calculateHumanityTotal()}
              </div>
            </div>

            {/* Skeleton with markers */}
            <div className="skeleton-wrapper">
              <div className="skeleton-placeholder">
                <img src="/images/screenshot.png" alt="Skeleton" className="skeleton-image" />
                <div className="skeleton-label">BODY SCHEMA</div>
                <div className="skeleton-zones">
                  {Object.entries(ZONE_POSITIONS).map(([zone, pos]) => {
                    const typeKey = Object.keys(IMPLANT_TYPES).find(key =>
                      IMPLANT_TYPES[key].defaultZones?.includes(zone)
                    ) || 'external'
                    const typeInfo = IMPLANT_TYPES[typeKey]
                    
                    return (
                      <div 
                        key={zone}
                        className="body-marker-zone"
                        style={{ 
                          top: pos.top, 
                          left: pos.left,
                          background: typeInfo.color
                        }}
                        onClick={() => addImplant(typeKey, zone)}
                        title={ZONE_LABELS[zone]}
                      />
                    )
                  })}
                </div>
              </div>

              {/* Implant markers */}
              <div className="implant-markers">
                {implants.map(implant => {
                  const position = ZONE_POSITIONS[implant.zone]
                  if (!position) return null
                  
                  const typeInfo = IMPLANT_TYPES[implant.type]
                  
                  return (
                    <div 
                      key={implant.id}
                      className={`implant-marker ${selectedImplantId === implant.id ? 'selected' : ''}`}
                      style={{ 
                        top: position.top, 
                        left: position.left,
                        background: typeInfo.color,
                        boxShadow: `0 0 10px ${typeInfo.color}`
                      }}
                      onClick={() => setSelectedImplantId(implant.id)}
                      title={implant.name || 'Implant'}
                    />
                  )
                })}
              </div>
            </div>

            {/* Implant Cards */}
            <div className="implant-cards-container">
              {Object.entries(IMPLANT_TYPES).map(([type, info]) => {
                const typeImplants = implants.filter(i => i.type === type)
                if (typeImplants.length === 0) return null
                
                return (
                  <div key={type}>
                    <div 
                      className="implant-type-header"
                      style={{ borderColor: info.color }}
                    >
                      <span className="type-name">{info.name}</span>
                      <span className="type-count">{typeImplants.length}</span>
                    </div>
                    
                    {typeImplants.map(implant => (
                      <div 
                        key={implant.id}
                        className={`implant-card ${selectedImplantId === implant.id ? 'selected' : ''}`}
                        style={{ borderLeftColor: info.color }}
                        onClick={() => setSelectedImplantId(implant.id)}
                      >
                        <div className="implant-card-header">
                          <input 
                            type="text" 
                            className="implant-card-name" 
                            placeholder="IMPLANT NAME..."
                            value={implant.name}
                            onClick={e => e.stopPropagation()}
                            onChange={(e) => updateImplant(implant.id, 'name', e.target.value)}
                          />
                          <button 
                            className="implant-card-delete" 
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteImplant(implant.id)
                            }}
                          >
                            ×
                          </button>
                        </div>
                        <div className="implant-card-body" onClick={e => e.stopPropagation()}>
                          <div className="implant-card-row">
                            <label>Location</label>
                            <select 
                              className="implant-card-zone"
                              value={implant.zone}
                              onChange={(e) => updateImplant(implant.id, 'zone', e.target.value)}
                            >
                              {Object.entries(ZONE_LABELS).map(([zone, label]) => (
                                <option key={zone} value={zone}>{label}</option>
                              ))}
                            </select>
                          </div>
                          <div className="implant-card-row">
                            <label>Humanity Loss</label>
                            <input 
                              type="number" 
                              className="implant-card-humanity" 
                              value={implant.humanityLoss}
                              min="0"
                              onChange={(e) => updateImplant(implant.id, 'humanityLoss', parseInt(e.target.value) || 0)}
                            />
                          </div>
                          <div className="implant-card-row">
                            <label>Cost</label>
                            <input 
                              type="number" 
                              className="implant-card-cost" 
                              value={implant.cost}
                              min="0"
                              onChange={(e) => updateImplant(implant.id, 'cost', parseInt(e.target.value) || 0)}
                            />
                          </div>
                          <div className="implant-card-row">
                            <label>Rarity</label>
                            <select 
                              className="implant-card-rarity"
                              value={implant.rarity}
                              onChange={(e) => updateImplant(implant.id, 'rarity', e.target.value)}
                            >
                              <option value="common">Common</option>
                              <option value="uncommon">Uncommon</option>
                              <option value="rare">Rare</option>
                              <option value="very-rare">Very Rare</option>
                            </select>
                          </div>
                          <div className="implant-card-row full">
                            <label>Description</label>
                            <textarea 
                              className="implant-card-description" 
                              placeholder="Description..."
                              value={implant.description}
                              onChange={(e) => updateImplant(implant.id, 'description', e.target.value)}
                            />
                          </div>
                          <div className="implant-card-row full">
                            <label>Effects</label>
                            <div className="effects-grid">
                              {implant.effects.map((effect, i) => (
                                <input 
                                  key={i}
                                  type="text" 
                                  className="implant-card-effect" 
                                  placeholder={`Effect ${i + 1}`}
                                  value={effect}
                                  onChange={(e) => {
                                    const newEffects = [...implant.effects]
                                    newEffects[i] = e.target.value
                                    updateImplant(implant.id, 'effects', newEffects)
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
