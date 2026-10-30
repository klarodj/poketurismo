import React from 'react';
import {streetAvatar} from '../../shared/streetAvatarCatalog.mjs';
import './street-rival-portrait.css';
export default function StreetRivalPortrait({avatar,name,compact=false}) {
 const portrait=streetAvatar(avatar);
 if(!portrait)return null;
 return <img className={`street-rival-portrait${compact?' is-compact':''}`} src={`/images/street-avatars/${portrait.id}.png`} width="64" height="64" alt={`Ritratto di ${name}`}/>;
}
