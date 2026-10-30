import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchStory, respondStory, readStoryMessage } from '../services/api';
import { STORY_STATUS } from '../../shared/storyCatalog.mjs';
import { carArtwork } from '../../shared/carArtwork.mjs';
import { paintName } from '../../shared/carPaint.mjs';
import { clubDate } from '../logic/clubDate';
import usePhoneStore from '../store/phoneStore';
export default function PhoneStory({ ownerId, view, selection }) {
  const [data, setData] = useState(null), [error, setError] = useState(''), [busy, setBusy] = useState(false), [reload, setReload] = useState(0);
  const alive = useRef(false), dataEpoch = useRef(0), reading = useRef(new Set()), navigate = useNavigate();
  const phone = usePhoneStore();
  const valid = () => alive.current && usePhoneStore.getState().ownerId === ownerId;
  const accept = next => { setData(next); usePhoneStore.setState({ storyUnread: next.unread }); };
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  useEffect(() => {
    let stopped = false; const epoch = dataEpoch.current;
    fetchStory(ownerId).then(next => { if (!stopped && epoch === dataEpoch.current && usePhoneStore.getState().ownerId === ownerId) { setData(next); usePhoneStore.setState({ storyUnread: next.unread }); } }).catch(err => { if (!stopped) setError(err.message); });
    return () => { stopped = true; };
  }, [ownerId, view, selection, reload]);
  const message = view === 'story-message' ? data?.messages.find(item => item.id === selection) : null;
  useEffect(() => {
    const mark = () => {
      if (!message || message.readAt || document.hidden || reading.current.has(message.id)) return;
      reading.current.add(message.id); const epoch = ++dataEpoch.current;
      readStoryMessage(ownerId, message.id).then(result => { if (alive.current && epoch === dataEpoch.current && usePhoneStore.getState().ownerId === ownerId) { dataEpoch.current++; setData(result.story); usePhoneStore.setState({ storyUnread: result.story.unread }); } }).catch(err => { if (alive.current) setError(err.message); }).finally(() => reading.current.delete(message.id));
    };
    mark(); document.addEventListener('visibilitychange', mark);
    return () => document.removeEventListener('visibilitychange', mark);
  }, [ownerId, message]);
  const respond = async (mission, choice) => {
    if (busy) return;
    dataEpoch.current++; setBusy(true); setError('');
    try { const result = await respondStory(ownerId, mission.id, choice); if (valid()) { dataEpoch.current++; accept(result.story); await phone.refresh(); } }
    catch (err) { if (valid()) setError(err.message); }
    finally { if (valid()) setBusy(false); }
  };
  const go = (screen, id = null) => phone.openStory(screen, id);
  const actions = mission => <div className="phone-actions">
    {mission.status === 'available' && <button type="button" disabled={busy} onClick={() => respond(mission, 'accept')}>Rispondi: ci sto</button>}
    {['accepted', 'in-progress'].includes(mission.status) && <><button type="button" onClick={() => { phone.close(); navigate(mission.destination); }}>Vai all’autodromo</button><button type="button" disabled={busy} onClick={() => respond(mission, 'pause')}>Metti in pausa</button></>}
    {mission.status === 'paused' && <button type="button" disabled={busy} onClick={() => respond(mission, 'resume')}>Riprendi incarico</button>}
  </div>;
  if (!data) return <><h2>Incarichi del club</h2>{error ? <p role="alert">{error}<button onClick={() => setReload(n => n + 1)}>Riprova</button></p> : <p>Collegamento…</p>}</>;
  const character = data.characters.find(item => item.id === (view === 'story-person' ? selection : message?.senderId));
  return <section className="phone-story">
    {error && <p role="alert" className="phone-error">{error}<button onClick={() => setReload(n => n + 1)}>Riprova</button></p>}
    {busy && <small role="status">Invio risposta…</small>}
    {view === 'story' && <><h2>Incarichi</h2><div className="phone-actions"><button onClick={() => go('story-inbox')}>SMS del club · {data.unread} nuovi</button><button onClick={() => go('story-people')}>Gente del club</button></div>{data.missions.map(mission => <article key={mission.id}><h3>{mission.title}</h3><small>Da {data.characters.find(c => c.id === mission.senderId)?.shortName} · {STORY_STATUS[mission.status]}</small><p>{mission.objective}</p><p>Bonus unico: €{mission.rewardMoney}. Nessuna scadenza.</p>{mission.status === 'completed' && <p>Bonus incluso nel premio finale della gara, al lordo dell’eventuale rimborso a Franco.</p>}{actions(mission)}<button onClick={() => go('story-inbox')}>Leggi gli SMS</button></article>)}</>}
    {view === 'story-inbox' && <><h2>SMS del club</h2><small>Messaggi dei personaggi del club</small><ol className="phone-list">{data.messages.map(item => <li key={item.id}><button onClick={() => go('story-message', item.id)}><strong>{!item.readAt ? '✉ ' : ''}{data.characters.find(c => c.id === item.senderId)?.shortName}{!item.readAt ? ' · NUOVO' : ''}</strong><small>{item.createdAt ? clubDate(item.createdAt) : 'Invito del club'}</small><span>{item.text.slice(0,70)}…</span></button></li>)}</ol></>}
    {view === 'story-message' && (message && character ? <><div className="story-identity"><img src={character.avatar} width="64" height="64" alt=""/><div><h2>{character.shortName}</h2><small>{character.nickname} · Personaggio del club</small></div></div><small>{message.createdAt ? clubDate(message.createdAt) : 'Invito del club'}</small><p className="phone-message-text">{message.text}</p>{data.missions.filter(m => m.id === message.missionId).map(m => <div key={m.id}><small>{STORY_STATUS[m.status]}</small>{actions(m)}</div>)}<button onClick={() => go('story-person', character.id)}>Conosci {character.shortName}</button></> : <p>SMS non disponibile. Torna all’elenco.</p>)}
    {view === 'story-people' && <><h2>Gente del club</h2><p>Volti e macchine del nostro giro.</p><ol className="phone-list">{data.characters.map(c => <li key={c.id}><button className="story-person-row" onClick={() => go('story-person', c.id)}><img src={c.avatar} width="48" height="48" alt=""/><span><strong>{c.shortName}</strong><small>{c.car.brand} {c.car.name}</small><small>{c.known ? 'Contatto conosciuto' : 'Da incontrare'}</small></span></button></li>)}</ol></>}
    {view === 'story-person' && (character ? <><div className="story-identity"><img src={character.avatar} width="64" height="64" alt=""/><div><h2>{character.shortName}</h2><small>{character.nickname} · {character.age} anni</small></div></div><h3>{character.name}</h3><strong>{character.role}</strong><small>{character.location}</small><img className="story-car" src={carArtwork(character.car)} width="320" height="128" alt={`${character.car.brand} ${character.car.name}, ${paintName(character.car.paintColour)}`}/><strong>{character.car.brand} {character.car.name}</strong><small>{paintName(character.car.paintColour)}</small><p>{character.description}</p><details><summary>Motivazione</summary><p>{character.motivation}</p><p>«{character.quote}»</p></details><p><small>{character.known ? 'Lo hai conosciuto tramite gli incarichi.' : 'Una conoscenza delle prossime storie del club.'} Le sfide con questi personaggi arriveranno nei prossimi capitoli.</small></p></> : <p>Contatto non disponibile.</p>)}
  </section>;
}
