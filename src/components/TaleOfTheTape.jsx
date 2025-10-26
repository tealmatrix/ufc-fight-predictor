import './TaleOfTheTape.css';

function TaleOfTheTape({ fighter1, fighter2 }) {
  if (!fighter1 || !fighter2) return null;

  const stats = [
    { label: 'Record', f1: `${fighter1.data.wins}-${fighter1.data.losses}-${fighter1.data.draws}`, f2: `${fighter2.data.wins}-${fighter2.data.losses}-${fighter2.data.draws}` },
    { label: 'Height', f1: fighter1.data.height, f2: fighter2.data.height },
    { label: 'Weight', f1: fighter1.data.weight, f2: fighter2.data.weight },
    { label: 'Reach', f1: fighter1.data.reach, f2: fighter2.data.reach },
    { label: 'Age', f1: fighter1.age || '--', f2: fighter2.age || '--' },
    { label: 'Stance', f1: fighter1.data.stance || '--', f2: fighter2.data.stance || '--' },
    { label: 'Style', f1: fighter1.style, f2: fighter2.style },
    { label: 'SLpM', f1: fighter1.data.sig_strikes_landed_per_min, f2: fighter2.data.sig_strikes_landed_per_min },
    { label: 'Str. Acc.', f1: fighter1.data.striking_accuracy, f2: fighter2.data.striking_accuracy },
    { label: 'TD Avg', f1: fighter1.data.takedown_avg, f2: fighter2.data.takedown_avg },
    { label: 'TD Acc.', f1: fighter1.data.takedown_accuracy, f2: fighter2.data.takedown_accuracy },
    { label: 'Sub Avg', f1: fighter1.data.submission_avg, f2: fighter2.data.submission_avg }
  ];

  return (
    <div className="tale-of-tape">
      <h3>📊 Tale of the Tape</h3>
      <div className="tape-header">
        <div className="fighter-name red">{fighter1.name}</div>
        <div className="vs-label">VS</div>
        <div className="fighter-name blue">{fighter2.name}</div>
      </div>
      <div className="tape-stats">
        {stats.map((stat, index) => (
          <div key={index} className="tape-row">
            <div className="tape-value left">{stat.f1}</div>
            <div className="tape-label">{stat.label}</div>
            <div className="tape-value right">{stat.f2}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TaleOfTheTape;
