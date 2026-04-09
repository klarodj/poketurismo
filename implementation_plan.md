# PokeTurismo — Implementation Plan

A text-based racing/RPG game set in Europe, 2002. Combines Pokémon (collection, moves), Gran Turismo (tuning, weight physics, wear), and D&D (stats, dice rolls, turns) in a retro Windows 98 aesthetic.

## Proposed Changes

### 1. Project Skeleton and Architecture
- Configure Vite + React + Tailwind + Zustand.
- Set up Windows 98 Design System (CSS variables for classic 3D borders, VT323 pixel font, teal backgrounds).
- Layout: 
  - Top HUD with dynamic Fuel Gauge and two action buttons (`📱 Cellulare` and `🗺️ Mappa Città`).
  - Left Sidebar will dynamically render local sub-menus based on the current location instead of global navigation.
  - Main Window (Win98 Style) for rendering active pages.

---

### Store Layer (`/src/store/`)

#### [NEW] `playerStore.js` — Player state
- Money (€), XP, Level, Stats (`Brave`, `Clean`, `Reflex`, `Shift`)
- Level-up logic (XP thresholds)

#### [NEW] `garageStore.js` — Cars & equipment
- Cars array with dynamic properties: KM, TireGrip, EngineHealth, fuel
- **Dynamic weight**: `totalWeight = baseKG + (currentFuel * 0.75)`
- Computed race stats (`Speed`, `Acceleration`, `TurnSlow`, `TurnFast`, `Brake`, `Traction`) recalculated on fuel change
- `equipCar()`, `addCar()`, `updateFuel()`, `addKM()`, `applyWear()`

#### [NEW] `inventoryStore.js` — Moves/skills & parts
- 3 starter moves with trigger conditions and stat bonuses
- Parts inventory for future upgrades

#### [NEW] `gameStore.js` — Game state orchestration
- Current location, travel mechanics (+5 KM, -1L per nav)
- `travel(destination)` — checks fuel, applies KM/fuel, 5% Barn Find RNG
- Refueling logic, race state management

---

### UI Components (`/src/components/`)

#### [NEW] `Win98Window.jsx` — Reusable window chrome
- Grey borders with inset/outset relief, blue gradient title bar, close/minimize/maximize buttons, slightly smoother gradients and refined chrome vs Win95

#### [NEW] `HUD.jsx` — Global heads-up display
- Always visible: Money, Equipped Car name, Fuel Gauge (F━━━━E)
- Fuel gauge blinks yellow/orange when < 15%

#### [NEW] `NokiaModal.jsx` — Nokia 3310 screen modal
- Monochrome green-on-dark display, pixelated font, system messages

#### [NEW] `Win98ErrorDialog.jsx` — Windows 98 error popup
- Classic error icon, OK button, used for "Sei a secco!" and penalties

#### [NEW] `FuelGauge.jsx` — Analog-style fuel indicator component

#### [NEW] `ForumPost.jsx` — phpBB-style forum post row for Used Cars

#### [NEW] `LCDDisplay.jsx` — Green LED segment display for Gas Station pump

---

### Pages (`/src/pages/`)

#### [NEW] `Dealership.jsx` — New car showroom
- 3-4 mock cars with specs, buy button (deducts money, adds to garage)

#### [NEW] `UsedCars.jsx` — phpBB forum layout
- Used cars with high KM, wear, pixelated avatars, table layout

#### [NEW] `Workshop.jsx` — Maintenance shop
- Oil Change (restores EngineHealth), New Tires (restores TireGrip)

#### [NEW] `PartsShop.jsx` — Mechanical upgrades store
- Buy parts/mods (stored in inventory, future equip system)

#### [NEW] `GasStation.jsx` — Retro fuel pump
- LCD display with scrolling numbers
- "Rifornisci" hold-button, dual fuel: Verde Normale (1.50€/L) vs 100 Ottani (2.50€/L, +5% CV buff for 50 KM)
- "Il Pieno" vs "Solo 10 Litri" quick buttons

#### [NEW] `Racing.jsx` — Street & Track racing hub
- List of available races with entry fees and rewards

#### [NEW] `TrackRace.jsx` — Turn-based race screen (4 Phases)

**Fase 1 — Deck-Building (Loadout):**
- Show Meteo (Sole/Pioggia) and Tracciato (section list preview)
- Player picks max 4 Mosse (Skills) from their **Grimoire** (e.g. Punta-Tacco, Scia Perfetta, Danza della Pioggia)
- Confirm loadout → race begins

**Fase 2 — Section Requirements (Per-Turn):**
- Each section type (Rettilineo, Tornante, Chicane, etc.) demands specific stats (e.g. Tornante → `TurnSlow` + `Reflex`)
- If an equipped move's trigger matches the section, it lights up and is usable; otherwise fallback to passive "Guida Pulita"
- **Push-Your-Luck**: powerful moves consume TireGrip or damage EngineHealth

**Fase 3 — Dungeon Master (RNG & Saving Throws):**
- Server rolls invisible dice for random events: Macchia d'Olio, Traffico, Vuoto di Potenza, etc.
- Events apply stat penalties; pilot stats act as **Saving Throws** (e.g. high `Reflex` → dodge obstacle, negate penalty → "I tuoi riflessi ti salvano!")
- Events displayed via Nokia 3310 modal

**Fase 4 — Resolution (Gap Calc):**
- `sectionScore = autoStats + moveBonus + pilotModifier + rng`
- Compare player score vs opponent (mock AI) → delta updates the running **Gap**
- After all sections: Gap > 0 = Victory (€, XP, steal % opponent money); Gap ≤ 0 = Defeat
- Apply post-race: tire/engine wear, KM driven, fuel consumed per section based on CV and move aggressiveness
- Victory/Defeat screen with full breakdown

---

### Game Logic (`/src/logic/`)

#### [NEW] `raceEngine.js` — Core race calculations (4 Phases)
- `calculateDynamicWeight(car)` → base KG + (currentFuel × 0.75)
- `calculateRaceStats(car)` → Speed, Accel, TurnSlow, TurnFast, Brake, Traction from weight + CV + grip
- `getAvailableMoves(loadout, section)` → filter moves whose triggers match current section/weather
- `rollDungeonMaster()` → invisible RNG event roll (Macchia d'Olio, Traffico, Vuoto Potenza, or nothing)
- `savingThrow(pilotStat, event)` → check if pilot stat is high enough to negate the event penalty
- `resolveTurn(section, playerCar, playerStats, move, opponent)` → sum stats + move + pilot + rng vs opponent → gap delta
- `consumeSectionFuel(car, section, move)` → fuel burn based on CV and move aggressiveness
- `applyMoveWear(car, move)` → aggressive moves cost TireGrip or EngineHealth (push-your-luck)
- `applyPostRace(car, totalSections)` → cumulative wear, KM, final fuel deduction

#### [NEW] `mockData.js` — All mock entities
- 4 new cars, 3 used cars, 3 starter moves, 2 mock opponents, track definitions

---

### Layout & Routing

#### [NEW] `App.jsx` — Main layout with HUD + React Router
#### [NEW] `Layout.jsx` — Win98 desktop frame with HUD sidebar/topbar and navigation

---

## Verification Plan

### Browser Testing
After starting the dev server (`npm run dev`), verify in browser:

1. **Navigation & Fuel**: Click through all location tabs → confirm +5 KM and -1L per click on the HUD fuel gauge. When fuel hits 0, verify Win98 error dialog appears with 200€ fine.
2. **Fuel gauge reserve**: With < 15% fuel, confirm the gauge blinks yellow/orange.
3. **Gas Station**: Navigate to Gas Station → test "Il Pieno" and "Solo 10 Litri" for both fuel types. Verify LCD numbers update, money is deducted, fuel gauge refills.
4. **Dealership**: Buy a car → verify money deduction and car appears in garage.
5. **Track Race**: Start a 3-turn race → select skills → play through turns → verify dynamic weight affects stats, RNG rolls display, gap updates, and final victory/defeat screen shows with rewards.
6. **UI Aesthetics**: Confirm Win98 window chrome, Nokia modal on events, phpBB forum style on Used Cars, retro pixel font throughout.

### 4. UI Layout & New City Map
- **[MODIFY] src/components/Layout.jsx**: 
  - Remove global navigation links from sidebar.
  - Adjust sidebar to render nested links/sub-menus (e.g., when in `Dealership`, sidebar shows "Nuovo Orditore", "Marche").
- **[MODIFY] src/components/HUD.jsx**: Add the `🗺️` Map button to toggle/navigate to the City Map page.
- **[NEW] src/pages/CityMap.jsx**: Main navigation hub. Costs Fuel/KM to travel from here.
- **[NEW] src/pages/GarageHome.jsx**: Casa/Garage for player info and equipping vehicles.
- **[NEW] src/pages/Meet.jsx**: Placeholder for multiplayer car meets.
- **[NEW] src/pages/StreetRacing.jsx**: Legal and Illegal street street races.

### 5. Backend Architecture & DB Migration (Node.js + Prisma)
To support cross-platform persistent saves and multiplayer, we will introduce a real backend.

**Tech Stack:**
- **Runtime**: Node.js
- **Framework**: Express.js (for REST API)
- **ORM**: Prisma (type-safe database access)
- **Database**: SQLite (for zero-config local development, easily swappable to PostgreSQL/MySQL for production)

**Migration Strategy (`db_old.sql`):**
1. **Schema Translation**: Translate the MariaDB tables (`brands`, `cars`, `garages`, `parts`, `mods`, `users`, `tracks`) into a `schema.prisma` file.
2. **Data Seeding**: Create a `seed.js` script that parses the `INSERT INTO` statements from `db_old.sql` and populates the new SQLite database via Prisma.
3. **API Endpoints**: 
   - `POST /api/auth/login`, `POST /api/auth/register`
   - `GET /api/cars` (Dealership)
   - `GET /api/garage` (User's owned cars & applied mods)
   - `POST /api/race/result` (Update player stats, money, wear)
4. **Frontend Integration**: Replace Zustand's `mockData.js` initial state with `fetch()` calls to the Express API. Zustand will act as the client-side cache.
