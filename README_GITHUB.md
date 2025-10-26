# 🥊 UFC Fight Predictor

A comprehensive UFC fight prediction tool that analyzes fighter statistics, fighting styles, and historical performance to predict match outcomes.

## Features

- **Fighter Database**: 545+ UFC fighters with complete stats from UFC Stats
- **Last 3 Fights**: View each fighter's recent fight history with results, opponents, and methods
- **Advanced Predictions**: Algorithm analyzes striking, grappling, defense, and stylistic matchups
- **Round-by-Round Simulation**: Simulates each round to predict finish method and timing
- **Fight Card Builder**: Create and analyze full fight cards
- **Responsive Design**: Works on desktop, tablet, and mobile

## Tech Stack

- **Frontend**: React + Vite
- **Styling**: CSS3 with modern animations
- **Data**: Scraped from UFC Stats using Python/BeautifulSoup
- **Deployment**: Netlify

## Live Demo

[View Live Site](https://your-app-name.netlify.app)

## Screenshots

[Add screenshots here]

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ufc-fight-predictor.git
cd ufc-fight-predictor
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## Build for Production

```bash
npm run build
```

The build output will be in the `dist` folder.

## Data Scraping

The fighter data is scraped from UFC Stats using Python scripts in the `/scraper` directory.

### Update Fighter Data

1. Install Python dependencies:
```bash
cd scraper
pip install -r requirements.txt
```

2. Run the scraper:
```bash
python fix_fight_history.py
```

This will update all fighter stats and fight history.

## Project Structure

```
ufc-fight-predictor/
├── src/
│   ├── components/        # React components
│   ├── utils/            # Prediction algorithms
│   ├── App.jsx           # Main app component
│   └── main.jsx          # Entry point
├── public/
│   └── fighters_data_new.json  # Fighter database
├── scraper/              # Python web scraping scripts
├── netlify.toml          # Netlify configuration
└── package.json
```

## How It Works

### Prediction Algorithm

The prediction algorithm considers:

1. **Striking Stats**: Strikes landed/absorbed per minute, striking accuracy/defense
2. **Grappling Stats**: Takedown offense/defense, submission averages
3. **Physical Attributes**: Height, reach, age
4. **Record & Experience**: Win/loss record, total fights
5. **Style Matchups**: How fighting styles interact
6. **Recent Form**: Last 3 fight results and performance

### Fight Simulation

Each round is simulated considering:
- Current momentum and energy levels
- Striking exchanges and damage
- Takedown attempts and ground control
- Submission opportunities
- Referee stoppage criteria

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Data Source

All fighter statistics are sourced from [UFC Stats](http://ufcstats.com/), the official statistics provider for the UFC.

## Disclaimer

This tool is for entertainment purposes only. Fight predictions are based on statistical analysis and should not be used for betting or gambling purposes.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Author

Built with ❤️ by [Your Name]

## Acknowledgments

- UFC Stats for providing comprehensive fighter data
- The UFC and its fighters for the amazing sport
