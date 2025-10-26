/**
 * UFC Fight Prediction Algorithm
 * Analyzes fighter stats to predict fight outcomes
 */

// Helper function to parse percentage strings
const parsePercentage = (str) => {
  if (!str) return 0;
  const num = parseFloat(str.replace('%', ''));
  return isNaN(num) ? 0 : num;
};

// Helper function to parse numeric strings
const parseNumber = (str) => {
  if (!str) return 0;
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
};

// Helper function to calculate age from date of birth
const calculateAge = (dob) => {
  if (!dob) return null;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Calculate age/prime factor
const calculateAgeFactor = (fighter) => {
  const age = calculateAge(fighter.dob);
  if (!age) return 1.0; // Neutral if age unknown
  
  // Prime years: 28-32 get a boost
  if (age >= 28 && age <= 32) {
    return 1.08; // 8% boost
  }
  // Young fighters: 23-27
  else if (age >= 23 && age <= 27) {
    return 1.03; // 3% boost
  }
  // Declining years: 35+
  else if (age >= 35 && age <= 37) {
    return 0.95; // 5% penalty
  }
  else if (age > 37) {
    return 0.90; // 10% penalty
  }
  return 1.0; // Neutral for 33-34
};

// Calculate finish rate
const calculateFinishRate = (fighter) => {
  const wins = fighter.wins || 0;
  if (wins === 0) return 0;
  
  // Estimate finishes based on submission and striking capabilities
  // This is an approximation - ideally we'd have actual finish data
  const subAvg = parseNumber(fighter.submission_avg);
  const slpm = parseNumber(fighter.sig_strikes_landed_per_min);
  const strikeAcc = parsePercentage(fighter.striking_accuracy);
  
  // Higher values indicate more finishing ability
  const finishPotential = (subAvg * 10) + (slpm * strikeAcc / 100);
  return Math.min(finishPotential / 10, 1) * 100; // Convert to percentage
};

// Detect weight class
const detectWeightClass = (fighter) => {
  const weightStr = fighter.weight || '';
  const weight = parseNumber(weightStr);
  
  if (weight <= 125) return 'Flyweight';
  if (weight <= 135) return 'Bantamweight';
  if (weight <= 145) return 'Featherweight';
  if (weight <= 155) return 'Lightweight';
  if (weight <= 170) return 'Welterweight';
  if (weight <= 185) return 'Middleweight';
  if (weight <= 205) return 'Light Heavyweight';
  return 'Heavyweight';
};

// Get weight class adjustment factors
const getWeightClassAdjustments = (weightClass) => {
  const adjustments = {
    'Flyweight': { striking: 1.0, grappling: 1.15, submissions: 1.2 },
    'Bantamweight': { striking: 1.05, grappling: 1.15, submissions: 1.15 },
    'Featherweight': { striking: 1.1, grappling: 1.1, submissions: 1.1 },
    'Lightweight': { striking: 1.1, grappling: 1.05, submissions: 1.15 },
    'Welterweight': { striking: 1.1, grappling: 1.0, submissions: 1.0 },
    'Middleweight': { striking: 1.15, grappling: 0.95, submissions: 0.9 },
    'Light Heavyweight': { striking: 1.2, grappling: 0.9, submissions: 0.8 },
    'Heavyweight': { striking: 1.25, grappling: 0.85, submissions: 0.7 }
  };
  return adjustments[weightClass] || { striking: 1.0, grappling: 1.0, submissions: 1.0 };
};

// Calculate stance matchup advantage
const calculateStanceAdvantage = (fighter, opponent) => {
  const f1Stance = fighter.stance?.toLowerCase() || '';
  const f2Stance = opponent.stance?.toLowerCase() || '';
  
  // Southpaw vs Orthodox gives slight advantage to southpaw
  if (f1Stance.includes('southpaw') && f2Stance.includes('orthodox')) {
    return 3; // 3 point advantage
  }
  if (f1Stance.includes('orthodox') && f2Stance.includes('southpaw')) {
    return -2; // 2 point disadvantage
  }
  if (f1Stance.includes('switch')) {
    return 2; // Switch stance fighters have versatility advantage
  }
  return 0;
};

// Determine fighting style
const determineFightingStyle = (fighter) => {
  const striking = calculateStrikingScore(fighter);
  const grappling = calculateGrapplingScore(fighter);
  
  const ratio = striking / (grappling + 1); // Avoid division by zero
  
  if (ratio > 1.5) return 'Striker';
  if (ratio < 0.67) return 'Grappler';
  return 'Balanced';
};

// Calculate style matchup multiplier
const getStyleMatchupMultiplier = (fighter1Style, fighter2Style) => {
  // Striker vs Grappler matchups
  if (fighter1Style === 'Striker' && fighter2Style === 'Grappler') {
    return { fighter1: 0.95, fighter2: 1.05 }; // Grappler has slight edge
  }
  if (fighter1Style === 'Grappler' && fighter2Style === 'Striker') {
    return { fighter1: 1.05, fighter2: 0.95 }; // Grappler has slight edge
  }
  // Balanced fighters have slight advantage against specialists
  if (fighter1Style === 'Balanced' && fighter2Style !== 'Balanced') {
    return { fighter1: 1.03, fighter2: 0.97 };
  }
  if (fighter2Style === 'Balanced' && fighter1Style !== 'Balanced') {
    return { fighter1: 0.97, fighter2: 1.03 };
  }
  return { fighter1: 1.0, fighter2: 1.0 };
};

// Classify confidence tier
const getConfidenceTier = (probability) => {
  const prob = parseFloat(probability);
  if (prob >= 75) return { tier: 'Lock', color: '#dc2626', icon: '🔒' };
  if (prob >= 65) return { tier: 'Strong Favorite', color: '#ea580c', icon: '💪' };
  if (prob >= 55) return { tier: 'Slight Favorite', color: '#ca8a04', icon: '👍' };
  return { tier: 'Toss-up', color: '#6b7280', icon: '🤝' };
};

// Calculate fight length adjustment (cardio factor)
const getFightLengthAdjustment = (fighter, numRounds) => {
  const totalFights = (fighter.wins || 0) + (fighter.losses || 0) + (fighter.draws || 0);
  const experienceFactor = Math.min(totalFights / 20, 1);
  
  // 5-round fights favor experience and cardio
  if (numRounds === 5) {
    return 1.0 + (experienceFactor * 0.05);
  }
  return 1.0;
};

// Calculate striking score
const calculateStrikingScore = (fighter) => {
  const slpm = parseNumber(fighter.sig_strikes_landed_per_min);
  const strikeAcc = parsePercentage(fighter.striking_accuracy);
  const sapm = parseNumber(fighter.sig_strikes_absorbed_per_min);
  const strikeDef = parsePercentage(fighter.striking_defense);
  
  // Higher is better for slpm, strikeAcc, strikeDef
  // Lower is better for sapm (absorbed)
  const offensiveStriking = (slpm * 10) + (strikeAcc * 0.5);
  const defensiveStriking = (strikeDef * 0.5) + ((10 - sapm) * 10);
  
  return (offensiveStriking + defensiveStriking) / 2;
};

// Calculate grappling score
const calculateGrapplingScore = (fighter) => {
  const tdAvg = parseNumber(fighter.takedown_avg);
  const tdAcc = parsePercentage(fighter.takedown_accuracy);
  const tdDef = parsePercentage(fighter.takedown_defense);
  const subAvg = parseNumber(fighter.submission_avg);
  
  const offensiveGrappling = (tdAvg * 20) + (tdAcc * 0.3) + (subAvg * 30);
  const defensiveGrappling = tdDef * 0.5;
  
  return (offensiveGrappling + defensiveGrappling) / 2;
};

// Calculate experience and record score
const calculateRecordScore = (fighter) => {
  const wins = fighter.wins || 0;
  const losses = fighter.losses || 0;
  const draws = fighter.draws || 0;
  
  const totalFights = wins + losses + draws;
  if (totalFights === 0) return 0;
  
  const winRate = wins / totalFights;
  const experienceBonus = Math.min(totalFights / 30, 1) * 20; // Max 20 points for experience
  
  return (winRate * 80) + experienceBonus;
};

// Calculate physical advantage
const calculatePhysicalAdvantage = (fighter1, fighter2) => {
  let advantage = 0;
  
  // Reach advantage
  const reach1 = parseNumber(fighter1.reach);
  const reach2 = parseNumber(fighter2.reach);
  if (reach1 && reach2) {
    const reachDiff = reach1 - reach2;
    advantage += reachDiff * 0.5; // Each inch of reach = 0.5 points
  }
  
  // Height advantage
  const height1 = parseNumber(fighter1.height);
  const height2 = parseNumber(fighter2.height);
  if (height1 && height2) {
    const heightDiff = height1 - height2;
    advantage += heightDiff * 0.3; // Each inch of height = 0.3 points
  }
  
  return advantage;
};

// Main prediction function
export const predictFight = (fighter1, fighter2, numRounds = 5) => {
  if (!fighter1 || !fighter2) {
    return null;
  }
  
  // Get weight class and adjustments
  const weightClass = detectWeightClass(fighter1);
  const weightAdjustments = getWeightClassAdjustments(weightClass);
  
  // Calculate individual scores with weight class adjustments
  const fighter1Striking = calculateStrikingScore(fighter1) * weightAdjustments.striking;
  const fighter2Striking = calculateStrikingScore(fighter2) * weightAdjustments.striking;
  
  const fighter1Grappling = calculateGrapplingScore(fighter1) * weightAdjustments.grappling;
  const fighter2Grappling = calculateGrapplingScore(fighter2) * weightAdjustments.grappling;
  
  const fighter1Record = calculateRecordScore(fighter1);
  const fighter2Record = calculateRecordScore(fighter2);
  
  const fighter1Physical = calculatePhysicalAdvantage(fighter1, fighter2);
  const fighter2Physical = -fighter1Physical; // Inverse for fighter 2
  
  // Calculate stance advantages
  const fighter1StanceAdv = calculateStanceAdvantage(fighter1, fighter2);
  const fighter2StanceAdv = calculateStanceAdvantage(fighter2, fighter1);
  
  // Determine fighting styles
  const fighter1Style = determineFightingStyle(fighter1);
  const fighter2Style = determineFightingStyle(fighter2);
  const styleMultipliers = getStyleMatchupMultiplier(fighter1Style, fighter2Style);
  
  // Calculate age factors
  const fighter1AgeFactor = calculateAgeFactor(fighter1);
  const fighter2AgeFactor = calculateAgeFactor(fighter2);
  
  // Calculate finish rates
  const fighter1FinishRate = calculateFinishRate(fighter1);
  const fighter2FinishRate = calculateFinishRate(fighter2);
  
  // Calculate fight length adjustments
  const fighter1LengthAdj = getFightLengthAdjustment(fighter1, numRounds);
  const fighter2LengthAdj = getFightLengthAdjustment(fighter2, numRounds);
  
  // Weighted total scores with all factors
  let fighter1Total = 
    (fighter1Striking * 0.35) +
    (fighter1Grappling * 0.30) +
    (fighter1Record * 0.25) +
    (fighter1Physical * 0.10);
    
  let fighter2Total = 
    (fighter2Striking * 0.35) +
    (fighter2Grappling * 0.30) +
    (fighter2Record * 0.25) +
    (fighter2Physical * 0.10);
  
  // Apply stance advantages
  fighter1Total += fighter1StanceAdv;
  fighter2Total += fighter2StanceAdv;
  
  // Apply style matchup multipliers
  fighter1Total *= styleMultipliers.fighter1;
  fighter2Total *= styleMultipliers.fighter2;
  
  // Apply age factors
  fighter1Total *= fighter1AgeFactor;
  fighter2Total *= fighter2AgeFactor;
  
  // Apply fight length adjustments
  fighter1Total *= fighter1LengthAdj;
  fighter2Total *= fighter2LengthAdj;
  
  // Convert to win probabilities
  const totalScore = fighter1Total + fighter2Total;
  const fighter1WinProb = totalScore > 0 ? (fighter1Total / totalScore) * 100 : 50;
  const fighter2WinProb = 100 - fighter1WinProb;
  
  // Determine likely finish method based on stat advantages
  const determineLikelyFinish = (fighter) => {
    const striking = calculateStrikingScore(fighter);
    const grappling = calculateGrapplingScore(fighter);
    const subAvg = parseNumber(fighter.submission_avg);
    
    if (grappling > striking * 1.3 && subAvg > 0.5) {
      return 'Submission';
    } else if (grappling > striking * 1.2) {
      return 'Ground and Pound / TKO';
    } else if (striking > grappling * 1.3) {
      return 'KO/TKO';
    } else {
      return 'Decision';
    }
  };

  // Calculate finish likelihood by round
  const calculateRoundFinishProbability = (fighter, opponent, numRounds) => {
    const finishRate = calculateFinishRate(fighter);
    const opponentDefense = parseFloat(opponent.striking_defense?.replace('%', '') || 50);
    const opponentTDDef = parseFloat(opponent.takedown_defense?.replace('%', '') || 50);
    
    // Base finish probability per round
    const baseFinishProb = finishRate / 100 * 0.15; // 15% max per round if high finish rate
    const defenseFactor = (100 - Math.max(opponentDefense, opponentTDDef)) / 100;
    
    const roundProbabilities = [];
    let cumulativeFinish = 0;
    
    for (let round = 1; round <= numRounds; round++) {
      // Finish probability increases slightly in later rounds (fatigue)
      const roundMultiplier = 1 + (round - 1) * 0.15;
      const roundFinishProb = baseFinishProb * defenseFactor * roundMultiplier;
      
      // Don't exceed total probability
      const adjustedProb = Math.min(roundFinishProb, (1 - cumulativeFinish) * 0.25);
      roundProbabilities.push({
        round,
        probability: adjustedProb * 100
      });
      
      cumulativeFinish += adjustedProb;
    }
    
    return {
      roundProbabilities,
      totalFinishProbability: cumulativeFinish * 100,
      decisionProbability: (1 - cumulativeFinish) * 100
    };
  };
  
  const winner = fighter1WinProb > fighter2WinProb ? fighter1 : fighter2;
  const loser = winner === fighter1 ? fighter2 : fighter1;
  const winnerProb = Math.max(fighter1WinProb, fighter2WinProb);
  const confidenceTier = getConfidenceTier(winnerProb);
  
  // Calculate round finish probabilities for the likely winner
  const winnerFinishAnalysis = calculateRoundFinishProbability(winner, loser, numRounds);
  
  // Calculate key advantages
  const keyAdvantages = [];
  const strikingDiff = fighter1Striking - fighter2Striking;
  const grapplingDiff = fighter1Grappling - fighter2Grappling;
  
  if (Math.abs(strikingDiff) > 5) {
    const leader = strikingDiff > 0 ? fighter1.name : fighter2.name;
    const percent = Math.abs(strikingDiff / Math.max(fighter1Striking, fighter2Striking) * 100).toFixed(0);
    keyAdvantages.push({ type: 'Striking Edge', leader, value: `+${percent}%` });
  }
  
  if (Math.abs(grapplingDiff) > 5) {
    const leader = grapplingDiff > 0 ? fighter1.name : fighter2.name;
    const percent = Math.abs(grapplingDiff / Math.max(fighter1Grappling, fighter2Grappling) * 100).toFixed(0);
    keyAdvantages.push({ type: 'Grappling Advantage', leader, value: `+${percent}%` });
  }
  
  if (fighter1AgeFactor > fighter2AgeFactor && fighter1AgeFactor > 1.0) {
    keyAdvantages.push({ type: 'Prime Factor', leader: fighter1.name, value: 'In Prime' });
  } else if (fighter2AgeFactor > fighter1AgeFactor && fighter2AgeFactor > 1.0) {
    keyAdvantages.push({ type: 'Prime Factor', leader: fighter2.name, value: 'In Prime' });
  }
  
  const finishDiff = fighter1FinishRate - fighter2FinishRate;
  if (Math.abs(finishDiff) > 10) {
    const leader = finishDiff > 0 ? fighter1.name : fighter2.name;
    keyAdvantages.push({ type: 'Finish Rate', leader, value: 'Higher' });
  }
  
  return {
    fighter1: {
      name: fighter1.name,
      data: fighter1, // Include full fighter data
      winProbability: fighter1WinProb.toFixed(1),
      strikingScore: fighter1Striking.toFixed(1),
      grapplingScore: fighter1Grappling.toFixed(1),
      recordScore: fighter1Record.toFixed(1),
      physicalScore: fighter1Physical.toFixed(1),
      totalScore: fighter1Total.toFixed(1),
      age: calculateAge(fighter1.dob),
      ageFactor: fighter1AgeFactor,
      finishRate: fighter1FinishRate.toFixed(1),
      style: fighter1Style
    },
    fighter2: {
      name: fighter2.name,
      data: fighter2, // Include full fighter data
      winProbability: fighter2WinProb.toFixed(1),
      strikingScore: fighter2Striking.toFixed(1),
      grapplingScore: fighter2Grappling.toFixed(1),
      recordScore: fighter2Record.toFixed(1),
      physicalScore: fighter2Physical.toFixed(1),
      totalScore: fighter2Total.toFixed(1),
      age: calculateAge(fighter2.dob),
      ageFactor: fighter2AgeFactor,
      finishRate: fighter2FinishRate.toFixed(1),
      style: fighter2Style
    },
    prediction: {
      winner: winner.name,
      confidence: winnerProb.toFixed(1),
      confidenceTier,
      likelyFinish: determineLikelyFinish(winner),
      closeFight: Math.abs(fighter1WinProb - fighter2WinProb) < 10,
      finishAnalysis: {
        ...winnerFinishAnalysis,
        likelyOutcome: winnerFinishAnalysis.decisionProbability > 50 ? 'Decision' : 'Finish'
      }
    },
    analysis: {
      weightClass,
      styleMatchup: `${fighter1Style} vs ${fighter2Style}`,
      fighter1Style,
      fighter2Style,
      styleMultipliers,
      keyAdvantages,
      numRounds
    }
  };
};

// Generate round-by-round simulation
export const simulateRounds = (fighter1, fighter2, numRounds = 5) => {
  const prediction = predictFight(fighter1, fighter2);
  if (!prediction) return null;
  
  const rounds = [];
  let fighter1Damage = 0;
  let fighter2Damage = 0;
  
  for (let i = 1; i <= numRounds; i++) {
    const f1StrikingRate = parseNumber(fighter1.sig_strikes_landed_per_min);
    const f2StrikingRate = parseNumber(fighter2.sig_strikes_landed_per_min);
    
    // Simulate strikes landed (with some randomness)
    const f1Strikes = Math.floor(f1StrikingRate * 5 * (0.8 + Math.random() * 0.4));
    const f2Strikes = Math.floor(f2StrikingRate * 5 * (0.8 + Math.random() * 0.4));
    
    fighter1Damage += f2Strikes;
    fighter2Damage += f1Strikes;
    
    // Check for finish
    const f1FinishChance = Math.random() * 100;
    const f2FinishChance = Math.random() * 100;
    
    let roundResult = 'Continues';
    let winner = null;
    
    if (f1FinishChance > 90 && parseFloat(prediction.fighter1.winProbability) > 55) {
      roundResult = 'Finish';
      winner = fighter1.name;
    } else if (f2FinishChance > 90 && parseFloat(prediction.fighter2.winProbability) > 55) {
      roundResult = 'Finish';
      winner = fighter2.name;
    }
    
    rounds.push({
      round: i,
      fighter1Strikes: f1Strikes,
      fighter2Strikes: f2Strikes,
      result: roundResult,
      winner: winner
    });
    
    if (roundResult === 'Finish') break;
  }
  
  return {
    prediction,
    rounds,
    totalDamage: {
      fighter1: fighter1Damage,
      fighter2: fighter2Damage
    }
  };
};
