import React from 'react';
import{experienceProgress}from'../logic/displayUnits.mjs';
export default function ExperienceProgress({xp}){
 const p=experienceProgress(xp);
 return <section className="pilot-xp" title={`${p.total} XP totali`} aria-label="Esperienza del pilota"><div><strong>Livello {p.level}</strong><span>{p.current} / {p.required} XP</span></div><progress max={p.required} value={p.current} aria-label={`Progressione verso il livello ${p.nextLevel}`}/><p>Mancano <strong>{p.remaining} XP</strong> al livello {p.nextLevel}.</p></section>;
}
