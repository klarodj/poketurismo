// Live conversations keep real ordering/deadlines, without a present-day year in the 2002 interface.
export function clubDate(value){return new Date(value).toLocaleString('it-IT',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});}
