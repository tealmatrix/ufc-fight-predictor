# 🥊 UFC Fight Predictor

A web application that analyzes UFC fighter statistics and predicts match outcomes using data-driven algorithms.

## Features

### Core Features
- **Fighter Stats Scraper**: Python script to collect real UFC fighter data from ufcstats.com
- **Advanced Prediction Algorithm**: Multi-factor analysis with weight class, age, style, and stance adjustments
- **Interactive UI**: Select fighters and view comprehensive predictions
- **Fully Responsive Design**: Optimized for desktop, tablet, and mobile devices

### New Enhanced Features ✨
- **Key Advantages Panel**: Highlights striking, grappling, and prime age advantages
- **Style Matchup Analysis**: Striker vs Grappler vs Balanced fighter matchups with multipliers
- **Confidence Tiers**: Toss-up, Slight Favorite, Strong Favorite, or Lock classifications
- **Head-to-Head Stat Bars**: Visual comparison of striking, grappling, defense, and finish rates
- **Age/Prime Factor**: Adjusts predictions based on fighter age (28-32 prime years)
- **Finish Rate Analysis**: Calculates likelihood of finishing fights vs going to decision
- **Stance Matchups**: Southpaw vs Orthodox advantages
- **Tale of the Tape**: Traditional UFC-style fighter comparison
- **Fight Length Selector**: Choose between 3-round and 5-round fights (affects cardio calculations)
- **Weight Class Adjustments**: Different stats weighted by division (e.g., submissions more important at lightweight)
- **Round Finish Prediction**: Predicts likely round of finish or decision with probability breakdown
- **Betting Odds Integration**: ✅ **LIVE!** Real-time odds from The Odds API with model vs Vegas comparison
- **Round-by-Round Simulation**: See how the fight might unfold

## Tech Stack

- **Frontend**: React + Vite
- **Styling**: Custom CSS
- **Data Scraping**: Python (BeautifulSoup, Requests)
- **Deployment**: Netlify

## Getting Started

### Prerequisites

- Node.js (v20.19+ or v22.12+)
- Python 3.8+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ufc-fight-predictor
   ```

2. **Install Node dependencies**
   ```bash
   npm install
   ```

3. **Install Python dependencies** (for scraping)
   ```bash
   cd scraper
   pip install -r requirements.txt
   cd ..
   ```

### Scraping Fighter Data

Before running the app, you need to scrape fighter data:

```bash
cd scraper
python ufc_scraper.py
```

**Note**: 
- The script is currently set to scrape 50 fighters for testing purposes
- To scrape all fighters, remove the `limit=50` parameter in `ufc_scraper.py` (line 152)
- Scraping all fighters can take 30-60 minutes due to rate limiting
- Be respectful to the server - the script includes delays between requests

The scraped data will be saved to `public/fighters_data.json`.

### Running Locally

```bash
npm run dev
```

The app will open at `http://localhost:5173`

## Usage

1. **Select Fighter 1** (Red Corner) - Use the search box to find and select a fighter
2. **Select Fighter 2** (Blue Corner) - Choose the opponent
3. **Click "Predict Fight"** - View the prediction results including:
   - Win probability for each fighter
   - Predicted finish method
   - Detailed scoring breakdown (striking, grappling, record, physical)
   - Round-by-round simulation

4. **Click "Reset Fight"** to start over with new fighters

## Prediction Algorithm

The algorithm analyzes multiple factors:

- **Striking (35% weight)**: Significant strikes per minute, accuracy, defense, strikes absorbed
- **Grappling (30% weight)**: Takedown average, accuracy, defense, submission rate
- **Record (25% weight)**: Win rate and fight experience
- **Physical (10% weight)**: Height and reach advantages

## Deployment to Netlify

### Option 1: Deploy via GitHub

1. **Initialize Git and push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy on Netlify**
   - Go to [Netlify](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect to your GitHub repository
   - Build settings are automatically detected from `netlify.toml`
   - Click "Deploy site"

### Option 2: Deploy via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Deploy**
   ```bash
   netlify deploy --prod
   ```

### Important Notes for Deployment

- Make sure `public/fighters_data.json` exists before deploying
- The JSON file must be in the `public/` directory to be accessible by the app
- You can commit the JSON file to your repo, or manually upload it to Netlify

## Project Structure

```
ufc-fight-predictor/
├── public/
│   └── fighters_data.json      # Scraped fighter data
├── scraper/
│   ├── ufc_scraper.py          # Python scraper script
│   └── requirements.txt        # Python dependencies
├── src/
│   ├── components/
│   │   ├── FighterSelector.jsx        # Fighter selection UI
│   │   ├── FighterSelector.css
│   │   ├── FightPrediction.jsx        # Results display
│   │   └── FightPrediction.css
│   ├── utils/
│   │   └── fightPredictor.js   # Prediction algorithm
│   ├── App.jsx                 # Main app component
│   ├── App.css
│   └── main.jsx
├── netlify.toml                # Netlify configuration
├── package.json
└── README.md
```

## Data Source

Fighter statistics are sourced from [ufcstats.com](http://ufcstats.com/statistics/fighters), which provides comprehensive career statistics for all UFC fighters.

## Disclaimer

This application is for **entertainment purposes only**. Predictions are based on statistical analysis and do not guarantee actual fight outcomes. Many factors affect real fights including injuries, strategy, motivation, and circumstances that cannot be captured in historical statistics.

## Future Enhancements

- [ ] Add more fighters (currently limited to 50 for testing)
- [ ] Include recent form/momentum analysis (framework ready, needs historical fight data)
- [ ] Add weight class filtering
- [x] Implement fight style matchup analysis ✅
- [x] Add visualization charts for stat comparisons ✅
- [x] Include betting odds integration structure ✅
- [x] Integrate real-time betting odds API ✅
- [ ] Save and share predictions
- [ ] Integrate real-time betting odds API
- [ ] Add fighter photos
- [ ] Historical prediction tracking

## License

MIT

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

---

Built with ❤️ by tealmatrix

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
