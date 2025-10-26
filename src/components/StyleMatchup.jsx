import './StyleMatchup.css';

function StyleMatchup({ analysis, fighter1, fighter2 }) {
  if (!analysis) return null;

  const getMatchupDescription = (f1Style, f2Style) => {
    if (f1Style === 'Striker' && f2Style === 'Grappler') {
      return 'Classic Striker vs Grappler matchup. Grappler has slight advantage if they can close distance.';
    }
    if (f1Style === 'Grappler' && f2Style === 'Striker') {
      return 'Classic Grappler vs Striker matchup. Grappler has slight advantage if they can close distance.';
    }
    if (f1Style === 'Balanced' || f2Style === 'Balanced') {
      return 'Balanced fighters can adapt their strategy, giving them versatility advantage.';
    }
    if (f1Style === f2Style) {
      return `Mirror matchup - both fighters favor ${f1Style.toLowerCase()} approach.`;
    }
    return 'Even stylistic matchup.';
  };

  const getStyleIcon = (style) => {
    if (style === 'Striker') return '🥊';
    if (style === 'Grappler') return '🤼';
    return '⚖️';
  };

  const getMultiplierDisplay = (multiplier) => {
    const percent = ((multiplier - 1) * 100).toFixed(0);
    if (multiplier > 1) return `+${percent}%`;
    if (multiplier < 1) return `${percent}%`;
    return '0%';
  };

  return (
    <div className="style-matchup">
      <h3>🎯 Style Matchup Analysis</h3>
      
      <div className="matchup-header">
        <div className="style-badge red">
          <span className="style-icon">{getStyleIcon(analysis.fighter1Style)}</span>
          <span className="style-name">{analysis.fighter1Style}</span>
          <span className="style-fighter">{fighter1.name}</span>
        </div>
        
        <div className="vs-connector">
          <span>VS</span>
        </div>
        
        <div className="style-badge blue">
          <span className="style-icon">{getStyleIcon(analysis.fighter2Style)}</span>
          <span className="style-name">{analysis.fighter2Style}</span>
          <span className="style-fighter">{fighter2.name}</span>
        </div>
      </div>

      <div className="matchup-description">
        <p>{getMatchupDescription(analysis.fighter1Style, analysis.fighter2Style)}</p>
      </div>

      {(analysis.styleMultipliers.fighter1 !== 1.0 || analysis.styleMultipliers.fighter2 !== 1.0) && (
        <div className="matchup-modifiers">
          <div className="modifier-item">
            <span className="modifier-fighter">{fighter1.name}</span>
            <span className={`modifier-value ${analysis.styleMultipliers.fighter1 > 1 ? 'positive' : 'negative'}`}>
              {getMultiplierDisplay(analysis.styleMultipliers.fighter1)}
            </span>
          </div>
          <div className="modifier-item">
            <span className="modifier-fighter">{fighter2.name}</span>
            <span className={`modifier-value ${analysis.styleMultipliers.fighter2 > 1 ? 'positive' : 'negative'}`}>
              {getMultiplierDisplay(analysis.styleMultipliers.fighter2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default StyleMatchup;
