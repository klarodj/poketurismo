import './race-ui.css';
import {carArtwork} from '../../shared/carArtwork.mjs';
import {paintFor,paintName} from '../../shared/carPaint.mjs';
import React, { useState } from 'react';
export default function RaceCarArtwork({ car, large = false }) {
  const [failedImage, setFailedImage] = useState(null);
  const src = carArtwork(car);
  return <div className={`race-car-art ${large ? 'race-car-art-large' : ''}`}>
    {src && failedImage !== src ? <img src={src} alt={`${car.name || 'Vettura'} · ${paintName(paintFor(car))}`} onError={() => setFailedImage(src)} /> : <div className="race-car-fallback">
      <svg viewBox="0 0 240 100" role="img" aria-label={`Immagine non disponibile: ${car.name || 'vettura'}`}><path d="M25 64 40 39 83 33 108 14H163L190 40 219 49 226 73H17V64Z" fill="currentColor" /><path d="m91 35 22-15h45l19 20Z" fill="#cbd5e1" /><circle cx="60" cy="75" r="17" fill="#0f172a" /><circle cx="188" cy="75" r="17" fill="#0f172a" /><circle cx="60" cy="75" r="8" fill="#94a3b8" /><circle cx="188" cy="75" r="8" fill="#94a3b8" /></svg>
      <span>Immagine non disponibile</span>
    </div>}
  </div>;
}
