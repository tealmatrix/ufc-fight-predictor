import { useState } from 'react';
import './BatchImport.css';

function BatchImport({ onImport, onClose }) {
  const [textData, setTextData] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleImport = () => {
    try {
      // Parse the JSON data
      const fighters = JSON.parse(textData);
      
      if (!Array.isArray(fighters)) {
        setMessage({ text: 'Data must be an array of fighters', type: 'error' });
        return;
      }

      // Import fighters
      onImport(fighters);
      setMessage({ text: `Successfully imported ${fighters.length} fighters!`, type: 'success' });
      
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      setMessage({ text: 'Invalid JSON format: ' + error.message, type: 'error' });
    }
  };

  const exampleData = `[
  {
    "name": "Fighter Name",
    "nickname": "The Nickname",
    "wins": 15,
    "losses": 3,
    "draws": 0,
    "height": "6' 2\\"",
    "weight": "185 lbs.",
    "reach": "74\\"",
    "stance": "Orthodox",
    "dob": "Jan 15, 1990",
    "sig_strikes_landed_per_min": "4.50",
    "striking_accuracy": "52%",
    "sig_strikes_absorbed_per_min": "3.20",
    "striking_defense": "58%",
    "takedown_avg": "2.10",
    "takedown_accuracy": "42%",
    "takedown_defense": "75%",
    "submission_avg": "0.5",
    "last_3_fights": [
      {"result": "W", "opponent": "John Doe", "method": "KO/TKO", "round": "2"},
      {"result": "W", "opponent": "Jane Smith", "method": "DEC", "round": "3"},
      {"result": "L", "opponent": "Bob Johnson", "method": "SUB", "round": "1"}
    ]
  }
]`;

  return (
    <div className="batch-import-overlay">
      <div className="batch-import-modal">
        <div className="modal-header">
          <h2>Batch Import Fighters</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="instructions">
          <p>Paste fighter data in JSON format below:</p>
          <details>
            <summary>Show example format</summary>
            <pre>{exampleData}</pre>
          </details>
        </div>

        <textarea
          className="import-textarea"
          value={textData}
          onChange={(e) => setTextData(e.target.value)}
          placeholder="Paste JSON array of fighters here..."
        />

        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="import-btn" onClick={handleImport}>Import Fighters</button>
        </div>
      </div>
    </div>
  );
}

export default BatchImport;
