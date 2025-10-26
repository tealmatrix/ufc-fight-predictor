import './StatBarsComparison.css';

function StatBarsComparison({ fighter1, fighter2 }) {
  if (!fighter1 || !fighter2) return null;

  const parseValue = (val) => parseFloat(val) || 0;

  const stats = [
    {
      label: 'Striking',
      f1Value: parseValue(fighter1.strikingScore),
      f2Value: parseValue(fighter2.strikingScore),
      icon: '🥊'
    },
    {
      label: 'Grappling',
      f1Value: parseValue(fighter1.grapplingScore),
      f2Value: parseValue(fighter2.grapplingScore),
      icon: '🤼'
    },
    {
      label: 'Record',
      f1Value: parseValue(fighter1.recordScore),
      f2Value: parseValue(fighter2.recordScore),
      icon: '🏆'
    },
    {
      label: 'Defense',
      f1Value: parseFloat(fighter1.data.striking_defense?.replace('%', '') || 0),
      f2Value: parseFloat(fighter2.data.striking_defense?.replace('%', '') || 0),
      icon: '🛡️'
    },
    {
      label: 'Finish Rate',
      f1Value: parseValue(fighter1.finishRate),
      f2Value: parseValue(fighter2.finishRate),
      icon: '⚡'
    }
  ];

  const getBarWidth = (value, maxValue) => {
    return maxValue > 0 ? (value / maxValue) * 100 : 0;
  };

  return (
    <div className="stat-bars-comparison">
      <h3>📈 Head-to-Head Stats</h3>
      <div className="stat-bars-container">
        {stats.map((stat, index) => {
          const maxValue = Math.max(stat.f1Value, stat.f2Value);
          const f1Width = getBarWidth(stat.f1Value, maxValue);
          const f2Width = getBarWidth(stat.f2Value, maxValue);
          
          return (
            <div key={index} className="stat-bar-item">
              <div className="stat-bar-label">
                <span className="stat-icon">{stat.icon}</span>
                <span>{stat.label}</span>
              </div>
              <div className="stat-bar-visual">
                <div className="bar-left">
                  <div 
                    className="bar-fill red" 
                    style={{ width: `${f1Width}%` }}
                  >
                    <span className="bar-value">{stat.f1Value.toFixed(1)}</span>
                  </div>
                </div>
                <div className="bar-right">
                  <div 
                    className="bar-fill blue" 
                    style={{ width: `${f2Width}%` }}
                  >
                    <span className="bar-value">{stat.f2Value.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StatBarsComparison;
