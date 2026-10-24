import React from 'react';
import { Link } from 'react-router-dom';
import usePlayerStore from '../store/playerStore';
import './location-guide.css';
export default function ClubRecoveryHint() {
  const money = usePlayerStore(state => state.money);
  if (money >= 500) return null;
  return <aside className="club-recovery-hint" aria-label="Ripartire con pochi soldi">
    <strong>Il club ti rimette in pista</strong>
    <p>Gara singola senza quota: 100 € al traguardo, 500 € totali se vinci. Consumi e usura reali; metà del premio rimborsa eventuali anticipi.</p>
    <Link to="/track-race">Gara gratuita del club →</Link>{' · '}<Link to="/workshop">Senza vetture pronte? Chiedi a Franco →</Link>
  </aside>;
}
