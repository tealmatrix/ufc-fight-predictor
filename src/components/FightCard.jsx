import './FightCard.css';

function FightCard({ fights, onRemoveFight, lockOfTheNight }) {
  if (fights.length === 0) {
    return (
      <div className="fight-card-empty">
        <h2>🥊 Build Your Fight Card</h2>
        <p>Add fights to see predictions and find the Lock of the Night!</p>
      </div>
    );
  }

  return (
    <div className="fight-card">
      <div className="fight-card-header">
        <h2>🥊 Fight Card</h2>
        <div className="fight-card-count">{fights.length} Fight{fights.length !== 1 ? 's' : ''}</div>
      </div>

      <div className="fights-list">
        {fights.map((fight) => {
          const isLock = lockOfTheNight === fight.id;
          const pred = fight.prediction.prediction;
          const f1 = fight.prediction.fighter1;
          const f2 = fight.prediction.fighter2;
          const winner = pred.winner;
          const isF1Winner = winner === fight.fighter1.name;

          return (
            <div key={fight.id} className={`fight-card-item ${isLock ? 'lock-fight' : ''}`}>
              {isLock && (
                <div className="lock-of-night-banner">
                  🔒 LOCK OF THE NIGHT 🔒
                </div>
              )}
              
              <div className="fight-matchup">
                <div className={`fighter-side ${isF1Winner ? 'winner' : ''}`}>
                  <div className="fighter-name">{fight.fighter1.name}</div>
                  {fight.fighter1.nickname && (
                    <div className="fighter-nickname">"{fight.fighter1.nickname}"</div>
                  )}
                  <div className="fighter-record">
                    {fight.fighter1.wins}-{fight.fighter1.losses}-{fight.fighter1.draws}
                  </div>
                  <div className="win-prob">{f1.winProbability}%</div>
                </div>

                <div className="vs-badge">VS</div>

                <div className={`fighter-side ${!isF1Winner ? 'winner' : ''}`}>
                  <div className="fighter-name">{fight.fighter2.name}</div>
                  {fight.fighter2.nickname && (
                    <div className="fighter-nickname">"{fight.fighter2.nickname}"</div>
                  )}
                  <div className="fighter-record">
                    {fight.fighter2.wins}-{fight.fighter2.losses}-{fight.fighter2.draws}
                  </div>
                  <div className="win-prob">{f2.winProbability}%</div>
                </div>
              </div>

              <div className="fight-prediction-summary">
                <div className="prediction-winner">
                  <strong>{winner}</strong> wins by {pred.likelyFinish}
                </div>
                <div className="prediction-confidence">
                  {pred.confidence}% confidence
                </div>
              </div>

              <button 
                className="remove-fight-btn"
                onClick={() => onRemoveFight(fight.id)}
                title="Remove from card"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default FightCard;
