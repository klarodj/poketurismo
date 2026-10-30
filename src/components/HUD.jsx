import useDevelopmentStore from '../store/developmentStore';
import useRadioStore from '../store/radioStore';
import RetroIcon from './RetroIcon';
import PerformanceBadge from '../components/PerformanceBadge';
import FuelGauge from './FuelGauge';
import React,{useContext} from 'react';
import{useNavigate,useLocation}from'react-router-dom';
import AccountContext from '../contexts/AccountContext';
import usePlayerStore from '../store/playerStore';
import useGarageStore from '../store/garageStore';
import useGameStore from '../store/gameStore';
import useRaceStore from '../store/raceStore';
import usePhoneStore from '../store/phoneStore';
import PhoneIcon from './PhoneIcon';
import PilotAvatar from './PilotAvatar';
export default function HUD(){
 const radio=useRadioStore();
 const availablePoints=useDevelopmentStore(s=>s.development?.pilotPoints?.available||0);
 const levelAlert=availablePoints>0;
 const navigate=useNavigate(),location=useLocation(),account=useContext(AccountContext);
 const {username,avatar,money,level,isAdmin,stats}=usePlayerStore(),{cars}=useGarageStore(),{equippedCarId,travel}=useGameStore(),{activeRace,race}=useRaceStore();
 const {unread,storyUnread,friendRequests,challengeInviteCount}=usePhoneStore(),alerts=unread+storyUnread+friendRequests.length+challengeInviteCount,car=cars.find(c=>c.id===equippedCarId);
 const racePath=activeRace?.mode==='street'?'/street-racing':'/track-race';
 const inRace=!!race&&['/track-race','/street-racing'].includes(location.pathname);
 const go=path=>{if(travel(path,0))navigate(path);};
 return <nav className={`game-hud${inRace?' championship-hud':''}`} aria-label="Navigazione e partita">
  <div className="hud-navigation"><button type="button" className="win98-btn hud-map" onClick={()=>go('/map')} aria-label="Mappa della città">▦ <span>Mappa</span></button><button type="button" className="phone-hud-button" onClick={()=>usePhoneStore.getState().menu(friendRequests.length&&!unread?'requests':'home')} aria-label={`Apri cellulare · ${unread+storyUnread} SMS non letti · ${friendRequests.length} richieste di contatto · ${challengeInviteCount} inviti a sfide`}><PhoneIcon/>{alerts>0&&<span className="phone-hud-badge">{alerts>99?'99+':alerts}</span>}</button><button type="button" className="car-radio-hud" aria-label="Apri autoradio" data-playing={radio.playing} onClick={radio.open}><RetroIcon kind="radio"/></button><span className="hud-wallet" aria-label="Saldo">€{money.toLocaleString('it-IT')}</span></div>
  <div className="hud-account"><button type="button" className="hud-profile" onClick={()=>go('/garage/pilota')} aria-label={`Profilo di ${username}, livello ${level}${levelAlert?`, ${availablePoints} punti abilità da assegnare`:""}`} title={levelAlert?`${availablePoints} punti abilità da assegnare`:undefined}><span className="hud-avatar-notification"><PilotAvatar avatar={avatar} size={28} decorative/>{levelAlert&&<span className="hud-level-badge" aria-hidden="true">1</span>}</span><span className="hud-profile-identity"><span className="hud-profile-name">{username}</span><span className="hud-profile-level">Lv{level}</span></span><PerformanceBadge kind="IG" pilot={stats}/><span className="sr-only" role="status" aria-live="polite">{levelAlert?`${availablePoints} punti abilità da assegnare`:''}</span></button>{account&&<button type="button" className="win98-btn" disabled={account.busy} onClick={account.logout}>Esci</button>}</div>
  {!inRace&&<div className="hud-car"><span>{car?car.name:'Garage vuoto'}</span>{car&&<PerformanceBadge car={car}/>}{car&&<FuelGauge currentFuel={car.currentFuel} maxFuel={car.fuelCapacity||45}/>}{activeRace&&<button type="button" className="win98-btn" onClick={()=>navigate(`${racePath}?raceId=${activeRace.id}`)}>Riprendi gara</button>}{isAdmin&&<button type="button" className="hud-dev" onClick={()=>go('/dev-sandbox')}>Strumenti</button>}</div>}
 </nav>;
}
