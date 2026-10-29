import React from 'react';
import {performanceIndex} from '../../shared/vehiclePerformance.mjs';
import {driverIndex} from '../../shared/driverIndex.mjs';
import './performance-badge.css';
export default function PerformanceBadge({car,pilot,kind='IP',value}){const n=value??(kind==='IG'?driverIndex(pilot):car?performanceIndex(car):null);const label=kind==='IG'?'Indice di guida':'Indice prestazioni auto';return <span className="performance-badge" aria-label={`${label}: ${n??'non disponibile'}`} title={kind==='IG'?'IG · Sintesi delle otto abilità con rendimento decrescente. Non include tecniche e pratica specifica; non è il livello.':'IP · Preparazione e condizioni attuali dell’auto. Il rendimento dipende anche dal percorso.'}><span>{kind}</span><strong>{n??'—'}</strong></span>;}
