import AvatarPicker from './AvatarPicker';
import {DEFAULT_AVATAR} from '../../shared/avatarCatalog.mjs';
import React, { useEffect, useState } from 'react';
import { AuthClient } from '@supabase/auth-js';
import { configureIdentity, fetchAuthConfig, fetchAccount, createPilot, fetchState } from '../services/api';
import { applyGameState, resetGameState } from '../services/gameState';
import Win98Window from './Win98Window';
import AccountContext from '../contexts/AccountContext';
import './AccountGate.css';

const labels = { brave: 'Coraggio', clean: 'Pulizia', reflex: 'Riflessi', shift: 'Cambio', acro: 'Acrobazia', turn: 'Curva', brake: 'Frenata', throttle: 'Acceleratore' };
const hints = { brave: 'Aiuta a gestire le scelte rischiose.', clean: 'Riduce gli errori e rende la guida precisa.', reflex: 'Aiuta a reagire agli imprevisti.', shift: 'Aiuta a sfruttare il cambio.', acro: 'Controllo nelle manovre difficili.', turn: 'Aiuta a sfruttare l’aderenza in curva.', brake: 'Aiuta a sfruttare i freni e la staccata.', throttle: 'Aiuta a dosare il gas in uscita.' };
const profileLabels = { balanced: 'Equilibrato', methodical: 'Metodico', instinctive: 'Istintivo', technical: 'Tecnico' };
const profileDescriptions = {
  balanced: 'Un punto in ogni abilità: una base versatile per scoprire il tuo stile di guida.',
  methodical: 'Pulizia e frenata a 14: per chi preferisce precisione e staccate controllate.',
  instinctive: 'Coraggio e riflessi a 14: per chi ama prendere l’iniziativa e reagire agli imprevisti.',
  technical: 'Cambio e acceleratore a 14: per chi vuole curare le cambiate e dosare il gas.',
};
function LoginIcon() {
  return <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className="account-login-icon" shapeRendering="crispEdges">
    <path fill="#000" d="M4 6h44v34H4zM20 40h12v8H20zM12 48h28v4H12z" />
    <path fill="#fff" d="M6 8h40v30H6z" /><path fill="#808080" d="M8 10h36v24H8z" />
    <path fill="#008080" d="M10 12h32v20H10z" /><path fill="#c0c0c0" d="M22 40h8v8h-8zM14 48h24v2H14z" />
    <path fill="#000" d="M42 28h14v4h4v14h-4v4H46v10h-8V44h-4V32h8z" />
    <path fill="#ffdf55" d="M42 30h12v4h4v10h-4v4H44v10h-4V42h-4V34h6z" />
    <path fill="#fff3a0" d="M42 32h10v2H42zM38 34h2v8h-2zM42 46h2v10h-2z" />
    <path fill="#000" d="M46 36h6v6h-6zM36 48h4v4h-4zM36 56h4v4h-4z" />
  </svg>;
}
export default function AccountGate({ children }) {
  const [config, setConfig] = useState(null);
  const [client, setClient] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState('');
  const [sentTo, setSentTo] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const [stats, setStats] = useState(null);
  useEffect(() => {
    let stopped = false;
    let subscription;
    fetchAuthConfig().then(async data => {
      if (stopped) return;
      if (data.enabled && data.publicUrl) {
        const canonical = new URL(data.publicUrl);
        const alternate = new URL(data.publicUrl); alternate.port = '8443';
        if (![canonical.origin, alternate.origin].includes(window.location.origin)) {
          window.location.replace(canonical.origin + window.location.pathname + window.location.search);
          return;
        }
      }
      setConfig(data);
      setStats(data.profiles.balanced);
      if (!data.enabled) {
        configureIdentity('legacy', async () => null);
        const state = await fetchState(1);
        if (!stopped) { applyGameState(state); setReady(true); }
        return;
      }
      const auth = { auth: new AuthClient({ url: window.location.origin + '/auth/v1', headers: { apikey: data.publicKey }, storageKey: 'poketurismo-auth-v1', flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }) };
      setClient(auth);
      const listener = auth.auth.onAuthStateChange((_event, value) => { if (!stopped) setSession(value); });
      subscription = listener.data.subscription;
      const result = await auth.auth.getSession();
      if (result.error) throw result.error;
      if (!stopped) { setSession(result.data.session); setReady(true); }
    }).catch(reason => { if (!stopped) { setError(reason.message); setReady(true); } });
    return () => { stopped = true; subscription?.unsubscribe(); };
  }, []);
  const subject = session?.user.id || '';
  useEffect(() => {
    if (!client) return;
    let stopped = false;
    resetGameState();
    setProfile(null);
    setError('');
    configureIdentity(subject, async () => {
      const result = await client.auth.getSession();
      if (result.error) throw result.error;
      return result.data.session?.access_token || null;
    });
    if (subject) fetchAccount().then(async data => {
      if (stopped) return;
      if (data.player) {
        const state = await fetchState(data.player.id);
        if (stopped) return;
        applyGameState(state);
        if (window.location.pathname === '/auth/callback') window.history.replaceState(null, '', '/garage/pilota');
      }
      setProfile(data);
    }).catch(reason => { if (!stopped) setError(reason.message); });
    return () => { stopped = true; };
  }, [client, subject]);
  async function perform(work) {
    setBusy(true); setError(''); setNotice('');
    try { await work(); } catch (reason) { setError(reason.message); }
    finally { setBusy(false); }
  }
  async function logout() {
    resetGameState(); configureIdentity('', async () => null); setProfile(null); setSession(null);
    const result = await client.auth.signOut();
    if (result.error) await client.auth.signOut({ scope: 'local' });
  }
  if (ready && config && !config.enabled) return children;
  if (ready && profile?.player) return <AccountContext.Provider value={{ logout: () => perform(logout), busy }}>{children}</AccountContext.Provider>;
  const points = stats && config ? 8 - config.stats.reduce((sum, key) => sum + stats[key] - 10, 0) : 0;
  const creatingPilot = Boolean(session && profile && !profile.player);
  return <main className="account-desktop">
    <div className={'account-dialog' + (creatingPilot ? ' account-dialog-wide' : '')}>
      <Win98Window title={creatingPilot ? 'Poketurismo — Nuovo pilota' : 'Benvenuto in Poketurismo'} showControls={false} imageUrl={creatingPilot ? undefined : "/images/world/login.png"}>
        <div className="account-brand">
          <img className="account-game-logo" src="/images/brand/poketurismo-mark.png" width="96" height="96" alt="Logo Poketurismo · PT, utilitaria e bandiera a scacchi"/>
          <div><span className="account-brand-name">Poketurismo</span><span className="account-brand-caption">Il tuo posto al volante.</span></div>
        </div>
        <div className="account-body" aria-busy={busy}>
          <div className="account-welcome">
            <LoginIcon />
            <div><h1>{creatingPilot ? 'Crea il tuo pilota' : 'Accesso pilota'}</h1><p>{creatingPilot ? 'Scegli un nome e uno stile. Al resto penserà la strada.' : 'Accedi per ritrovare il tuo garage e riprendere la carriera.'}</p></div>
          </div>
          {error && <p role="alert" className="account-message account-error">{error}</p>}
          {notice && <p role="status" className="account-message account-notice">{notice}</p>}
          {!ready || !config ? <div className="account-loading" role="status"><p>Caricamento…</p>{error && <button type="button" className="win98-btn" onClick={() => window.location.reload()}>Riprova</button>}</div> : !session ? <>
            <fieldset className="account-group"><legend>Identificazione</legend>
              <p className="account-help">Scegli come accedere. Se è la tua prima visita, potrai creare il tuo pilota dopo l’accesso.</p>
              {config.google && <button type="button" disabled={busy || !client} className="win98-btn account-google" onClick={() => perform(async () => {
                const result = await client.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/auth/callback' } });
                if (result.error) throw result.error;
              })}><span className="account-google-icon" aria-hidden="true">G</span><span>{busy ? 'Accesso in corso…' : 'Continua con Google'}</span></button>}
              {config.email && <form className="account-email" onSubmit={event => { event.preventDefault(); perform(async () => {
                if (sentTo) {
                  const result = await client.auth.verifyOtp({ email: sentTo, token: code.trim(), type: 'email' });
                  if (result.error) throw result.error;
                } else {
                  const address = email.trim();
                  const result = await client.auth.signInWithOtp({ email: address, options: { shouldCreateUser: true } });
                  if (result.error) throw result.error;
                  setSentTo(address); setNotice('Controlla la posta: se l’accesso è disponibile riceverai un codice valido per 10 minuti.');
                }
              }); }}>
                {config.google && <p className="account-divider">oppure usa la tua email</p>}
                <label className="account-field">Indirizzo email<input type="email" required autoComplete="email" disabled={busy || Boolean(sentTo)} value={email} onChange={event => setEmail(event.target.value)} /></label>
                {sentTo && <label className="account-field">Codice ricevuto<input required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6,8}" disabled={busy} value={code} onChange={event => setCode(event.target.value)} /></label>}
                <div className="account-actions"><button disabled={busy || !client} className="win98-btn">{busy ? 'Attendi…' : sentTo ? 'Verifica e accedi' : 'Ricevi il codice email'}</button>
                {sentTo && <button type="button" disabled={busy} className="win98-btn" onClick={() => { setSentTo(''); setCode(''); setNotice(''); }}>Cambia email / nuovo codice</button>}</div>
              </form>}
              {!config.google && !config.email && <p role="status">Gli accessi personali sono in preparazione. Riprova quando il playtest sarà aperto.</p>}
            </fieldset>
            <p className="account-footnote">Ogni pilota ha la propria partita. I progressi ti aspettano anche al prossimo accesso.</p>
          </> : !profile ? <div className="account-loading"><p role="status">Apertura della tua partita…</p><div className="account-actions"><button type="button" className="win98-btn" disabled={busy} onClick={() => perform(logout)}>Esci</button>{error && <button type="button" className="win98-btn" onClick={() => window.location.reload()}>Riprova</button>}</div></div> : <form onSubmit={event => { event.preventDefault(); perform(async () => {
            const data = await createPilot({ nickname, avatar, stats });
            applyGameState(await fetchState(data.player.id));
            setProfile(previous => ({ ...previous, player: data.player }));
            window.history.replaceState(null, '', '/garage/pilota');
          }); }}>
            <fieldset className="account-form" disabled={busy}>
              <div className="account-starting"><span>Livello <strong>1</strong></span><span>Budget <strong>€{config.initialMoney.toLocaleString('it-IT')}</strong></span><span>Garage <strong>vuoto</strong></span></div>
              <p className="account-help">La scuola guida ti presta un’auto per imparare, anche prima del tuo primo acquisto.</p>
              <label className="account-field">Nome pilota<input required minLength={3} maxLength={20} autoComplete="nickname" placeholder="Come ti chiameranno in pista?" value={nickname} onChange={event => setNickname(event.target.value)} /></label>
              <AvatarPicker value={avatar} onChange={setAvatar} disabled={busy} allowedIds={config.avatars}/>
              <fieldset className="account-group"><legend>Profilo di partenza</legend>
                <p className="account-help">Tutti i profili valgono 88 punti. Cambiano le abilità iniziali: scegli una base, poi personalizzala liberamente.</p>
                <div className="account-profiles">{Object.entries(config.profiles).map(([key, value]) => {
                  const selected = config.stats.every(stat => stats[stat] === value[stat]);
                  return <button key={key} type="button" className="win98-btn account-profile" aria-pressed={selected} onClick={() => setStats({ ...value })}><span className="account-profile-title">{profileLabels[key]}<span aria-hidden="true">{selected ? '●' : '○'}</span></span><span className="account-profile-description">{profileDescriptions[key]}</span></button>;
                })}</div>
              </fieldset>
              <fieldset className="account-group"><legend>Personalizza le abilità</legend>
                <p className="account-points" role="status">Punti da assegnare: <strong>{points}</strong><span>Base 10 · massimo 14 per abilità</span></p>
                <div className="account-stats">{config.stats.map(key => <div key={key} className="account-stat"><label htmlFor={'stat-' + key}>{labels[key]}<span>{hints[key]}</span></label><input id={'stat-' + key} type="number" min={10} max={14} required value={stats[key]} onChange={event => setStats(previous => ({ ...previous, [key]: Number(event.target.value) }))} /></div>)}</div>
              </fieldset>
              <div className="account-actions account-form-actions"><button disabled={busy || points !== 0} className="win98-btn account-confirm">{busy ? 'Creazione…' : 'Conferma e inizia la carriera'}</button><button type="button" disabled={busy} className="win98-btn" onClick={() => perform(logout)}>Esci</button></div>
            </fieldset>
          </form>}
        </div>
        <div className="account-status"><span>Poketurismo</span><span>{creatingPilot ? 'Nuova patente' : 'Accesso personale'}</span></div>
      </Win98Window>
    </div>
  </main>;
}
