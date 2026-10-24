// Fixed at the start of new club races. Previously saved races retain their rules.
export const CLUB_REWARDS = Object.freeze({ version:1, winMoney:500, finishMoney:100, winXp:100, finishXp:20 });
export function clubReward(state) {
  if (state.sandbox || state.failure || !state.finished || state.index !== state.sections.length) return {money:0,xp:0};
  return state.outcome === 'win' ? {money:CLUB_REWARDS.winMoney,xp:CLUB_REWARDS.winXp} : {money:CLUB_REWARDS.finishMoney,xp:CLUB_REWARDS.finishXp};
}
