import { useState } from 'react';

function FighterSelector({ fighters, selectedFighter, onSelect, label }) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter fighters based on search term
  const filteredFighters = fighters.filter(fighter => 
    fighter.name && fighter.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedFighter) {
    // Show selected fighter
    return (
      <div style={{ border: '1px solid #ccc', padding: '20px', margin: '10px' }}>
        <h3>{label}</h3>
        <h2>{selectedFighter.name}</h2>
        <p>Record: {selectedFighter.wins}-{selectedFighter.losses}-{selectedFighter.draws}</p>
        <p>Height: {selectedFighter.height}</p>
        <p>Weight: {selectedFighter.weight}</p>
        <button onClick={() => onSelect(null)}>Change Fighter</button>
      </div>
    );
  }

  // Show search interface
  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', margin: '10px' }}>
      <h3>{label}</h3>
      <input
        type="text"
        placeholder="Search fighters..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
      />
      
      <div style={{ maxHeight: '300px', overflow: 'auto' }}>
        {filteredFighters.slice(0, 20).map((fighter, index) => (
          <div
            key={index}
            onClick={() => onSelect(fighter)}
            style={{
              padding: '10px',
              border: '1px solid #eee',
              marginBottom: '5px',
              cursor: 'pointer',
              backgroundColor: '#f9f9f9'
            }}
          >
            <strong>{fighter.name}</strong>
            <br />
            Record: {fighter.wins}-{fighter.losses}-{fighter.draws}
          </div>
        ))}
      </div>
      
      {filteredFighters.length === 0 && searchTerm && (
        <p>No fighters found for "{searchTerm}"</p>
      )}
    </div>
  );
}

export default FighterSelector;