import { useState } from 'react';
import './HelpSection.css';

export function HelpSection() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (section: string) => {
    setExpanded(expanded === section ? null : section);
  };

  return (
    <div className="help-section">
      <h3>Hulp & Uitleg</h3>

      <div className="help-item">
        <button className="help-toggle" onClick={() => toggle('start')}>
          <span>Hoe begin ik?</span>
          <span className="arrow">{expanded === 'start' ? '▲' : '▼'}</span>
        </button>
        {expanded === 'start' && (
          <div className="help-content">
            <ol>
              <li><strong>Vak toevoegen:</strong> Klik op + en vul de vaknaam, kleur en toetsdatum in</li>
              <li><strong>Taken maken:</strong> Voeg studietaken toe met het aantal blz/opdrachten en geschatte tijd</li>
              <li><strong>Planning bekijken:</strong> Ga naar "Planning" om je taken in de agenda te zien</li>
              <li><strong>Studeren:</strong> Klik op een blok om de timer te starten</li>
            </ol>
          </div>
        )}
      </div>

      <div className="help-item">
        <button className="help-toggle" onClick={() => toggle('planning')}>
          <span>Hoe werkt de planning?</span>
          <span className="arrow">{expanded === 'planning' ? '▲' : '▼'}</span>
        </button>
        {expanded === 'planning' && (
          <div className="help-content">
            <ul>
              <li><strong>Plank:</strong> Bovenaan staan taken die nog geen tijd hebben</li>
              <li><strong>Sleep taken:</strong> Van de plank naar een tijdslot in de agenda</li>
              <li><strong>Blokgrootte:</strong> Hoe langer de taak, hoe groter het blok</li>
              <li><strong>Kleuren:</strong> Elk vak heeft een eigen kleur</li>
            </ul>
          </div>
        )}
      </div>

      <div className="help-item">
        <button className="help-toggle" onClick={() => toggle('timer')}>
          <span>Hoe werkt de timer?</span>
          <span className="arrow">{expanded === 'timer' ? '▲' : '▼'}</span>
        </button>
        {expanded === 'timer' && (
          <div className="help-content">
            <ul>
              <li><strong>Start:</strong> Klik op een studieblok in de agenda</li>
              <li><strong>Pauze:</strong> Je kunt pauzeren en weer doorgaan</li>
              <li><strong>Klaar:</strong> Vul in hoeveel je hebt gedaan</li>
              <li><strong>Niet af?</strong> Het blok blijft staan voor later</li>
              <li><strong>Check-in:</strong> Elke 15 min vraagt de app of je nog studeert</li>
            </ul>
          </div>
        )}
      </div>

      <div className="help-item">
        <button className="help-toggle" onClick={() => toggle('stats')}>
          <span>Wat betekenen de stats?</span>
          <span className="arrow">{expanded === 'stats' ? '▲' : '▼'}</span>
        </button>
        {expanded === 'stats' && (
          <div className="help-content">
            <ul>
              <li><strong>Studiesnelheid:</strong> Hoeveel blz/opdrachten per uur</li>
              <li><strong>Totale tijd:</strong> Alle studietijd bij elkaar</li>
              <li><strong>Per vak:</strong> Zie waar je de meeste tijd aan besteedt</li>
            </ul>
            <p className="help-tip">💡 Tip: Gebruik je stats om beter in te schatten hoeveel tijd je nodig hebt!</p>
          </div>
        )}
      </div>

      <div className="help-item">
        <button className="help-toggle" onClick={() => toggle('tips')}>
          <span>Studietips</span>
          <span className="arrow">{expanded === 'tips' ? '▲' : '▼'}</span>
        </button>
        {expanded === 'tips' && (
          <div className="help-content">
            <ul>
              <li>📚 Plan niet meer dan 90 min achter elkaar</li>
              <li>⏰ Neem elke 1,5 uur een pauze van 30 min</li>
              <li>🎯 Begin met het moeilijkste vak als je fris bent</li>
              <li>📱 Leg je telefoon weg tijdens het studeren</li>
              <li>✅ Vier kleine successen - elk afgerond blok telt!</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
