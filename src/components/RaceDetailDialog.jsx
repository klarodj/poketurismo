import React, { useEffect, useId, useRef } from 'react';

export default function RaceDetailDialog({ title, children, onClose, closeLabel = 'Torna alla gara' }) {
  const ref = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);
  return <dialog ref={ref} className="race-dialog" aria-labelledby={titleId} onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="race-dialog-window">
      <header className="race-dialog-title"><h2 id={titleId}>{title}</h2><button type="button" autoFocus onClick={onClose} aria-label="Chiudi dettaglio">×</button></header>
      <div className="race-dialog-body custom-scroll">{children}</div>
      <footer className="race-dialog-footer"><button type="button" className="race-button" onClick={onClose}>{closeLabel}</button></footer>
    </div>
  </dialog>;
}
