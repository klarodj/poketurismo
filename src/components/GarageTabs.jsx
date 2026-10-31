import React from 'react';
import RetroIcon from './RetroIcon';
import { Link, NavLink } from 'react-router-dom';

const sections = [
  { path: '/garage/pilota', label: 'Pilota', icon: 'pilot' },
  { path: '/garage/auto', label: 'Auto', icon: 'car' },
];

export default function GarageTabs() {
  return <><div className="px-2 pt-1"><Link to="/garage" className="text-win98-blue underline text-lg">← Torna alla cameretta</Link></div><nav aria-label="Sezioni del garage" className="grid grid-cols-2 gap-1 p-2 bg-win98-gray border-b-2 border-win98-darkerGray">
    {sections.map(section => <NavLink key={section.path} to={section.path} className={({ isActive }) =>
      'px-2 sm:px-6 py-2 border-2 font-bold text-sm sm:text-base flex items-center justify-center gap-1 sm:gap-2 text-center leading-tight focus-visible:outline focus-visible:outline-2 focus-visible:outline-win98-blue ' +
      (isActive ? 'bg-white border-win98-darkerGray shadow-win98-inset' : 'bg-win98-gray border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray active:border-t-win98-darkerGray active:border-l-win98-darkerGray active:border-b-white active:border-r-white')
    }><RetroIcon kind={section.icon}/><span>{section.label}</span></NavLink>)}
  </nav></>;
}
