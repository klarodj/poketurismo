import React from 'react';
import {CAR_PAINTS} from '../../shared/carPaint.mjs';
export default function CarPaintPicker({value,onChange,disabled=false,label='Colore carrozzeria'}){
 return <fieldset className="car-paint-picker" disabled={disabled}><legend>{label}</legend><div>{CAR_PAINTS.map(p=><button type="button" key={p.id} className="win98-btn" aria-pressed={value===p.id} onClick={()=>onChange(p.id)}><span className="car-paint-swatch" style={{backgroundColor:p.hex}} aria-hidden="true"/>{p.name}</button>)}</div></fieldset>;
}
