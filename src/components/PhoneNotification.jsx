import useGameStore from '../store/gameStore';
import React, { useEffect, useState } from 'react';
import usePhoneStore from '../store/phoneStore';
import './phone.css';
export default function PhoneNotification() {
  const phone = usePhoneStore();
  const {notice, friendshipNotice, challengeNotice, storyNotice, isOpen, dismiss} = phone;
  const otherPhone = useGameStore(state => state.isHistoryOpen || !!(state.activeEvent && state.activeEvent.type !== 'error'));
  const current = notice || friendshipNotice || challengeNotice || storyNotice;
  const [paused, setPaused] = useState(null);
  useEffect(() => {
    if (!current || paused === current || isOpen || otherPhone) return;
    const timer = setTimeout(dismiss, 8000);
    return () => clearTimeout(timer);
  }, [current, paused, isOpen, otherPhone, dismiss]);
  if (!current || isOpen || otherPhone) return null;
  let title, text, label, action;
  if (notice) {
    title = notice.backlog ? `${notice.count} SMS da leggere` : 'Nuovo SMS';
    text = notice.peer?.name ? `Da: ${notice.peer.name}` : 'Apri il cellulare'; label = 'Leggi SMS';
    action = () => { phone.openSms(notice.peer); phone.openMessage(notice.id); };
  } else if (friendshipNotice) {
    title = 'Scambiamo il numero?'; text = `${friendshipNotice.peer.name} vuole aggiungerti in rubrica.`; label = 'Vedi richiesta';
    action = () => phone.menu('requests');
  } else if (challengeNotice) {
    title = 'Invito a una sfida'; text = `Da: ${challengeNotice.peer.name}`; label = 'Apri sfide';
    action = () => phone.openChallenges();
  } else {
    title = storyNotice.backlog ? 'SMS del club da leggere' : 'Nuovo SMS del club';
    text = `Da: ${storyNotice.peer.name}`; label = 'Leggi SMS';
    action = () => phone.openStory('story-message', storyNotice.id);
  }
  return <aside onMouseEnter={() => setPaused(current)} onMouseLeave={() => setPaused(null)} onFocus={() => setPaused(current)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(null); }} className="phone-notice" aria-label={friendshipNotice && !notice ? 'Richiesta di contatto' : challengeNotice && !notice ? 'Invito a una sfida' : 'Notifica SMS'}><div role="status"><strong>{title}</strong><span>{text}</span></div><div><button type="button" onClick={() => { action(); dismiss(); }}>{label}</button><button type="button" onClick={dismiss}>Dopo</button></div></aside>;
}
