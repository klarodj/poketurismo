export const RACE_PART_FAMILIES=Object.freeze(['Aero','Aspiration System','Bars','Brake','Clutch and Flywheel','Differential','ECU','Engine Internal','Exhaust System','Fuel System','Gearbox','Suspension','Turbo','Tyres','Weight','Wheels']);
export function raceRequirements(garage){return RACE_PART_FAMILIES.map(name=>({name,installed:garage.mods?.find(m=>m.part?.name===name)?.part?.level||0,required:3}));}
export function isCircuit(track){const catalog=track?.catalog;return catalog?catalog.format==='circuit':['Track','Circuit'].includes(track?.type?.name);}
export function raceTrackError(car,track,mode='track'){return car?.racePrepared&&(mode==='street'||!isCircuit(track))?'Auto da gara: utilizzabile solo su circuiti, non su strada o nelle corse clandestine.':null;}
// v1 applies only to snapshots carrying this new flag; older contracts keep their exact physics.
export function raceEquipment(car,environment={}){if(!car?.racePrepared)return {grip:1,braking:1,drag:1};const wet=/rain|piogg|wet|bagn/i.test(environment.weather||'');const snow=/snow|neve|ghiacc/i.test(environment.weather||'');return {grip:snow?1:wet?1.04:1.12,braking:1.06,drag:1.06};}
