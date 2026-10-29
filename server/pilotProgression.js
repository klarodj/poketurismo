const {PILOT_STATS}=require('./gameRules');
const GAIN=3;
function levelStats(user,levels){return Object.fromEntries(PILOT_STATS.map(k=>[k,Math.min(100,user[k]+Math.max(0,levels)*GAIN)]));}
function experienceReward(user,xp){const level=Math.max(user.level,Math.floor((user.exp+xp)/1000)+1);return {exp:{increment:xp},level,...levelStats(user,level-user.level)};}
module.exports={experienceReward,levelStats};
