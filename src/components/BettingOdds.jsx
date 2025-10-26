import { useState, useEffect } from 'react';
import './BettingOdds.css';
import { findFightOdds } from '../utils/oddsApi';

function BettingOdds({ prediction }) {
  const [oddsData, setOddsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fighter1 = prediction?.fighter1;
  const fighter2 = prediction?.fighter2;

  useEffect(() => {
    if (!fighter1 || !fighter2) return;
    const fetchOdds = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const odds = await findFightOdds(fighter1.name, fighter2.name);
        setOddsData(odds);
      } catch (err) {
        console.error('Error fetching odds:', err);
        setError('Failed to fetch odds');
      } finally {
        setLoading(false);
      }
    };

    fetchOdds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fighter1, fighter2]);

  const getOddsComparison = (predictedProb, impliedProb) => {
    const predicted = parseFloat(predictedProb);
    const implied = parseFloat(impliedProb);
    const diff = Math.abs(predicted - implied);
    
    if (diff < 5) return { text: 'Aligned with Vegas', color: '#10b981' };
    if (diff < 10) return { text: 'Slight variance', color: '#f59e0b' };
    return { text: 'Significant variance', color: '#ef4444' };
  };

  // Early return if no prediction data
  if (!prediction || !fighter1 || !fighter2) return null;

  if (loading) {
    return (
      <div className="betting-odds">
        <h3>💰 Betting Odds Comparison</h3>
        <div className="odds-loading">
          <div className="spinner"></div>
          <p>Fetching live betting odds...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="betting-odds">
        <h3>💰 Betting Odds Comparison</h3>
        <div className="odds-error">
          <p>⚠️ {error}</p>
        </div>
      </div>
    );
  }

  // No odds found for this fight
  if (!oddsData || !oddsData.found) {
    return (
      <div className="betting-odds">
        <h3>💰 Betting Odds Comparison</h3>
        <div className="odds-not-found">
          <p>📊 <strong>Betting odds not available</strong></p>
          <p>This fight doesn't have active betting lines yet. Odds typically become available closer to the fight date.</p>
          <div className="model-only">
            <h4>Model Predictions</h4>
            <div className="model-predictions">
              <div className="model-pred-item">
                <span>{fighter1.name}:</span>
                <span className="pred-value">{fighter1.winProbability}%</span>
              </div>
              <div className="model-pred-item">
                <span>{fighter2.name}:</span>
                <span className="pred-value">{fighter2.winProbability}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Real odds found!
  const { fighter1: f1Odds, fighter2: f2Odds, bookmaker } = oddsData;
  const f1Comparison = getOddsComparison(fighter1.winProbability, f1Odds.impliedProbability);
  const f2Comparison = getOddsComparison(fighter2.winProbability, f2Odds.impliedProbability);

  return (
    <div className="betting-odds">
      <h3>💰 Betting Odds Comparison</h3>
      
      <div className="odds-source">
        <span>📍 Source: <strong>{bookmaker}</strong></span>
        <span className="live-indicator">🟢 Live Odds</span>
      </div>

      <div className="odds-comparison">
        <div className="odds-section">
          <h4>{fighter1.name}</h4>
          <div className="odds-values">
            <div className="odds-item">
              <span className="odds-label">Model Prediction</span>
              <span className="odds-value model">{fighter1.winProbability}%</span>
            </div>
            <div className="odds-item">
              <span className="odds-label">Vegas Implied</span>
              <span className="odds-value vegas">{f1Odds.impliedProbability}%</span>
            </div>
            <div className="odds-item">
              <span className="odds-label">American Odds</span>
              <span className="odds-value american">{f1Odds.americanOdds > 0 ? '+' : ''}{f1Odds.americanOdds}</span>
            </div>
            <div className="odds-item">
              <span className="odds-label">Decimal Odds</span>
              <span className="odds-value">{f1Odds.decimalOdds}</span>
            </div>
          </div>
          <div className="comparison-badge" style={{ background: f1Comparison.color }}>
            {f1Comparison.text}
          </div>
        </div>

        <div className="odds-separator">VS</div>

        <div className="odds-section">
          <h4>{fighter2.name}</h4>
          <div className="odds-values">
            <div className="odds-item">
              <span className="odds-label">Model Prediction</span>
              <span className="odds-value model">{fighter2.winProbability}%</span>
            </div>
            <div className="odds-item">
              <span className="odds-label">Vegas Implied</span>
              <span className="odds-value vegas">{f2Odds.impliedProbability}%</span>
            </div>
            <div className="odds-item">
              <span className="odds-label">American Odds</span>
              <span className="odds-value american">{f2Odds.americanOdds > 0 ? '+' : ''}{f2Odds.americanOdds}</span>
            </div>
            <div className="odds-item">
              <span className="odds-label">Decimal Odds</span>
              <span className="odds-value">{f2Odds.decimalOdds}</span>
            </div>
          </div>
          <div className="comparison-badge" style={{ background: f2Comparison.color }}>
            {f2Comparison.text}
          </div>
        </div>
      </div>

      <div className="odds-info">
        <p>
          <strong>💡 Tip:</strong> When model predictions significantly differ from Vegas odds, 
          it may indicate value betting opportunities or areas where the model disagrees with the market.
        </p>
      </div>
    </div>
  );
}

export default BettingOdds;
