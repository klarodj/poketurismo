// Version 2: no new driving stats, only practice inferred from actual decisions.
export function racePractice(state,counts={}){
 const gains={},good=Object.fromEntries(['brake','turn','throttle','clean','reflex','shift','acro','brave'].map(k=>[k,0]));
 for(let i=0;i<(state.logs||[]).length;i++){const l=state.logs[i],d=l.decision,s=state.sections?.[i];if(!d||!s||l.mistakeSeconds>0)continue;const segments=s.segments||[],corner=segments.some(x=>x.radiusM>0),straight=segments.some(x=>x.radiusM===0&&x.lengthM>=150),difficult=/piogg|rain|wet|bagn|neve|snow/i.test(state.environment?.weather||'')||segments.some(x=>Math.abs(x.grade||0)>.04);
 if(corner&&d.braking==='optimal')good.brake++;
 if(corner&&d.line==='apex'&&d.pace!=='attack')good.turn++;
 if(corner&&d.line==='exit'&&d.pace!=='attack')good.throttle++;
 if(d.pace==='balanced'&&d.braking!=='late'&&d.manoeuvre==='hold')good.clean++;
 // Reading the road under limited visibility / incidents; no reflex bonus from merely winning.
 if((s.visibilityM<150||l.incident||/nebb|fog|night|notte/i.test(state.environment?.weather||''))&&d.pace==='save'&&d.braking!=='late')good.reflex++;
 // No gear selector exists: this is practice coordinating power delivery on straight/corner transitions.
 if(straight&&d.pace==='balanced'&&d.line==='exit'&&d.braking!=='late')good.shift++;
 if(corner&&difficult&&d.pace==='save'&&d.braking!=='late'&&d.line==='exit')good.acro++;
 if(d.pace==='attack'&&d.braking==='optimal'&&d.manoeuvre==='hold'&&(!corner||d.line==='apex'))good.brave++;
 }
 const factor=n=>[1,.5,.25][n]||0;
 for(const[k,n]of Object.entries(good))if(n&&factor(counts[k]||0)){gains[k]=Math.floor(Math.min(6,n*2)*factor(counts[k]||0));if(!gains[k])delete gains[k];}
 // Same overall order as previous practice: at most 16 points total, 100 needed for +1 stat.
 while(Object.values(gains).reduce((a,b)=>a+b,0)>16){const key=Object.keys(gains).sort((a,b)=>gains[b]-gains[a]||a.localeCompare(b))[0];gains[key]--;if(!gains[key])delete gains[key];}
 return gains;
}
