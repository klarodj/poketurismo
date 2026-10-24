import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LOCATION_GUIDES } from '../../shared/locationGuides.mjs';
import RaceDetailDialog from './RaceDetailDialog';
import './location-guide.css';

export default function LocationGuide({ guideId }) {
  const guide = LOCATION_GUIDES[guideId];
  const [open, setOpen] = useState(false);
  if (!guide) return null;
  const portrait = <img src={`/images/guides/${guide.id}.png`} alt="" width="64" height="64" decoding="async" />;
  return <>
    <button type="button" className="location-guide-trigger" aria-label={`Chiedi a ${guide.shortName} · ${guide.role}`} aria-haspopup="dialog" onClick={() => setOpen(true)}>
      {portrait}<span>Chiedi a<br/><strong>{guide.shortName}</strong></span>
    </button>
    {open && <RaceDetailDialog title={`Due parole con ${guide.shortName}`} closeLabel="Ho capito" onClose={() => setOpen(false)}>
      <div className="location-guide-profile">{portrait}<div><h3>{guide.name}</h3><p>{guide.role}</p></div></div>
      <p className="location-guide-speech">«{guide.intro}»</p>
      <details className="location-guide-details"><summary>Spiegami meglio</summary>{guide.details.map(([title, text]) => <section key={title}><h4>{title}</h4><p>{text}</p></section>)}</details>
      {!!guide.links.length && <nav className="location-guide-links" aria-label="Indicazioni della guida">{guide.links.map(([path, label]) => <Link key={path} to={path} onClick={() => setOpen(false)}>{label} →</Link>)}</nav>}
    </RaceDetailDialog>}
  </>;
}
