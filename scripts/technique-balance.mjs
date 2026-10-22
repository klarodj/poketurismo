import { TECHNIQUES, techniqueMove } from '../shared/techniqueCatalog.mjs';
import { createTechniqueLesson } from '../shared/techniqueLessons.mjs';
import { LESSON_SECTIONS } from '../shared/driverDevelopment.mjs';
import { PILOT_STATS } from '../shared/raceEngine.mjs';
import { advanceTacticalRace, DEFAULT_DECISION } from '../shared/tacticalRace.mjs';
import { tacticalMovePlayable } from '../shared/raceContext.mjs';
import process from 'node:process';
const samples = Number(process.argv[2] || 128);
if (!Number.isInteger(samples) || samples < 1 || samples > 10000) throw new Error('Campioni: intero tra 1 e 10000');
const report = [];
for (const technique of TECHNIQUES) {
  const measurements = [];
  for (const stat of [10,30,60]) {
    const pilot = Object.fromEntries(PILOT_STATS.map(key => [key,stat]));
    const state = createTechniqueLesson(technique,pilot,12345), move=techniqueMove(technique,60);
    let index, decision;
    for (let i=0;i<state.sections.length;i++) {
      const goal=state.sections[i].goal || {...DEFAULT_DECISION,braking:LESSON_SECTIONS[i].braking};
      if(tacticalMovePlayable(move,state.sections[i],state.sections[i+1],state.sections[i].scenarioGap ?? state.gapSeconds,state,goal)) {index=i;decision=goal;break;}
    }
    if(index===undefined) throw new Error('Nessun esercizio utile per '+technique.id);
    state.index=index;state.gapSeconds=state.sections[index].scenarioGap || 0;state.moves=[move];
    let base=0,trained=0;
    for(let seed=1;seed<=samples;seed++) {
      state.rng=(seed*2654435761)>>>0;
      const plain=advanceTacticalRace(state,null,decision).logs.at(-1),skilled=advanceTacticalRace(state,move.id,decision).logs.at(-1);
      base+=plain.playerSeconds;trained+=skilled.playerSeconds;
    }
    measurements.push({pilotStat:stat,averageGainPercent:Number(((base-trained)/base*100).toFixed(3))});
  }
  report.push({id:technique.id,name:technique.name,tier:technique.tier,minLevel:technique.minLevel,masteredBonusTotal:Object.values(techniqueMove(technique,60).skillBonus).reduce((a,b)=>a+b,0),measurements});
}
const gains=report.flatMap(t=>t.measurements.map(m=>m.averageGainPercent));
console.log(JSON.stringify({samplesPerTechniqueAndPilot:samples,techniques:report.length,minGainPercent:Math.min(...gains),maxGainPercent:Math.max(...gains),report},null,2));
