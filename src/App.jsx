import { useState, useEffect } from 'react';
import FighterSelector from './components/FighterSelector';
import FightPrediction from './components/FightPrediction';
import FightCard from './components/FightCard';
import AdminPage from './components/AdminPage';
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
  const [viewMode, setViewMode] = useState('single'); // 'single', 'card', or 'admin'
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
        
        // Load custom fighters from localStorage
        const customFighters = localStorage.getItem('custom_fighters');
        if (customFighters) {
          try {
            const parsed = JSON.parse(customFighters);
            console.log('Loaded custom fighters:', parsed.length);
            
            // Filter out invalid fighters (missing name)
            const validCustom = parsed.filter(f => f && f.name);
            if (validCustom.length < parsed.length) {
              console.warn('Removed', parsed.length - validCustom.length, 'invalid fighters from localStorage');
            }
            
            // Remove duplicates by name (keep first occurrence)
            const seen = new Set();
            const deduped = validCustom.filter(f => {
              const nameLower = f.name.toLowerCase();
              if (seen.has(nameLower)) {
                console.warn('Removing duplicate:', f.name);
                return false;
              }
              seen.add(nameLower);
              return true;
            });
            
            // Save cleaned list back to localStorage if we removed duplicates
            if (deduped.length < validCustom.length) {
              console.log('Removed', validCustom.length - deduped.length, 'duplicates from localStorage');
              localStorage.setItem('custom_fighters', JSON.stringify(deduped));
            }
            
            // Merge fighters - custom fighters override main database by name
            const customNames = new Set(deduped.map(f => f.name.toLowerCase()));
            const mainFighters = data.filter(f => f && f.name && !customNames.has(f.name.toLowerCase()));
            const mergedFighters = [...mainFighters, ...deduped];
            
            console.log('Merged fighters:', mergedFighters.length, '(', data.length, 'from DB +', deduped.length, 'custom, -', data.length - mainFighters.length, 'overrides)');
            setFighters(mergedFighters);
          } catch (e) {
            console.error('Error parsing custom fighters:', e);
            setFighters(data);
          }
        } else {
          setFighters(data);
        }
        
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

  const handleAddFighter = async (newFighter) => {
    try {
      console.log('handleAddFighter called with:', newFighter);
      
      // Update the in-memory fighters list
      setFighters(prev => {
        const updated = [...prev, newFighter];
        console.log('Updated fighters list, now has', updated.length, 'fighters');
        return updated;
      });
      
      // Save only custom fighters to localStorage
      const existingCustom = localStorage.getItem('custom_fighters');
      let customFighters = [];
      if (existingCustom) {
        customFighters = JSON.parse(existingCustom);
      }
      customFighters.push(newFighter);
      localStorage.setItem('custom_fighters', JSON.stringify(customFighters));
      
      // Auto-backup to downloads
      autoBackup(customFighters);
      
      console.log('Fighter successfully added:', newFighter.name);
      console.log('Total custom fighters in localStorage:', customFighters.length);
      return true;
    } catch (error) {
      console.error('Error adding fighter:', error);
      return false;
    }
  };

  const handleUpdateFighter = async (oldName, updatedFighter) => {
    try {
      console.log('handleUpdateFighter called:', oldName, '->', updatedFighter.name);
      
      // Update in-memory fighters list
      setFighters(prev => {
        const updated = prev.map(f => 
          f.name === oldName ? updatedFighter : f
        );
        console.log('Updated fighters list');
        return updated;
      });
      
      // Check if it's a custom fighter in localStorage
      const existingCustom = localStorage.getItem('custom_fighters');
      if (existingCustom) {
        let customFighters = JSON.parse(existingCustom);
        const isCustom = customFighters.some(f => f.name === oldName);
        
        if (isCustom) {
          // Update in localStorage
          customFighters = customFighters.map(f => 
            f.name === oldName ? updatedFighter : f
          );
          localStorage.setItem('custom_fighters', JSON.stringify(customFighters));
          autoBackup(customFighters);
          console.log('Fighter successfully updated in localStorage');
        } else {
          // Not a custom fighter, add to localStorage to override main database version
          customFighters.push(updatedFighter);
          localStorage.setItem('custom_fighters', JSON.stringify(customFighters));
          autoBackup(customFighters);
          console.log('Fighter added to localStorage as override');
        }
      } else {
        // No custom fighters yet, create the list
        const newList = [updatedFighter];
        localStorage.setItem('custom_fighters', JSON.stringify(newList));
        autoBackup(newList);
        console.log('Created custom fighters list with updated fighter');
      }
      
      return true;
    } catch (error) {
      console.error('Error updating fighter:', error);
      return false;
    }
  };

  const autoBackup = (fightersData) => {
    // Only backup if there are fighters
    if (!fightersData || fightersData.length === 0) return;
    
    try {
      const json = JSON.stringify(fightersData, null, 2);
      const blob = new Blob([json], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `auto_backup_${new Date().toISOString().split('T')[0]}.json`;
      // Don't auto-click, just make it available
      // Store the URL for manual download if needed
      console.log('Auto-backup ready. Total fighters:', fightersData.length);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Auto-backup failed:', error);
    }
  };

  const handleDeleteFighter = async (fighterName) => {
    try {
      console.log('handleDeleteFighter called:', fighterName);
      
      // Check if it exists in localStorage custom fighters
      const existingCustom = localStorage.getItem('custom_fighters');
      let isCustomFighter = false;
      
      if (existingCustom) {
        let customFighters = JSON.parse(existingCustom);
        isCustomFighter = customFighters.some(f => f.name === fighterName);
        
        if (isCustomFighter) {
          // Remove from localStorage
          customFighters = customFighters.filter(f => f.name !== fighterName);
          localStorage.setItem('custom_fighters', JSON.stringify(customFighters));
          console.log('Fighter successfully removed from localStorage');
          
          // Reload fighters - will restore original if it was overridden
          fetch('/fighters_data_new.json')
            .then(res => res.json())
            .then(data => {
              const remaining = localStorage.getItem('custom_fighters');
              if (remaining) {
                const parsed = JSON.parse(remaining);
                // Merge without duplicates - custom overrides main
                const customNames = new Set(parsed.map(f => f.name.toLowerCase()));
                const mainFighters = data.filter(f => !customNames.has(f.name.toLowerCase()));
                setFighters([...mainFighters, ...parsed]);
              } else {
                setFighters(data);
              }
            });
        } else {
          // Not a custom fighter, can't delete from main database
          console.log('Cannot delete - fighter is from main database');
          alert('This fighter is from the main database and cannot be deleted. You can only delete custom fighters you\'ve added.');
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting fighter:', error);
      return false;
    }
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
          <button 
            className={`toggle-btn ${viewMode === 'admin' ? 'active' : ''}`}
            onClick={() => setViewMode('admin')}
          >
            Admin
          </button>
        </div>

        {viewMode === 'admin' ? (
          <AdminPage 
            fighters={fighters}
            onAddFighter={handleAddFighter}
            onUpdateFighter={handleUpdateFighter}
            onDeleteFighter={handleDeleteFighter}
          />
        ) : viewMode === 'single' ? (
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
