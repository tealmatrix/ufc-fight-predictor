import { useState } from 'react';
import './FighterSelector.css';

function FighterSelector({ fighters, selectedFighter, onSelect, label, disabled }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFighters = fighters.filter(fighter =>
    fighter.name && fighter.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fighter-selector">
      <h3>{label}</h3>
      
      {!selectedFighter ? (
        <>
          <input
            type="text"
            placeholder="Search fighters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            disabled={disabled}
          />
          
          <div className="fighters-list">
            {filteredFighters.slice(0, 10).map((fighter, index) => (
              <div
                key={`${fighter.name}-${index}`}
                className="fighter-item"
                onClick={() => !disabled && onSelect(fighter)}
              >
                <div className="fighter-name">{fighter.name || 'Unknown Fighter'}</div>
                {fighter.nickname && (
                  <div className="fighter-nickname">"{fighter.nickname}"</div>
                )}
                <div className="fighter-record">
                  {fighter.wins || 0}-{fighter.losses || 0}-{fighter.draws || 0}
                </div>
              </div>
            ))}
            {filteredFighters.length === 0 && (
              <div className="no-results">No fighters found</div>
            )}
          </div>
        </>
      ) : (
        <div className="selected-fighter">
          <h4 className="fighter-name">{selectedFighter.name || 'Unknown Fighter'}</h4>
          {selectedFighter.nickname && (
            <div className="fighter-nickname">"{selectedFighter.nickname}"</div>
          )}
          <div className="fighter-stats">
            <div className="stat">
              <span className="stat-label">Record:</span>
              <span className="stat-value">
                {selectedFighter.wins || 0}-{selectedFighter.losses || 0}-{selectedFighter.draws || 0}
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Height:</span>
              <span className="stat-value">{selectedFighter.height || 'N/A'}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Reach:</span>
              <span className="stat-value">{selectedFighter.reach || 'N/A'}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Stance:</span>
              <span className="stat-value">{selectedFighter.stance || 'N/A'}</span>
            </div>
          </div>
          
          {selectedFighter.last_3_fights && selectedFighter.last_3_fights.length > 0 && (
            <div className="last-fights">
              <h5 className="fights-title">Last 3 Fights</h5>
              <div className="fights-list">
                {selectedFighter.last_3_fights.map((fight, index) => (
                  <div key={index} className="fight-item">
                    <span className={`fight-result ${fight.result?.toLowerCase()}`}>
                      {fight.result?.toUpperCase()}
                    </span>
                    <span className="fight-opponent">
                      vs {fight.opponent || 'Unknown'}
                    </span>
                    {fight.method && (
                      <span className="fight-method">
                        {fight.method} {fight.round && `R${fight.round}`}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FighterSelector;
