# Quick Start Guide

## Test the App Right Now (No Setup Required!)

The app comes with 10 sample fighters pre-loaded, so you can test it immediately:

```bash
npm run dev
```

Open http://localhost:5173 and try predicting a fight between:
- Conor McGregor vs Khabib Nurmagomedov
- Jon Jones vs Israel Adesanya
- Francis Ngannou vs any fighter

## Next Steps

### 1. Scrape More Fighters (Optional)

To get real data for more fighters:

```bash
# Install Python dependencies
cd scraper
pip install -r requirements.txt

# Run the scraper (will take ~1 minute for 50 fighters)
python ufc_scraper.py
cd ..
```

This will replace the sample data with real fighter stats.

### 2. Deploy to GitHub and Netlify

```bash
# Initialize git repository
git init
git add .
git commit -m "Initial commit - UFC Fight Predictor"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/ufc-fight-predictor.git
git push -u origin main
```

Then:
1. Go to https://netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub account
4. Select your repository
5. Click "Deploy site" (settings are auto-detected from netlify.toml)

Your app will be live in ~2 minutes! 🚀

## Troubleshooting

**"Loading fighter data..." stuck?**
- Make sure `public/fighters_data.json` exists
- Check browser console for errors

**Scraper not working?**
- Verify Python 3.8+ is installed: `python --version`
- Install dependencies: `pip install -r scraper/requirements.txt`
- The website structure may have changed - check ufcstats.com

**Deployment failed?**
- Ensure `npm run build` works locally
- Check that `fighters_data.json` is in the `public/` folder
- Review build logs in Netlify dashboard

## Features to Try

1. **Compare strikers**: Israel Adesanya vs Conor McGregor
2. **Grappler vs Striker**: Khabib vs anyone
3. **Size advantage**: Francis Ngannou vs smaller fighters
4. **Experience**: Georges St-Pierre (26-2) vs newer fighters

Enjoy! 🥊
