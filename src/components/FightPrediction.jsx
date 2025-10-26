import './FightPrediction.css';
import KeyAdvantagesPanel from './KeyAdvantagesPanel';
import TaleOfTheTape from './TaleOfTheTape';
import StatBarsComparison from './StatBarsComparison';
import StyleMatchup from './StyleMatchup';
import BettingOdds from './BettingOdds';
import RoundFinishPredictor from './RoundFinishPredictor';

function FightPrediction({ prediction, simulation }) {
  if (!prediction) return null;

  const { fighter1, fighter2, prediction: pred, analysis } = prediction;

  return (
    <div className="fight-prediction">
      <div className="prediction-header">
        <h2>Fight Prediction</h2>
        {pred.closeFight && (
          <span className="close-fight-badge">Close Fight!</span>
        )}
      </div>

      <div className="winner-announcement">
        {parseFloat(pred.confidence) >= 70 && (
          <div className="lock-badge">
            🔒 LOCK OF THE NIGHT 🔒
          </div>
        )}
        <div className="winner-label">Predicted Winner</div>
        <div className="winner-name">{pred.winner}</div>
        <div className="winner-confidence">{pred.confidence}% Win Probability</div>
        {pred.confidenceTier && (
          <div 
            className="confidence-tier"
            style={{ color: pred.confidenceTier.color }}
          >
            {pred.confidenceTier.icon} {pred.confidenceTier.tier}
          </div>
        )}
        <div className="winner-method">Likely finish: {pred.likelyFinish}</div>
        {analysis && (
          <div className="fight-details">
            <span className="detail-item">Weight Class: {analysis.weightClass}</span>
            <span className="detail-separator">•</span>
            <span className="detail-item">{analysis.numRounds} Rounds</span>
          </div>
        )}
      </div>

      {analysis && analysis.keyAdvantages && (
        <KeyAdvantagesPanel keyAdvantages={analysis.keyAdvantages} />
      )}

      {analysis && (
        <StyleMatchup 
          analysis={analysis} 
          fighter1={fighter1} 
          fighter2={fighter2} 
        />
      )}

      <TaleOfTheTape fighter1={fighter1} fighter2={fighter2} />

      <StatBarsComparison fighter1={fighter1} fighter2={fighter2} />

      <RoundFinishPredictor prediction={prediction} />

      <BettingOdds 
        prediction={prediction}
      />

      <div className="win-probability">
        <div className="probability-bar">
          <div
            className="probability-fill fighter1"
            style={{ width: `${fighter1.winProbability}%` }}
          >
            <span>{fighter1.winProbability}%</span>
          </div>
          <div
            className="probability-fill fighter2"
            style={{ width: `${fighter2.winProbability}%` }}
          >
            <span>{fighter2.winProbability}%</span>
          </div>
        </div>
        <div className="probability-labels">
          <span>{fighter1.name}</span>
          <span>{fighter2.name}</span>
        </div>
      </div>

      <div className="detailed-scores">
        <h3>Detailed Analysis</h3>
        <div className="scores-comparison">
          <div className="fighter-scores">
            <h4>{fighter1.name}</h4>
            <div className="score-item">
              <span>Striking:</span>
              <strong>{fighter1.strikingScore}</strong>
            </div>
            <div className="score-item">
              <span>Grappling:</span>
              <strong>{fighter1.grapplingScore}</strong>
            </div>
            <div className="score-item">
              <span>Record:</span>
              <strong>{fighter1.recordScore}</strong>
            </div>
            <div className="score-item">
              <span>Physical:</span>
              <strong>{fighter1.physicalScore}</strong>
            </div>
            <div className="score-item total">
              <span>Total Score:</span>
              <strong>{fighter1.totalScore}</strong>
            </div>
          </div>

          <div className="fighter-scores">
            <h4>{fighter2.name}</h4>
            <div className="score-item">
              <span>Striking:</span>
              <strong>{fighter2.strikingScore}</strong>
            </div>
            <div className="score-item">
              <span>Grappling:</span>
              <strong>{fighter2.grapplingScore}</strong>
            </div>
            <div className="score-item">
              <span>Record:</span>
              <strong>{fighter2.recordScore}</strong>
            </div>
            <div className="score-item">
              <span>Physical:</span>
              <strong>{fighter2.physicalScore}</strong>
            </div>
            <div className="score-item total">
              <span>Total Score:</span>
              <strong>{fighter2.totalScore}</strong>
            </div>
          </div>
        </div>
      </div>

      {simulation && simulation.rounds && (
        <div className="round-simulation">
          <h3>Round-by-Round Simulation</h3>
          <div className="rounds-list">
            {simulation.rounds.map((round) => (
              <div key={round.round} className="round-item">
                <div className="round-number">Round {round.round}</div>
                <div className="round-stats">
                  <div className="round-stat">
                    <span>{fighter1.name}:</span>
                    <strong>{round.fighter1Strikes} strikes</strong>
                  </div>
                  <div className="round-stat">
                    <span>{fighter2.name}:</span>
                    <strong>{round.fighter2Strikes} strikes</strong>
                  </div>
                </div>
                {round.result === 'Finish' && (
                  <div className="round-finish">
                    🏆 Fight ends - {round.winner} wins!
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FightPrediction;
