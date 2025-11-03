import { useState } from 'react';
import BatchImport from './BatchImport';
import './AdminPage.css';

function AdminPage({ fighters, onAddFighter, onUpdateFighter, onDeleteFighter }) {
  const [showBatchImport, setShowBatchImport] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    wins: '',
    losses: '',
    draws: '',
    height: '',
    weight: '',
    reach: '',
    stance: 'Orthodox',
    dob: '',
    sig_strikes_landed_per_min: '',
    striking_accuracy: '',
    sig_strikes_absorbed_per_min: '',
    striking_defense: '',
    takedown_avg: '',
    takedown_accuracy: '',
    takedown_defense: '',
    submission_avg: ''
  });

  const [message, setMessage] = useState({ text: '', type: '' });
  const [editMode, setEditMode] = useState(false);
  const [selectedFighter, setSelectedFighter] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [fightHistory, setFightHistory] = useState([
    { result: '', opponent: '', method: '', round: '' },
    { result: '', opponent: '', method: '', round: '' },
    { result: '', opponent: '', method: '', round: '' }
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectFighter = (fighter) => {
    setSelectedFighter(fighter);
    setEditMode(true);
    setFormData({
      name: fighter.name || '',
      nickname: fighter.nickname || '',
      wins: fighter.wins || '',
      losses: fighter.losses || '',
      draws: fighter.draws || '',
      height: fighter.height || '',
      weight: fighter.weight || '',
      reach: fighter.reach || '',
      stance: fighter.stance || 'Orthodox',
      dob: fighter.dob || '',
      sig_strikes_landed_per_min: fighter.sig_strikes_landed_per_min || '',
      striking_accuracy: fighter.striking_accuracy || '',
      sig_strikes_absorbed_per_min: fighter.sig_strikes_absorbed_per_min || '',
      striking_defense: fighter.striking_defense || '',
      takedown_avg: fighter.takedown_avg || '',
      takedown_accuracy: fighter.takedown_accuracy || '',
      takedown_defense: fighter.takedown_defense || '',
      submission_avg: fighter.submission_avg || ''
    });
    
    // Load fight history
    const fights = fighter.last_3_fights || [];
    setFightHistory([
      fights[0] || { result: '', opponent: '', method: '', round: '' },
      fights[1] || { result: '', opponent: '', method: '', round: '' },
      fights[2] || { result: '', opponent: '', method: '', round: '' }
    ]);
    
    setMessage({ text: '', type: '' });
  };

  const handleFightChange = (index, field, value) => {
    setFightHistory(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setSelectedFighter(null);
    setFormData({
      name: '',
      nickname: '',
      wins: '',
      losses: '',
      draws: '',
      height: '',
      weight: '',
      reach: '',
      stance: 'Orthodox',
      dob: '',
      sig_strikes_landed_per_min: '',
      striking_accuracy: '',
      sig_strikes_absorbed_per_min: '',
      striking_defense: '',
      takedown_avg: '',
      takedown_accuracy: '',
      takedown_defense: '',
      submission_avg: ''
    });
    setFightHistory([
      { result: '', opponent: '', method: '', round: '' },
      { result: '', opponent: '', method: '', round: '' },
      { result: '', opponent: '', method: '', round: '' }
    ]);
    setMessage({ text: '', type: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    
    // Validate required fields
    if (!formData.name || formData.name.trim() === '') {
      setMessage({ text: 'Fighter name is required', type: 'error' });
      return;
    }

    if (editMode) {
      // Update existing fighter
      // Filter out empty fights
      const validFights = fightHistory.filter(f => f.result || f.opponent);
      
      const updatedFighter = {
        ...selectedFighter,
        name: formData.name,
        nickname: formData.nickname || '',
        wins: parseInt(formData.wins) || 0,
        losses: parseInt(formData.losses) || 0,
        draws: parseInt(formData.draws) || 0,
        height: formData.height || '',
        weight: formData.weight || '',
        reach: formData.reach || '',
        stance: formData.stance || 'Orthodox',
        dob: formData.dob || '',
        sig_strikes_landed_per_min: formData.sig_strikes_landed_per_min || '0.00',
        striking_accuracy: formData.striking_accuracy || '0%',
        sig_strikes_absorbed_per_min: formData.sig_strikes_absorbed_per_min || '0.00',
        striking_defense: formData.striking_defense || '0%',
        takedown_avg: formData.takedown_avg || '0.00',
        takedown_accuracy: formData.takedown_accuracy || '0%',
        takedown_defense: formData.takedown_defense || '0%',
        submission_avg: formData.submission_avg || '0.0',
        last_3_fights: validFights
      };

      try {
        const success = await onUpdateFighter(selectedFighter.name, updatedFighter);
        if (success) {
          setMessage({ text: `${formData.name} updated successfully! Reloading to apply changes...`, type: 'success' });
          // Reload page to ensure localStorage merge happens correctly
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          setMessage({ text: 'Failed to update fighter', type: 'error' });
        }
      } catch (error) {
        setMessage({ text: 'Error updating fighter: ' + error.message, type: 'error' });
      }
      return;
    }

    // Check for duplicate (only when adding new)
    const exists = fighters.find(f => 
      f.name && f.name.toLowerCase() === formData.name.toLowerCase()
    );
    if (exists) {
      setMessage({ text: 'Fighter already exists in database', type: 'error' });
      return;
    }

    // Build fighter object with proper formatting
    // Filter out empty fights
    const validFights = fightHistory.filter(f => f.result || f.opponent);
    
    const newFighter = {
      name: formData.name,
      nickname: formData.nickname || '',
      wins: parseInt(formData.wins) || 0,
      losses: parseInt(formData.losses) || 0,
      draws: parseInt(formData.draws) || 0,
      height: formData.height || '',
      weight: formData.weight || '',
      reach: formData.reach || '',
      stance: formData.stance || 'Orthodox',
      dob: formData.dob || '',
      sig_strikes_landed_per_min: formData.sig_strikes_landed_per_min || '0.00',
      striking_accuracy: formData.striking_accuracy || '0%',
      sig_strikes_absorbed_per_min: formData.sig_strikes_absorbed_per_min || '0.00',
      striking_defense: formData.striking_defense || '0%',
      takedown_avg: formData.takedown_avg || '0.00',
      takedown_accuracy: formData.takedown_accuracy || '0%',
      takedown_defense: formData.takedown_defense || '0%',
      submission_avg: formData.submission_avg || '0.0',
      last_3_fights: validFights
    };

    try {
      const success = await onAddFighter(newFighter);
      if (success) {
        setMessage({ text: `${formData.name} added successfully!`, type: 'success' });
        // Clear form and show success - no reload needed since setFighters updates state
        handleCancelEdit();
      } else {
        setMessage({ text: 'Failed to add fighter', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Error adding fighter: ' + error.message, type: 'error' });
    }
  };

  // Show custom fighters OR fighters with zero/missing stats (likely incomplete)
  const editableFighters = fighters.filter(f => {
    // Check if it's a custom fighter
    const customList = localStorage.getItem('custom_fighters');
    if (customList) {
      try {
        const parsed = JSON.parse(customList);
        if (parsed.some(cf => cf.name === f.name)) return true;
      } catch (e) {
        // Ignore parse errors
      }
    }
    
    // Also include fighters with zero stats (likely need updating)
    // Check for missing/zero striking or grappling stats
    const hasZeroStats = 
      f.sig_strikes_landed_per_min === '0.00' || 
      f.striking_accuracy === '0%' || 
      f.takedown_avg === '0.00';
    
    if (hasZeroStats) return true;
    
    return false;
  });

  const filteredFighters = editableFighters.filter(f => 
    f.name && f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBatchImport = async (importedFighters) => {
    for (const fighter of importedFighters) {
      await onAddFighter(fighter);
    }
    // Close batch import modal - no reload needed since setFighters updates state
    setShowBatchImport(false);
    setMessage({ text: `Successfully imported ${importedFighters.length} fighter(s)!`, type: 'success' });
  };

  const handleExport = () => {
    const customFighters = localStorage.getItem('custom_fighters');
    if (customFighters) {
      const blob = new Blob([customFighters], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `custom_fighters_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      alert('No custom fighters to export');
    }
  };

  return (
    <div className="admin-page">
      {showBatchImport && (
        <BatchImport 
          onImport={handleBatchImport}
          onClose={() => setShowBatchImport(false)}
        />
      )}

      <div className="admin-header">
        <h2>{editMode ? 'Edit Fighter' : 'Add New Fighter'}</h2>
        <div className="admin-actions">
          <button className="batch-import-btn" onClick={() => setShowBatchImport(true)}>
            📥 Batch Import
          </button>
          <button className="export-btn" onClick={handleExport}>
            💾 Export Backup
          </button>
        </div>
      </div>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {!editMode && editableFighters.length > 0 && (
        <div className="custom-fighters-list">
          <h3>Editable Fighters (Click to Edit)</h3>
          <input
            type="text"
            className="search-input"
            placeholder="Search custom fighters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="fighters-grid">
            {filteredFighters.map((fighter, index) => (
              <div 
                key={index} 
                className="fighter-card"
              >
                <div onClick={() => handleSelectFighter(fighter)} style={{flex: 1}}>
                  <div className="fighter-name">{fighter.name}</div>
                  {fighter.nickname && <div className="fighter-nickname">"{fighter.nickname}"</div>}
                  <div className="fighter-record">{fighter.wins}-{fighter.losses}-{fighter.draws}</div>
                </div>
                <button 
                  className="delete-fighter-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Delete ${fighter.name}?`)) {
                      onDeleteFighter(fighter.name);
                    }
                  }}
                  title="Delete fighter"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="fighter-form">
        <div className="form-section">
          <h3>Basic Info</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Jon Jones"
                required
              />
            </div>
            <div className="form-group">
              <label>Nickname</label>
              <input
                type="text"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                placeholder="e.g., Bones"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Record</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Wins</label>
              <input
                type="number"
                name="wins"
                value={formData.wins}
                onChange={handleChange}
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Losses</label>
              <input
                type="number"
                name="losses"
                value={formData.losses}
                onChange={handleChange}
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Draws</label>
              <input
                type="number"
                name="draws"
                value={formData.draws}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Physical Attributes</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Height</label>
              <input
                type="text"
                name="height"
                value={formData.height}
                onChange={handleChange}
                placeholder="e.g., 6' 4&quot;"
              />
            </div>
            <div className="form-group">
              <label>Weight</label>
              <input
                type="text"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="e.g., 205 lbs."
              />
            </div>
            <div className="form-group">
              <label>Reach</label>
              <input
                type="text"
                name="reach"
                value={formData.reach}
                onChange={handleChange}
                placeholder="e.g., 84.5&quot;"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Stance</label>
              <select
                name="stance"
                value={formData.stance}
                onChange={handleChange}
              >
                <option value="Orthodox">Orthodox</option>
                <option value="Southpaw">Southpaw</option>
                <option value="Switch">Switch</option>
              </select>
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="text"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                placeholder="e.g., Jul 19, 1987"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Striking Stats</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Sig. Strikes Landed/Min</label>
              <input
                type="text"
                name="sig_strikes_landed_per_min"
                value={formData.sig_strikes_landed_per_min}
                onChange={handleChange}
                placeholder="e.g., 4.55"
              />
            </div>
            <div className="form-group">
              <label>Striking Accuracy</label>
              <input
                type="text"
                name="striking_accuracy"
                value={formData.striking_accuracy}
                onChange={handleChange}
                placeholder="e.g., 52%"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Sig. Strikes Absorbed/Min</label>
              <input
                type="text"
                name="sig_strikes_absorbed_per_min"
                value={formData.sig_strikes_absorbed_per_min}
                onChange={handleChange}
                placeholder="e.g., 2.34"
              />
            </div>
            <div className="form-group">
              <label>Striking Defense</label>
              <input
                type="text"
                name="striking_defense"
                value={formData.striking_defense}
                onChange={handleChange}
                placeholder="e.g., 63%"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Grappling Stats</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Takedown Average</label>
              <input
                type="text"
                name="takedown_avg"
                value={formData.takedown_avg}
                onChange={handleChange}
                placeholder="e.g., 2.45"
              />
            </div>
            <div className="form-group">
              <label>Takedown Accuracy</label>
              <input
                type="text"
                name="takedown_accuracy"
                value={formData.takedown_accuracy}
                onChange={handleChange}
                placeholder="e.g., 43%"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Takedown Defense</label>
              <input
                type="text"
                name="takedown_defense"
                value={formData.takedown_defense}
                onChange={handleChange}
                placeholder="e.g., 95%"
              />
            </div>
            <div className="form-group">
              <label>Submission Average</label>
              <input
                type="text"
                name="submission_avg"
                value={formData.submission_avg}
                onChange={handleChange}
                placeholder="e.g., 0.8"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Last 3 Fights (Optional)</h3>
          {fightHistory.map((fight, index) => (
            <div key={index} className="fight-history-row">
              <h4>Fight {index + 1}</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Result</label>
                  <select
                    value={fight.result}
                    onChange={(e) => handleFightChange(index, 'result', e.target.value)}
                  >
                    <option value="">-- Select --</option>
                    <option value="W">Win</option>
                    <option value="L">Loss</option>
                    <option value="D">Draw</option>
                    <option value="NC">No Contest</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Opponent</label>
                  <input
                    type="text"
                    value={fight.opponent}
                    onChange={(e) => handleFightChange(index, 'opponent', e.target.value)}
                    placeholder="e.g., John Smith"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Method</label>
                  <input
                    type="text"
                    value={fight.method}
                    onChange={(e) => handleFightChange(index, 'method', e.target.value)}
                    placeholder="e.g., KO/TKO, SUB, DEC"
                  />
                </div>
                <div className="form-group">
                  <label>Round</label>
                  <input
                    type="text"
                    value={fight.round}
                    onChange={(e) => handleFightChange(index, 'round', e.target.value)}
                    placeholder="e.g., 1, 2, 3"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="form-actions">
          {editMode && (
            <button type="button" className="cancel-btn" onClick={handleCancelEdit}>
              Cancel
            </button>
          )}
          <button type="submit" className="submit-btn">
            {editMode ? 'Update Fighter' : 'Add Fighter'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminPage;
