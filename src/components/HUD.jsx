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
 const navigate=useNavigate(),location=useLocation(),account=useContext(AccountContext);
 const {username,avatar,money,level,isAdmin}=usePlayerStore(),{cars}=useGarageStore(),{equippedCarId,travel}=useGameStore(),{activeRace,race}=useRaceStore();
 const {unread,friendRequests,challengeInviteCount}=usePhoneStore(),alerts=unread+friendRequests.length+challengeInviteCount,car=cars.find(c=>c.id===equippedCarId);
 const racePath=activeRace?.mode==='street'?'/street-racing':'/track-race';
 const inRace=!!race&&['/track-race','/street-racing'].includes(location.pathname),championship=inRace&&!!(race.gridOpponentId||race.championship?.format==='grid');
 const go=path=>{if(travel(path,0))navigate(path);};
 return <nav className={`game-hud${championship?' championship-hud':''}`} aria-label="Navigazione e partita">
  <div className="hud-navigation"><button type="button" className="win98-btn hud-map" onClick={()=>go('/map')} aria-label="Mappa della città">▦ <span>Mappa</span></button><button type="button" className="phone-hud-button" onClick={()=>usePhoneStore.getState().menu(friendRequests.length&&!unread?'requests':'home')} aria-label={`Apri cellulare · ${unread} SMS non letti · ${friendRequests.length} richieste di contatto · ${challengeInviteCount} inviti a sfide`}><PhoneIcon/>{alerts>0&&<span className="phone-hud-badge">{alerts>99?'99+':alerts}</span>}</button><span className="hud-wallet" aria-label="Saldo">€{money.toLocaleString('it-IT')}</span></div>
  <div className="hud-account"><button type="button" className="hud-profile" onClick={()=>go('/garage/pilota')} aria-label={`Profilo di ${username}, livello ${level}`}><PilotAvatar avatar={avatar} size={28} decorative/><span>{username}<small>Liv. {level}</small></span></button>{account&&<button type="button" className="win98-btn" disabled={account.busy} onClick={account.logout}>Esci</button>}</div>
  {!inRace&&<div className="hud-car"><span>{car?car.name:'Garage vuoto'}</span>{car&&<FuelGauge currentFuel={car.currentFuel} maxFuel={car.fuelCapacity||45}/>}{activeRace&&<button type="button" className="win98-btn" onClick={()=>navigate(`${racePath}?raceId=${activeRace.id}`)}>Riprendi gara</button>}{isAdmin&&<button type="button" className="hud-dev" onClick={()=>go('/dev-sandbox')}>Strumenti</button>}</div>}
 </nav>;
}
