import React from 'react';
import RetroIcon from './RetroIcon';
import './section-tabs.css';
export default function SectionTabs({items,value,onChange,label}){return <nav className="section-tabs" style={{'--section-count':items.length}} aria-label={label}>{items.map(item=><button key={item.id} type="button" aria-pressed={value===item.id} className={`section-tab ${value===item.id?'is-selected':''}`} onClick={()=>onChange(item.id)}><RetroIcon kind={item.icon}/><span>{item.label}</span></button>)}</nav>;}
