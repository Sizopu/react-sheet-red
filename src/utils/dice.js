// Dice rolling utilities

export function rollDice(sides, count = 1) {
  const rolls = []
  let total = 0
  
  for (let i = 0; i < count; i++) {
    const roll = Math.floor(Math.random() * sides) + 1
    rolls.push(roll)
    total += roll
  }
  
  return { rolls, total }
}

export function rollSkill(baseValue, skillName = 'Skill') {
  const d10 = Math.floor(Math.random() * 10) + 1
  const total = baseValue + d10
  
  return {
    roll: d10,
    base: baseValue,
    total,
    skillName,
    isCritSuccess: d10 === 10,
    isCritFail: d10 === 1
  }
}

export function rollInitiative(statValue) {
  const d10 = Math.floor(Math.random() * 10) + 1
  const total = d10 + statValue
  
  return {
    roll: d10,
    stat: statValue,
    total
  }
}

export function parseDiceFormula(formula) {
  // Parse formulas like "3d6 + 2d10 + 5"
  const diceRegex = /(\d+)[dD](\d+)/g
  const bonusRegex = /\+\s*(\d+)/g
  
  let match
  let total = 0
  const details = []
  
  // Parse dice
  while ((match = diceRegex.exec(formula)) !== null) {
    const count = parseInt(match[1])
    const sides = parseInt(match[2])
    const rolls = []
    let sum = 0
    
    for (let i = 0; i < count; i++) {
      const roll = Math.floor(Math.random() * sides) + 1
      rolls.push(roll)
      sum += roll
    }
    
    total += sum
    details.push({
      type: `d${sides}`,
      count,
      rolls,
      sum
    })
  }
  
  // Parse bonus
  let bonus = 0
  while ((match = bonusRegex.exec(formula)) !== null) {
    bonus += parseInt(match[1])
  }
  
  total += bonus
  
  return {
    total,
    bonus,
    details
  }
}

export function formatDiceResult(result) {
  return result.rolls.map((roll, i) => ({
    value: roll,
    isCritSuccess: roll === (result.sides || 10),
    isCritFail: roll === 1
  }))
}
