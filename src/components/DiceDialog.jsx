import { useState } from 'react'
import { rollDice } from '../utils/dice'

export default function DiceDialog({ open, onClose }) {
  const [diceType, setDiceType] = useState(10)
  const [diceCount, setDiceCount] = useState(1)
  const [result, setResult] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [isRolling, setIsRolling] = useState(false)

  const handleRoll = () => {
    setIsRolling(true)
    setShowResult(false)
    
    // Анимация броска
    setTimeout(() => {
      const { rolls, total } = rollDice(diceType, diceCount)
      setResult({ rolls, total, diceType, diceCount })
      setIsRolling(false)
      setShowResult(true)
    }, 600)
  }

  const handleClose = () => {
    setResult(null)
    setShowResult(false)
    setIsRolling(false)
    onClose()
  }

  const handleDiceTypeChange = (type) => {
    setDiceType(type)
    setShowResult(false)
    setResult(null)
    setIsRolling(false)
  }

  const handleCountChange = (delta) => {
    setDiceCount(prev => Math.max(1, Math.min(10, prev + delta)))
    setShowResult(false)
    setResult(null)
    setIsRolling(false)
  }

  if (!open) return null

  return (
    <div className="dialog-overlay" onClick={handleClose}>
      <div className="dialog" onClick={e => e.stopPropagation()}>
        <div className="dialog-header">
          <span>Dice Roll</span>
          <button className="dialog-close" onClick={handleClose}>×</button>
        </div>

        <div className="dialog-content">
          {!showResult ? (
            <div className="dice-options">
              <div className="dice-option-group">
                <label>Dice Type</label>
                <div className="dice-type-buttons">
                  {[4, 6, 8, 10, 12, 20].map(type => (
                    <button
                      key={type}
                      className={`dice-type-btn ${diceType === type ? 'active' : ''}`}
                      onClick={() => handleDiceTypeChange(type)}
                    >
                      d{type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="dice-option-group">
                <label>Number of Dice</label>
                <div className="dice-count-control">
                  <button
                    className="dice-count-btn"
                    onClick={() => handleCountChange(-1)}
                    disabled={diceCount <= 1}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    id="dice-count"
                    value={diceCount}
                    min="1"
                    max="10"
                    onChange={(e) => setDiceCount(parseInt(e.target.value) || 1)}
                  />
                  <button
                    className="dice-count-btn"
                    onClick={() => handleCountChange(1)}
                    disabled={diceCount >= 10}
                  >
                    +
                  </button>
                </div>
              </div>

              <button 
                className={`dialog-btn dialog-btn-primary dice-roll-btn ${isRolling ? 'rolling' : ''}`} 
                onClick={handleRoll}
                disabled={isRolling}
              >
                {isRolling ? 'Rolling...' : 'Roll'}
              </button>
            </div>
          ) : (
            <div className="dice-result-section">
              <div className="dice-rolls">
                {result.rolls.map((roll, i) => (
                  <div
                    key={i}
                    className={`dice-roll-item pop-in ${
                      roll === diceType ? 'crit-success' : roll === 1 ? 'crit-fail' : ''
                    }`}
                  >
                    {roll}
                  </div>
                ))}
              </div>

              <div className="dice-total-display">
                <span className="dice-total-label">Total:</span>
                <span className="dice-total-value">{result.total}</span>
              </div>

              <p className="dice-description">
                Roll: {result.diceCount}d{result.diceType}
              </p>
            </div>
          )}
        </div>

        <div className="dialog-footer">
          {showResult && (
            <button className="dialog-btn" onClick={() => setShowResult(false)}>
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
