import useDevelopmentStore from '../store/developmentStore';
import { setSnapshotHandler } from './api';
import usePlayerStore from '../store/playerStore';
import useGarageStore from '../store/garageStore';
import useRaceStore from '../store/raceStore';
import useInventoryStore from '../store/inventoryStore';
export function applyGameState(data) {
  if ('activeRace' in data) useRaceStore.setState({ activeRace: data.activeRace });
  if (data.race) useRaceStore.setState({ race: data.race });
  if (data.development) useDevelopmentStore.getState().accept(data.development);
  if (data.player) usePlayerStore.getState().accept(data.player);
  if (data.garage) useGarageStore.getState().accept(data.garage);
  if (data.inventory) useInventoryStore.getState().accept(data.inventory);
}
setSnapshotHandler(applyGameState);
