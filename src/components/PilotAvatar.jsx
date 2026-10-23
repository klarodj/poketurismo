import React from 'react';
import {avatarInfo} from '../../shared/avatarCatalog.mjs';
import './avatars.css';
export default function PilotAvatar({avatar,size=64,alt,decorative=false}){
 const info=avatarInfo(avatar);
 return <span className="pilot-avatar" style={{width:size,height:size}} aria-hidden={decorative||undefined}>{info?<img src={info.image} width="64" height="64" alt={decorative?'':alt||info.name} decoding="async"/>:<svg viewBox="0 0 32 32" role={decorative?undefined:'img'} aria-label={decorative?undefined:alt||'Avatar da scegliere'} shapeRendering="crispEdges"><path fill="#808080" d="M0 0h32v32H0z"/><path fill="#000" d="M8 5h16v3h4v17h-4v3H8v-3H4V8h4z"/><path fill="#c0c0c0" d="M9 7h14v3h3v14h-4v2H10v-2H6V10h3z"/><path fill="#000080" d="M8 12h17v8H8z"/><path fill="#fff" d="M9 13h12v2H9z"/></svg>}</span>;
}
