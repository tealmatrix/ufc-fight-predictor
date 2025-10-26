import './RoundFinishPredictor.css';

function RoundFinishPredictor({ prediction }) {
  if (!prediction || !prediction.prediction.finishAnalysis) return null;

  const { finishAnalysis } = prediction.prediction;
  const { roundProbabilities, totalFinishProbability, decisionProbability, likelyOutcome } = finishAnalysis;

  // Find the most likely round for finish
  const mostLikelyRound = roundProbabilities.reduce((max, current) => 
    current.probability > max.probability ? current : max
  , roundProbabilities[0]);

  const getOutcomeColor = () => {
    if (likelyOutcome === 'Decision') return '#6366f1';
    return '#ef4444';
  };

  const getBarHeight = (probability) => {
    const maxProb = Math.max(...roundProbabilities.map(r => r.probability));
    return maxProb > 0 ? (probability / maxProb) * 100 : 0;
  };

  return (
    <div className="round-finish-predictor">
      <h3>⏱️ Finish Prediction</h3>
      
      <div className="outcome-summary">
        <div className="outcome-main" style={{ borderColor: getOutcomeColor() }}>
          <div className="outcome-label">Most Likely Outcome</div>
          <div className="outcome-value" style={{ color: getOutcomeColor() }}>
            {likelyOutcome}
          </div>
          <div className="outcome-probability">
            {likelyOutcome === 'Decision' 
              ? `${decisionProbability.toFixed(1)}% chance`
              : `${totalFinishProbability.toFixed(1)}% chance of finish`
            }
          </div>
        </div>

        {likelyOutcome === 'Finish' && (
          <div className="most-likely-round">
            <div className="mlr-label">Most Likely Round</div>
            <div className="mlr-value">Round {mostLikelyRound.round}</div>
            <div className="mlr-probability">{mostLikelyRound.probability.toFixed(1)}%</div>
          </div>
        )}
      </div>

      <div className="round-breakdown">
        <h4>Round-by-Round Finish Probability</h4>
        <div className="round-chart">
          {roundProbabilities.map((round) => (
            <div key={round.round} className="round-bar-container">
              <div className="round-label">R{round.round}</div>
              <div className="round-bar-wrapper">
                <div 
                  className="round-bar"
                  style={{ height: `${getBarHeight(round.probability)}%` }}
                >
                  <span className="bar-percentage">
                    {round.probability > 1 ? `${round.probability.toFixed(1)}%` : ''}
                  </span>
                </div>
              </div>
              <div className="round-value">{round.probability.toFixed(1)}%</div>
            </div>
          ))}
        </div>

        <div className="decision-bar">
          <div className="decision-label">
            <span>Decision</span>
            <span className="decision-percentage">{decisionProbability.toFixed(1)}%</span>
          </div>
          <div className="decision-bar-fill" style={{ width: `${decisionProbability}%` }}>
          </div>
        </div>
      </div>

      <div className="finish-note">
        <p>
          <strong>Note:</strong> Finish probabilities are calculated based on fighter finishing ability, 
          opponent defense, and historical patterns. Later rounds have slightly higher finish probability 
          due to accumulated damage and fatigue.
        </p>
      </div>
    </div>
  );
}

export default RoundFinishPredictor;
