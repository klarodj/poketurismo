import {partName} from '../logic/partLabels.mjs';
import RaceDetailDialog from '../components/RaceDetailDialog';
import React,{useEffect,useState,useRef} from 'react';
import {useNavigate} from 'react-router-dom';
import usePlayerStore from '../store/playerStore';
import useGameStore from '../store/gameStore';
import useRequestStore from '../store/requestStore';
import useRaceStore from '../store/raceStore';
import Win98Window from '../components/Win98Window';
import TuningPreview from '../components/TuningPreview';
import {fetchTuning,purchasePart,mountPart} from '../services/api';
import '../components/tuning.css';
export default function PartsShop(){
 const {id:userId,money}=usePlayerStore(),equipped=useGameStore(state=>state.equippedCarId),pending=useRequestStore(state=>state.pending),activeRace=useRaceStore(state=>state.activeRace);
 const navigate=useNavigate(),detail=useRef(null);
 const[data,setData]=useState(null),[garageId,setGarageId]=useState(),[revision,setRevision]=useState(0),[family,setFamily]=useState(''),[category,setCategory]=useState('Engine'),[selectedId,setSelectedId]=useState(null),[error,setError]=useState(''),[notice,setNotice]=useState(''),[loading,setLoading]=useState(true);
 useEffect(()=>{let current=true;fetchTuning(userId,garageId).then(result=>{if(current){setData(result);setLoading(false);}}).catch(e=>{if(current){setError(e.message);setLoading(false);}});return()=>{current=false;};},[userId,garageId,revision,equipped]);
 const selected=data?.parts.find(part=>part.id===selectedId),car=data?.cars.find(car=>car.id===data.garageId),disabled=loading||pending>0||Boolean(activeRace);
 const refresh=()=>{setLoading(true);setRevision(value=>value+1);};
 const act=async kind=>{try{setError('');if(kind==='buy'){await purchasePart(userId,selected.id,selected.preview?{garageId:data.garageId,quoteKey:selected.preview.quoteKey}:undefined);setNotice(`${partName(selected.name)} livello ${selected.level} acquistato. È nel magazzino: puoi ora confermare il montaggio.`);}else{await mountPart(data.garageId,selected.id,userId,selected.preview.quoteKey);setNotice(`${partName(selected.name)} livello ${selected.level} montato su ${car.name}. L’eventuale pezzo sostituito è tornato in magazzino.`);}refresh();}catch(e){setError(e.message);refresh();}};
 const groups=(data?.parts||[]).filter(part=>part.category===category).reduce((result,part)=>{(result[part.name]||=[]).push(part);return result;},{});
 return <Win98Window title="Negozio Tuning — Prepara la tua auto" imageUrl="/images/shop.png"><div className="tuning-page"><header><h1>Banco ricambi · Catalogo elaborazioni</h1><p>Confronta la sostituzione sulla tua auto prima di spendere. Acquisto e montaggio sono due operazioni separate.</p></header>
 {error&&<p role="alert" className="tuning-warning">{error}</p>}{notice&&<p role="status" className="tuning-info">{notice}</p>}{activeRace&&<p className="tuning-warning">Gara in corso: puoi confrontare i ricambi, ma acquisti e montaggio richiedono di concluderla o abbandonarla.</p>}
 <div className="tuning-toolbar"><label>Auto da preparare<select disabled={!data?.cars.length} value={data?.garageId||''} onChange={event=>{setLoading(true);setGarageId(Number(event.target.value));}}>{!data?.cars.length&&<option value="">Nessuna auto in garage</option>}{data?.cars.map(car=><option key={car.id} value={car.id}>{car.name}{car.equipped?' · equipaggiata':''}</option>)}</select></label><button className="win98-btn" onClick={()=>{setError('');refresh();}}>Aggiorna confronto</button><button className="win98-btn" onClick={()=>navigate(data?.garageId?`/garage/auto/${data.garageId}`:'/garage/auto')}>Vai al garage</button></div>
 {data?.condition&&<p className="tuning-condition">Motore {data.condition.engineHealth.toFixed(1)}% · gomme {data.condition.tireGrip.toFixed(1)}% · {data.condition.currentFuel.toFixed(1)} L {data.condition.fuelType}. Il confronto non ripara l’usura.</p>}
 {loading&&<p role="status">Aggiornamento preparazione…</p>}
 <div className="tuning-tabs" role="group" aria-label="Categoria ricambi">{[['Engine','Motore e trasmissione'],['Dynamic','Assetto e ciclistica']].map(([id,label])=><button key={id} className="win98-btn" aria-pressed={category===id} onClick={()=>{setCategory(id);setFamily('');}}>{label}</button>)}</div>
 <label className="catalog-field">Famiglia ricambi<select value={family} onChange={e=>setFamily(e.target.value)}><option value="">Tutte le famiglie</option>{Object.keys(groups).map(name=><option key={name} value={name}>{partName(name)}</option>)}</select></label><div ref={detail}>{selected&&<RaceDetailDialog title={partName(selected.name)+' · Confronto ricambio'} closeLabel="Torna al banco ricambi" onClose={()=>setSelectedId(null)}><TuningPreview part={selected} carName={car?.name} money={money} disabled={disabled} onBuy={()=>act('buy')} onMount={()=>act('mount')}/></RaceDetailDialog>}</div>
 <div className="tuning-catalog">{Object.entries(groups).filter(([name])=>!family||name===family).map(([name,parts])=><section className="tuning-family" key={name}><h2>{partName(name)}</h2><div className="tuning-variants">{parts.map(part=><button key={part.id} className="tuning-part" aria-pressed={selectedId===part.id} onClick={()=>{setSelectedId(part.id);}}><img src={`/images/part/${part.image}`} alt="" onError={event=>{event.currentTarget.onerror=null;event.currentTarget.src='/images/shop.png';}}/><strong>Livello {part.level} · €{part.price.toLocaleString('it-IT')}</strong><span>{part.preview?.alreadyMounted?'Già montato':part.preview?`IP ${part.preview.before.performanceIndex} → ${part.preview.after.performanceIndex}`:'Acquistabile per il magazzino'}</span><span>{part.ownedQuantity>0?`In magazzino: ${part.ownedQuantity}`:'Esamina ricambio'}</span></button>)}</div></section>)}</div>
 {!loading&&!Object.keys(groups).length&&<p>Nessun ricambio disponibile in questa categoria.</p>}
 </div></Win98Window>;
}
