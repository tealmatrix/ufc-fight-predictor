# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

UFC Fight Predictor is a React + Vite web application that predicts UFC fight outcomes using statistical analysis of fighter data scraped from ufcstats.com. The prediction algorithm uses multi-factor analysis including striking, grappling, record, physical attributes, age/prime factors, stance matchups, and fighting style matchups.

## Common Commands

### Development
```bash
npm run dev          # Start development server on http://localhost:5173
npm run build        # Build for production (outputs to dist/)
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Data Scraping (Python)
```bash
cd scraper
python ufc_scraper.py                    # Scrape fighters (currently limited to 50)
python update_fighters_with_history.py   # Update existing fighters with fight history
python add_missing_fighters.py           # Add specific fighters not in dataset
python add_saturday_fighters.py          # Add fighters from upcoming event
```

**Important:** Scraping outputs to `public/fighters_data.json` which must exist before deploying. The app loads from `/fighters_data_new.json` in production (see App.jsx line 22).

### Testing
No automated test suite exists. Manual testing is done via the dev server.

## High-Level Architecture

### Data Flow
1. **Scraper (Python)** → Scrapes ufcstats.com → Generates `public/fighters_data.json`
2. **App.jsx** → Fetches JSON → Loads fighter data into React state
3. **User** → Selects two fighters + fight length (3 or 5 rounds)
4. **fightPredictor.js** → Runs prediction algorithm → Returns prediction object
5. **FightPrediction.jsx** → Renders prediction with multiple sub-components

### Core Prediction Algorithm (`src/utils/fightPredictor.js`)

The `predictFight()` function is the heart of the application. It:

1. **Calculates 4 weighted scores** for each fighter:
   - Striking (35%): Based on strikes/min, accuracy, defense, absorption
   - Grappling (30%): Takedown avg/accuracy/defense, submission rate
   - Record (25%): Win rate + experience bonus
   - Physical (10%): Reach and height advantages

2. **Applies contextual adjustments**:
   - **Weight class adjustments**: Different stat weights by division (e.g., submissions matter more at lightweight)
   - **Style matchup multipliers**: Striker vs Grappler vs Balanced fighter dynamics
   - **Stance advantages**: Southpaw vs Orthodox matchups
   - **Age/prime factors**: Peak performance at 28-32 years old
   - **Fight length adjustments**: 5-round fights favor experience/cardio

3. **Outputs comprehensive prediction**:
   - Win probabilities for each fighter
   - Confidence tier (Lock, Strong Favorite, Slight Favorite, Toss-up)
   - Likely finish method (KO/TKO, Submission, Decision, etc.)
   - Round-by-round finish probabilities
   - Key advantages analysis

### Component Structure

**Main App Flow:**
- `App.jsx` - Root component, manages state for fighter selection and prediction
- `FighterSelector.jsx` - Search and select fighters, displays recent fight history
- `FightPrediction.jsx` - Master prediction display component

**Prediction Sub-Components** (all imported by FightPrediction.jsx):
- `KeyAdvantagesPanel.jsx` - Shows striking/grappling edges, prime factor
- `StyleMatchup.jsx` - Displays fighting styles and matchup analysis
- `TaleOfTheTape.jsx` - Traditional UFC-style fighter comparison
- `StatBarsComparison.jsx` - Visual stat bars for striking, grappling, defense
- `RoundFinishPredictor.jsx` - Probability breakdown by round
- `BettingOdds.jsx` - Integrates live betting odds comparison
- `FightCard.jsx` - Build and manage multiple fight predictions

### Key Files

- **`src/utils/fightPredictor.js`** - All prediction logic (450+ lines)
- **`src/App.jsx`** - State management and view mode toggling
- **`scraper/ufc_scraper.py`** - Web scraper with BeautifulSoup
- **`public/fighters_data_new.json`** - Fighter database loaded by app

## Important Patterns

### Fighter Data Structure
Fighters must have these fields for predictions to work:
```javascript
{
  name, nickname, wins, losses, draws,
  height, weight, reach, stance, dob,
  sig_strikes_landed_per_min, striking_accuracy,
  sig_strikes_absorbed_per_min, striking_defense,
  takedown_avg, takedown_accuracy, takedown_defense,
  submission_avg,
  last_3_fights: [{ result, opponent, method, round }]
}
```

### Adding New Features
When modifying the prediction algorithm:
1. Update `fightPredictor.js` calculation logic
2. Update return object in `predictFight()` 
3. Add corresponding UI in relevant component (typically `FightPrediction.jsx` or sub-component)
4. Test with various fighter matchups (strikers vs grapplers, different weight classes)

### Scraper Notes
- Uses rate limiting (1 second delays) to be respectful to ufcstats.com
- Currently limited to 50 fighters (line 152 in ufc_scraper.py: `limit=50`)
- Remove `limit` parameter to scrape all ~3000 fighters (takes 30-60 minutes)
- Fight history scraping is separate - use utility scripts in scraper/

## Deployment

Netlify configuration in `netlify.toml`:
- Build command: `npm run build`
- Publish directory: `dist`
- SPA redirects configured

**Critical:** Ensure `public/fighters_data_new.json` exists before deploying.

## Tech Stack

- **Frontend**: React 19.1, Vite 7.1
- **Styling**: Custom CSS (no framework)
- **Linting**: ESLint 9.x with React Hooks plugin
- **Scraping**: Python 3.8+, BeautifulSoup, Requests
- **Deployment**: Netlify

## Code Conventions

- React functional components with hooks
- CSS modules per component (ComponentName.jsx + ComponentName.css)
- Helper functions use clear descriptive names (e.g., `calculateStrikingScore`, `determineFightingStyle`)
- Percentage strings parsed via `parsePercentage()` helper
- All numeric strings parsed via `parseNumber()` helper
