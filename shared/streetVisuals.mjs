// Presentation only: IDs, access requirements, offers and saved race contracts are unchanged.
export const STREET_VISUALS=Object.freeze(Object.fromEntries(['parking','industrial','coast','mountain','highway'].map(id=>[id,`/images/world/street-zones/${id}.png`])));
export const streetZoneImage=id=>STREET_VISUALS[id]||null;
