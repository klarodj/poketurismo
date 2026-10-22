import React from 'react';
import { NavLink } from 'react-router-dom';

const sections = [
  { path: '/garage/pilota', label: 'Pilota', icon: '👤' },
  { path: '/garage/auto', label: 'Auto', icon: '🚗' },
  { path: '/garage/scuola-guida', label: 'Scuola guida', icon: '🎓' },
];

export default function GarageTabs() {
  return <nav aria-label="Sezioni del garage" className="grid grid-cols-3 gap-1 p-2 bg-win98-gray border-b-2 border-win98-darkerGray">
    {sections.map(section => <NavLink key={section.path} to={section.path} className={({ isActive }) =>
      'px-2 sm:px-6 py-2 border-2 font-bold text-sm sm:text-base flex items-center justify-center gap-1 sm:gap-2 text-center leading-tight focus-visible:outline focus-visible:outline-2 focus-visible:outline-win98-blue ' +
      (isActive ? 'bg-white border-win98-darkerGray shadow-win98-inset' : 'bg-win98-gray border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray active:border-t-win98-darkerGray active:border-l-win98-darkerGray active:border-b-white active:border-r-white')
    }><span aria-hidden="true">{section.icon}</span><span>{section.label}</span></NavLink>)}
  </nav>;
}
