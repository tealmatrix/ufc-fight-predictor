# The Odds API Integration Guide

This document explains how the betting odds integration works in the UFC Fight Predictor.

## ✅ Current Setup

Your UFC Fight Predictor is now integrated with **The Odds API** for real-time betting odds!

## 🔑 API Key Configuration

Your API key is securely stored in the `.env` file:

```bash
VITE_ODDS_API_KEY=b4c80f75c2b5c15a00ea76e6dd51db9d
VITE_ODDS_API_BASE_URL=https://api.the-odds-api.com/v4
```

**Important Security Notes:**
- ✅ The `.env` file is in `.gitignore` so your API key won't be committed to version control
- ✅ Vite prefix (`VITE_`) makes the variable available in the browser
- ⚠️ **Never share your API key publicly or commit it to GitHub**

## 📊 How It Works

### 1. **Automatic Odds Fetching**
When you predict a fight, the app automatically:
1. Fetches current UFC/MMA betting odds from The Odds API
2. Searches for the specific fight by fighter names
3. Displays real-time odds if available
4. Shows a friendly message if odds aren't available yet

### 2. **Data Caching**
To conserve API requests:
- Odds data is cached for **5 minutes**
- Subsequent predictions within 5 minutes use cached data
- This prevents exceeding your API rate limits

### 3. **Fighter Name Matching**
The system intelligently matches fighter names:
- Normalizes names (removes extra spaces, converts to lowercase)
- Uses fuzzy matching to handle slight name variations
- Checks both possible orderings of fighters

## 📈 What's Displayed

### When Odds Are Found:
- **Bookmaker Source**: Which bookmaker's odds are shown
- **Live Indicator**: Shows odds are current
- **Model vs Vegas Comparison**:
  - Model Prediction %
  - Vegas Implied Probability %
  - American Odds (e.g., -150, +200)
  - Decimal Odds (e.g., 1.67, 2.30)
- **Comparison Badge**: 
  - 🟢 "Aligned with Vegas" (within 5%)
  - 🟡 "Slight variance" (5-10% difference)
  - 🔴 "Significant variance" (10%+ difference)

### When Odds Not Available:
- Friendly message explaining odds come closer to fight date
- Shows only model predictions

## 🔢 API Rate Limits

**The Odds API Free Tier:**
- 500 requests per month
- Resets monthly

**Tips to Conserve Requests:**
- The app caches odds for 5 minutes
- Only fetches when predicting a new fight
- Consider upgrading if you use it frequently

### Check Your Usage

You can check remaining requests in the browser console when fetching odds. The API returns headers:
- `x-requests-remaining`: Requests left this month
- `x-requests-used`: Requests used this month

## 🚀 Testing the Integration

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Select two fighters who have an upcoming fight**
   - Current UFC fighters with scheduled bouts
   - The API covers all major MMA organizations

3. **Click "Predict Fight"**
   - Watch the loading spinner
   - See live odds appear!

## 🔧 Troubleshooting

### "Betting odds not available"
- The fight isn't scheduled yet
- It's too far from the fight date (odds appear 1-2 weeks before)
- The fight is in a smaller promotion not covered by bookmakers

### "Failed to fetch odds"
- Check your internet connection
- Verify API key is correct in `.env`
- Check if you've exceeded monthly rate limit
- Restart dev server (`npm run dev`) after changing `.env`

### CORS Errors
- The Odds API supports CORS, so this shouldn't happen
- If it does, the API key might be invalid

## 📝 API Documentation

For more details about The Odds API:
- **Docs**: https://the-odds-api.com/liveapi/guides/v4/
- **Sports Coverage**: https://the-odds-api.com/sports-odds-data/sports-apis.html
- **Dashboard**: https://the-odds-api.com/account/

## 🔐 Security Best Practices

1. **Never commit `.env` to Git** ✅ Already set up!
2. **Don't share your API key** in screenshots or videos
3. **Regenerate key if exposed** via The Odds API dashboard
4. **Use separate keys** for development and production

## 📈 Upgrading

If you need more requests, The Odds API offers paid tiers:
- **Starter**: $39/month - 10,000 requests
- **Pro**: $89/month - 50,000 requests
- **Enterprise**: Custom pricing

Visit: https://the-odds-api.com/liveapi/pricing/

## 🎯 Features

- ✅ Real-time odds fetching
- ✅ American odds format
- ✅ Decimal odds conversion
- ✅ Implied probability calculation
- ✅ Model vs Vegas comparison
- ✅ Variance indicators
- ✅ Multiple bookmakers support (uses first available)
- ✅ Automatic caching
- ✅ Fighter name matching
- ✅ Loading states
- ✅ Error handling

## 💡 Tips for Best Results

1. **Test with upcoming fights** - Odds are most reliable 1-2 weeks before fight date
2. **Check multiple predictions** - See how your model compares to Vegas over time
3. **Look for value bets** - When model significantly differs from Vegas, investigate why
4. **Monitor your usage** - Keep track of API requests in free tier

---

**Integration Status**: ✅ **LIVE AND WORKING**

Your UFC Fight Predictor is now powered by real betting odds from The Odds API!
