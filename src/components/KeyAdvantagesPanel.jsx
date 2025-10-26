import './KeyAdvantagesPanel.css';

function KeyAdvantagesPanel({ keyAdvantages }) {
  if (!keyAdvantages || keyAdvantages.length === 0) {
    return null;
  }

  return (
    <div className="key-advantages-panel">
      <h3>⚡ Key Advantages</h3>
      <div className="advantages-grid">
        {keyAdvantages.map((advantage, index) => (
          <div key={index} className="advantage-item">
            <div className="advantage-type">{advantage.type}</div>
            <div className="advantage-details">
              <span className="advantage-leader">{advantage.leader}</span>
              <span className="advantage-value">{advantage.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default KeyAdvantagesPanel;
