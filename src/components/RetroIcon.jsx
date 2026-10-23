import React from 'react';
const paths={pilot:'M5 1h6v2h2v6h-2v2H5V9H3V3h2zM3 11h10v2h2v3H1v-3h2z',car:'M4 3h8v2h2v4h2v5h-2v2h-3v-2H5v2H2v-2H0V9h2V5h2zM5 5v4h6V5z',school:'M0 5l8-4 8 4-8 4zM3 9l5 3 5-3v4l-5 3-5-3zM15 7h1v7h-1z'};
export default function RetroIcon({kind}){return <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor" shapeRendering="crispEdges" aria-hidden="true"><path d={paths[kind]||paths.car}/></svg>;}
