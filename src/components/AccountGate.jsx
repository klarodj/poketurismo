import React, { useEffect, useState } from 'react';
import { AuthClient } from '@supabase/auth-js';
import { configureIdentity, fetchAuthConfig, fetchAccount, createPilot, fetchState } from '../services/api';
import { applyGameState, resetGameState } from '../services/gameState';
import Win98Window from './Win98Window';

const labels = { brave: 'Coraggio', clean: 'Pulizia', reflex: 'Riflessi', shift: 'Cambio', acro: 'Acrobazia', turn: 'Curva', brake: 'Frenata', throttle: 'Acceleratore' };
const hints = { brave: 'Aiuta a gestire le scelte rischiose.', clean: 'Riduce gli errori e rende la guida precisa.', reflex: 'Aiuta a reagire agli imprevisti.', shift: 'Aiuta a sfruttare il cambio.', acro: 'Controllo nelle manovre difficili.', turn: 'Aiuta a sfruttare l’aderenza in curva.', brake: 'Aiuta a sfruttare i freni e la staccata.', throttle: 'Aiuta a dosare il gas in uscita.' };
const profileLabels = { balanced: 'Equilibrato', methodical: 'Metodico', instinctive: 'Istintivo', technical: 'Tecnico' };
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
  const [avatar, setAvatar] = useState('blue');
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
  if (ready && profile?.player) return <><div className="bg-win98-gray text-black px-4 py-1 flex justify-between text-sm"><span>Pilota: {profile.player.username}</span><button className="win98-btn" onClick={() => perform(logout)} disabled={busy}>Esci</button></div>{children}</>;
  const points = stats && config ? 8 - config.stats.reduce((sum, key) => sum + stats[key] - 10, 0) : 0;
  return <main className="min-h-screen bg-win98-bg p-4 flex items-start justify-center text-black"><div className="w-full max-w-xl mt-8"><Win98Window title="Poketurismo — Patente di guida">
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">{subject ? 'Crea il tuo pilota' : 'Benvenuto a Poketurismo'}</h1>
      {error && <p role="alert" className="bg-red-100 text-red-900 p-2">{error}</p>}
      {notice && <p role="status" className="bg-green-100 p-2">{notice}</p>}
      {!ready || !config ? <p>Caricamento… {error && <button onClick={() => window.location.reload()}>Riprova</button>}</p> : !session ? <>
        <p>Accedi per ritrovare il tuo garage e i tuoi progressi. Al primo accesso potrai creare il pilota.</p>
        {config.google && <button disabled={busy} className="win98-btn w-full" onClick={() => perform(async () => {
          const result = await client.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/auth/callback' } });
          if (result.error) throw result.error;
        })}>Continua con Google</button>}
        {config.email && <form className="space-y-3" onSubmit={event => { event.preventDefault(); perform(async () => {
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
          <label className="block">Email<input type="email" required autoComplete="email" disabled={busy || Boolean(sentTo)} className="block w-full p-2 border-2 border-gray-600" value={email} onChange={event => setEmail(event.target.value)} /></label>
          {sentTo && <label className="block">Codice ricevuto<input required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6,8}" className="block w-full p-2 border-2 border-gray-600" value={code} onChange={event => setCode(event.target.value)} /></label>}
          <button disabled={busy} className="win98-btn">{busy ? 'Attendi…' : sentTo ? 'Verifica e accedi' : 'Ricevi il codice email'}</button>
          {sentTo && <button type="button" disabled={busy} className="win98-btn ml-2" onClick={() => { setSentTo(''); setCode(''); setNotice(''); }}>Cambia email / nuovo codice</button>}
        </form>}
        {!config.google && !config.email && <p role="status">Gli accessi personali sono in preparazione. Riprova quando il playtest sarà aperto.</p>}
      </> : !profile ? <><p>Caricamento della tua partita…</p><button className="win98-btn" onClick={() => perform(logout)}>Esci</button>{error && <button className="win98-btn" onClick={() => window.location.reload()}>Riprova</button>}</> : <form className="space-y-4" onSubmit={event => { event.preventDefault(); perform(async () => {
        const data = await createPilot({ nickname, avatar, stats });
        applyGameState(await fetchState(data.player.id));
        setProfile(previous => ({ ...previous, player: data.player }));
        window.history.replaceState(null, '', '/garage/pilota');
      }); }}>
        <p>Inizi al livello 1 con <strong>€{config.initialMoney.toLocaleString('it-IT')}</strong> e il garage vuoto. La scuola guida ti presta un’auto per imparare.</p>
        <label className="block">Nome pilota<input required minLength={3} maxLength={20} autoComplete="nickname" className="block w-full p-2 border-2 border-gray-600" value={nickname} onChange={event => setNickname(event.target.value)} /></label>
        <fieldset><legend>Colore del casco</legend><div className="flex gap-2">{config.avatars.map(value => <button type="button" key={value} aria-pressed={avatar === value} className={'win98-btn ' + (avatar === value ? 'font-bold underline' : '')} onClick={() => setAvatar(value)}>{({ blue: 'Blu', red: 'Rosso', green: 'Verde', yellow: 'Giallo' })[value]}</button>)}</div></fieldset>
        <fieldset><legend>Stile iniziale</legend><div className="flex flex-wrap gap-2">{Object.entries(config.profiles).map(([key, value]) => <button key={key} type="button" className="win98-btn" onClick={() => setStats({ ...value })}>{profileLabels[key]}</button>)}</div></fieldset>
        <p>Punti da assegnare: <strong>{points}</strong>. Tutti gli stili hanno lo stesso totale; puoi personalizzarli.</p>
        {config.stats.map(key => <div key={key} className="flex gap-3 items-center justify-between"><label htmlFor={'stat-' + key}>{labels[key]}<span className="block text-xs text-gray-700">{hints[key]}</span></label><input id={'stat-' + key} type="number" min={10} max={14} required className="w-16 border-2 border-gray-600 p-1" value={stats[key]} onChange={event => setStats(previous => ({ ...previous, [key]: Number(event.target.value) }))} /></div>)}
        <button disabled={busy || points !== 0} className="win98-btn">{busy ? 'Creazione…' : 'Conferma e inizia la carriera'}</button>
        <button type="button" disabled={busy} className="win98-btn ml-2" onClick={() => perform(logout)}>Esci</button>
      </form>}
    </div>
  </Win98Window></div></main>;
}
