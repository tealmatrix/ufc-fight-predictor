/**
 * The Odds API Integration
 * Fetches real betting odds for UFC fights
 */

const API_KEY = import.meta.env.VITE_ODDS_API_KEY;
const BASE_URL = import.meta.env.VITE_ODDS_API_BASE_URL || 'https://api.the-odds-api.com/v4';

// Cache odds data to avoid excessive API calls
let cachedOdds = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch UFC odds from The Odds API
 */
export const fetchUFCOdds = async () => {
  // Check cache first
  if (cachedOdds && cacheTimestamp && Date.now() - cacheTimestamp < CACHE_DURATION) {
    console.log('Using cached odds data');
    return cachedOdds;
  }

  if (!API_KEY) {
    console.warn('Odds API key not configured');
    return null;
  }

  try {
    // The Odds API endpoint for MMA
    const response = await fetch(
      `${BASE_URL}/sports/mma_mixed_martial_arts/odds/?apiKey=${API_KEY}&regions=us&markets=h2h&oddsFormat=american`
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    
    // Cache the data
    cachedOdds = data;
    cacheTimestamp = Date.now();
    
    console.log(`Fetched ${data.length} MMA events from Odds API`);
    return data;
  } catch (error) {
    console.error('Error fetching odds:', error);
    return null;
  }
};

/**
 * Convert American odds to decimal odds
 */
export const americanToDecimal = (americanOdds) => {
  const odds = parseInt(americanOdds);
  if (odds > 0) {
    return (odds / 100) + 1;
  } else {
    return (100 / Math.abs(odds)) + 1;
  }
};

/**
 * Convert American odds to implied probability
 */
export const americanToImpliedProbability = (americanOdds) => {
  const odds = parseInt(americanOdds);
  if (odds > 0) {
    return (100 / (odds + 100)) * 100;
  } else {
    return (Math.abs(odds) / (Math.abs(odds) + 100)) * 100;
  }
};

/**
 * Find odds for a specific fight by fighter names
 */
export const findFightOdds = async (fighter1Name, fighter2Name) => {
  const allOdds = await fetchUFCOdds();
  
  if (!allOdds || allOdds.length === 0) {
    return null;
  }

  // Normalize names for comparison (remove extra spaces, lowercase)
  const normalizeName = (name) => name.toLowerCase().trim().replace(/\s+/g, ' ');
  const f1Normalized = normalizeName(fighter1Name);
  const f2Normalized = normalizeName(fighter2Name);

  // Find the event that matches both fighters
  for (const event of allOdds) {
    if (!event.bookmakers || event.bookmakers.length === 0) continue;

    // Get the first bookmaker's odds (you can average multiple bookmakers if desired)
    const bookmaker = event.bookmakers[0];
    const h2hMarket = bookmaker.markets?.find(m => m.key === 'h2h');
    
    if (!h2hMarket || !h2hMarket.outcomes || h2hMarket.outcomes.length !== 2) continue;

    const outcome1 = h2hMarket.outcomes[0];
    const outcome2 = h2hMarket.outcomes[1];
    
    const outcome1Name = normalizeName(outcome1.name);
    const outcome2Name = normalizeName(outcome2.name);

    // Check if both fighters match (in either order)
    const match1 = (outcome1Name.includes(f1Normalized) || f1Normalized.includes(outcome1Name)) &&
                   (outcome2Name.includes(f2Normalized) || f2Normalized.includes(outcome2Name));
    const match2 = (outcome2Name.includes(f1Normalized) || f1Normalized.includes(outcome2Name)) &&
                   (outcome1Name.includes(f2Normalized) || f2Normalized.includes(outcome1Name));

    if (match1 || match2) {
      // Determine which outcome corresponds to which fighter
      let fighter1Odds, fighter2Odds;
      
      if (match1) {
        fighter1Odds = outcome1;
        fighter2Odds = outcome2;
      } else {
        fighter1Odds = outcome2;
        fighter2Odds = outcome1;
      }

      return {
        found: true,
        eventName: event.home_team + ' vs ' + event.away_team,
        commence_time: event.commence_time,
        bookmaker: bookmaker.title,
        fighter1: {
          name: fighter1Odds.name,
          americanOdds: fighter1Odds.price,
          decimalOdds: americanToDecimal(fighter1Odds.price).toFixed(2),
          impliedProbability: americanToImpliedProbability(fighter1Odds.price).toFixed(1)
        },
        fighter2: {
          name: fighter2Odds.name,
          americanOdds: fighter2Odds.price,
          decimalOdds: americanToDecimal(fighter2Odds.price).toFixed(2),
          impliedProbability: americanToImpliedProbability(fighter2Odds.price).toFixed(1)
        }
      };
    }
  }

  return { found: false };
};

/**
 * Check API usage remaining
 */
export const checkApiUsage = async () => {
  if (!API_KEY) return null;

  try {
    const response = await fetch(
      `${BASE_URL}/sports/mma_mixed_martial_arts/odds/?apiKey=${API_KEY}&regions=us&markets=h2h`
    );

    const remaining = response.headers.get('x-requests-remaining');
    const used = response.headers.get('x-requests-used');

    return {
      remaining: remaining || 'Unknown',
      used: used || 'Unknown'
    };
  } catch (error) {
    console.error('Error checking API usage:', error);
    return null;
  }
};

export default {
  fetchUFCOdds,
  findFightOdds,
  americanToDecimal,
  americanToImpliedProbability,
  checkApiUsage
};
