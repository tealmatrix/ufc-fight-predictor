import { useState, useEffect } from 'react';
import FighterSelector from './components/FighterSelector';
import FightPrediction from './components/FightPrediction';
import FightCard from './components/FightCard';
import { predictFight, simulateRounds } from './utils/fightPredictor';
import './App.css';

function App() {
  const [fighters, setFighters] = useState([]);
  const [fighter1, setFighter1] = useState(null);
  const [fighter2, setFighter2] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fightCard, setFightCard] = useState([]);
  const [viewMode, setViewMode] = useState('single'); // 'single' or 'card'
  const [numRounds, setNumRounds] = useState(5);

  useEffect(() => {
    console.log('Starting to load fighters data...');
    // Load fighters data
    fetch('/fighters_data_new.json')
      .then(res => {
        console.log('Fetch response:', res.status, res.statusText);
        return res.json();
      })
      .then(data => {
        console.log('Loaded fighters:', data.length, 'fighters');
        console.log('First few fighters:', data.slice(0, 3));
        setFighters(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading fighters:', err);
        setLoading(false);
      });
  }, []);

  const handlePredict = () => {
    if (fighter1 && fighter2) {
      const result = predictFight(fighter1, fighter2, numRounds);
      setPrediction(result);
      
      // Also run simulation
      const sim = simulateRounds(fighter1, fighter2, numRounds);
      setSimulation(sim);
    }
  };

  const handleReset = () => {
    setFighter1(null);
    setFighter2(null);
    setPrediction(null);
    setSimulation(null);
  };

  const handleAddToCard = () => {
    if (fighter1 && fighter2 && prediction) {
      const fight = {
        id: Date.now(),
        fighter1,
        fighter2,
        prediction,
        simulation
      };
      setFightCard([...fightCard, fight]);
      handleReset();
    }
  };

  const handleRemoveFight = (fightId) => {
    setFightCard(fightCard.filter(fight => fight.id !== fightId));
  };

  const getLockOfTheNight = () => {
    if (fightCard.length === 0) return null;
    
    let maxConfidence = 0;
    let lockFightId = null;
    
    fightCard.forEach(fight => {
      const confidence = parseFloat(fight.prediction.prediction.confidence);
      if (confidence > maxConfidence) {
        maxConfidence = confidence;
        lockFightId = fight.id;
      }
    });
    
    return lockFightId;
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Loading fighter data...</div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🥊 UFC Fight Predictor</h1>
        <p>Analyze fighter stats and predict match outcomes</p>
      </header>

      <div className="container">
        <div className="view-toggle">
          <button 
            className={`toggle-btn ${viewMode === 'single' ? 'active' : ''}`}
            onClick={() => setViewMode('single')}
          >
            Single Fight
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'card' ? 'active' : ''}`}
            onClick={() => setViewMode('card')}
          >
            Fight Card ({fightCard.length})
          </button>
        </div>

        {viewMode === 'single' ? (
          <>
        <div className="fighter-selection">
          <FighterSelector
            fighters={fighters}
            selectedFighter={fighter1}
            onSelect={setFighter1}
            label="Red Corner"
            disabled={!!prediction}
          />
          
          <div className="vs-divider">
            <span>VS</span>
          </div>
          
          <FighterSelector
            fighters={fighters}
            selectedFighter={fighter2}
            onSelect={setFighter2}
            label="Blue Corner"
            disabled={!!prediction}
          />
        </div>

        <div className="fight-settings">
          <label className="rounds-selector">
            <span>Fight Length:</span>
            <select 
              value={numRounds} 
              onChange={(e) => setNumRounds(parseInt(e.target.value))}
              disabled={!!prediction}
            >
              <option value={3}>3 Rounds</option>
              <option value={5}>5 Rounds (Main Event)</option>
            </select>
          </label>
        </div>

        <div className="actions">
          {!prediction ? (
            <button
              className="predict-btn"
              onClick={handlePredict}
              disabled={!fighter1 || !fighter2}
            >
              Predict Fight
            </button>
          ) : (
            <>
              <button className="add-to-card-btn" onClick={handleAddToCard}>
                ➕ Add to Fight Card
              </button>
              <button className="reset-btn" onClick={handleReset}>
                Reset Fight
              </button>
            </>
          )}
        </div>

        {prediction && (
          <FightPrediction 
            prediction={prediction} 
            simulation={simulation}
          />
        )}
          </>
        ) : (
          <FightCard 
            fights={fightCard}
            onRemoveFight={handleRemoveFight}
            lockOfTheNight={getLockOfTheNight()}
          />
        )}
      </div>

      <footer className="app-footer">
        <p>Stats sourced from UFC Stats • Predictions are for entertainment purposes only</p>
      </footer>
    </div>
  );
}

export default App;
