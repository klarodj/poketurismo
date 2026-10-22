import React, { useState } from 'react';
import RaceDetailDialog from './RaceDetailDialog';
import { lessonText } from '../../shared/techniqueLessons.mjs';
import { PILOT_STAT_LABELS } from '../logic/raceEngine';
import './technique-school.css';

export default function TechniqueSchoolPanel({ development, pending, activeRace, onRead, onStart }) {
  const [path, setPath] = useState('all');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [reading, setReading] = useState(null);
  const [error, setError] = useState('');
  const curriculum = development?.curriculum || [];
  const selected = curriculum.find(item => item.id === reading);
  const paths = [...new Map(curriculum.map(item => [item.path, item.pathName])).entries()];
  const learned = curriculum.filter(item => item.learned).length;
  const filtered = curriculum.filter(item => (path === 'all' || item.path === path) &&
    (status === 'all' || (status === 'learned' ? item.learned : item.unlocked && !item.learned)) &&
    `${item.name} ${item.pathName} ${item.description}`.toLocaleLowerCase('it-IT').includes(search.toLocaleLowerCase('it-IT')));
  return <section className="technique-school" aria-label="Scuola guida e tecniche">
    <header className="school-heading"><h1>Scuola guida</h1><strong>{learned} / {curriculum.length} tecniche apprese</strong></header>
    <p>Il livello apre i corsi; la lezione prepara alla prova. Supera gli esercizi per apprendere la tecnica, poi usala nelle condizioni adatte per consolidarla.</p>
    <p className="school-help">Le azioni base sono sempre disponibili. Le prove sono gratuite e si svolgono con un’auto in prestito. Puoi equipaggiare fino a 4 tecniche e usarne una per settore.</p>
    {activeRace && <p className="school-warning" role="status">Hai una sessione in corso: riprendila dalla barra in alto prima di iniziare un’altra prova.</p>}
    <div className="school-filters">
      <label>Percorso<select value={path} onChange={event => setPath(event.target.value)}><option value="all">Tutti i percorsi</option>{paths.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
      <label>Mostra<select value={status} onChange={event => setStatus(event.target.value)}><option value="all">Tutte le tecniche</option><option value="available">Da imparare ora</option><option value="learned">Già apprese</option></select></label>
      <label>Cerca<input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Nome o specialità…" /></label>
    </div>
    <div className="school-catalog">{filtered.map(item => {
      const prerequisite = curriculum.find(candidate => candidate.id === item.prerequisite);
      return <article className={'school-card' + (item.learned ? ' is-learned' : !item.unlocked ? ' is-locked' : '')} key={item.id}>
        <div className="school-card-heading"><span>{item.pathName} · {item.tier}/5</span><strong>Liv. {item.minLevel}</strong></div>
        <h2>{item.name}</h2><p>{item.description}</p>
        <dl><div><dt>Difficoltà</dt><dd>{item.difficulty} · {item.requiredCorrect}/{item.exercises} esercizi corretti</dd></div>
          <div><dt>Quando usarla</dt><dd>{item.contextDescription}</dd></div>
          <div><dt>{item.learned ? 'Beneficio attuale' : 'Beneficio iniziale'}</dt><dd>{Object.entries(item.learned ? item.effectiveBonus : item.bonus).map(([key, amount]) => `+${amount} ${PILOT_STAT_LABELS[key]}`).join(' · ')}</dd></div>
          <div><dt>Prima promozione</dt><dd>Apprendimento e {item.xp} XP · ripetizioni senza XP</dd></div>
          {prerequisite && <div><dt>Corso precedente</dt><dd>{prerequisite.name}{prerequisite.learned ? ' · completato' : ' · da completare'}</dd></div>}
        </dl>
        {item.learned ? <div className="school-mastery"><label>{item.mastery} · pratica {item.practice}/60<progress max={60} value={item.practice} /></label><p>Consolidata a 20, padroneggiata a 60. La padronanza aggiunge al massimo 2 punti complessivi.</p></div>
          : <p className="school-state">{item.unlocked ? item.read ? 'Lezione letta · prova disponibile' : 'Corso disponibile' : `Richiede livello ${item.minLevel}${prerequisite && !prerequisite.learned ? ` e ${prerequisite.name}` : ''}`}</p>}
        <div className="school-actions"><button type="button" className="win98-btn" disabled={!item.unlocked || pending > 0} onClick={() => { setReading(item.id); setError(''); }}>{item.read ? 'Ripassa la lezione' : 'Leggi la lezione'}</button><button type="button" className="win98-btn" disabled={!item.unlocked || !item.read || pending > 0 || !!activeRace} onClick={() => onStart(item)}>{item.learned ? 'Ripeti la prova' : `Prova · ${item.exercises} esercizi`}</button></div>
      </article>;
    })}</div>
    {!filtered.length && <p role="status" className="school-empty">{curriculum.length ? 'Nessuna tecnica corrisponde ai filtri selezionati.' : 'Caricamento del catalogo della scuola…'}</p>}
    <details className="school-rules"><summary>Come funzionano benefici e padronanza</summary><p>Il bonus vale soltanto nel contesto indicato e migliora l’esecuzione del pilota: non aggiunge cavalli o aderenza alla vettura e non aumenta le statistiche permanenti. Le tecniche più specialistiche offrono un beneficio maggiore, ma richiedono più livello, corsi precedenti e una prova più lunga.</p><p>La pratica arriva dall’uso effettivo in gare completate: stesso percorso, rendimenti ridotti. Le prove ripetute dei nuovi corsi assegnano al massimo 1 punto di pratica, senza XP o denaro. Abbandoni, ritiri e gare personalizzate non assegnano pratica. Rilascio progressivo conserva il percorso introduttivo della frenata e la sua pratica in gara.</p></details>
    {selected && <RaceDetailDialog title={`Lezione · ${selected.name}`} closeLabel="Torna alla scuola guida" onClose={() => setReading(null)}>
      <div className="space-y-4">{error && <p role="alert" className="school-warning">{error}</p>}{lessonText(selected).paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}<p className="font-bold">{lessonText(selected).reward}</p>
        {!selected.read && <button type="button" className="win98-btn" disabled={pending > 0 || !!activeRace} onClick={async () => { try { setError(''); await onRead(selected.id); setReading(null); } catch (reason) { setError(reason.message); } }}>Ho letto · abilita la prova</button>}
      </div>
    </RaceDetailDialog>}
  </section>;
}
