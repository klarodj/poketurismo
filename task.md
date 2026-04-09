# PokeTurismo - Game Development

## Phase 1: Project Setup
- [x] Initialize Vite React project with Tailwind CSS
- [x] Configure project structure (modular: UI, Game Logic, Store)
- [x] Set up routing (React Router)

## Phase 2: Global Store (Zustand)
- [x] Create player store (money, XP, level, stats)
- [x] Create garage store (cars with fuel, weight, usura)
- [x] Create inventory store (parts, moves/skills)
- [x] Create gameState store (location, equipped car)
- [x] Implement travel mechanics (+5 KM, -1L fuel per navigation)
- [x] Implement dynamic weight calculation (fuel weight system)

## Phase 3: UI/UX - Windows 98 Theme
- [x] Create Win98 window component (title bar, borders, chrome)
- [x] Create global HUD (money, car, fuel gauge with reserve blink)
- [x] Create Nokia 3310 modal component
- [x] Create phpBB forum-style Used Cars UI
- [x] Create Win98 error dialog component

## Phase 4: Location Pages
- [x] Dealership (new cars shop)
- [x] Used Cars (phpBB forum UI)
- [x] Workshop (oil change, new tires)
- [x] Parts Shop (mechanical upgrades)
- [x] Gas Station (LCD pump display, dual fuel choice)
- [x] Street Racing & Track Racing hub
- [ ] Barn Find (5% RNG on travel)

## Phase 5: Race Engine (Turn-Based)
- [x] Pre-race loadout screen (weather, track, 4 skill slots)
- [x] Track sections system (straights, corners, etc.)
- [x] Move/skill activation with environmental triggers
- [x] Turn calculation (dynamic weight, RNG, stats, gap)
- [x] Post-race results (XP, money, usura application)

## Phase 6: Integration & Polish
- [x] Connect all systems (fuel, weight, race, navigation)
- [x] Test full gameplay loop
- [x] Verify all mock data works correctly

## Phase 7: Post-Launch Features
- [x] Add notification history (cellphone log)
- [x] Add button in HUD to open cellphone UI

## Phase 8: City Map Navigation Refactor
- [x] Modify HUD.jsx to add Map button (🗺️).
- [x] Create CityMap.jsx as global navigation hub.
- [x] Modify Layout.jsx to change global sidebar into local subsetting sidebar.
- [x] Create GarageHome.jsx (Info player/auto + equipaggiamento).
- [x] Create Meet.jsx and StreetRacing.jsx mock pages.
- [x] Hook up all Location sub-links in the router.

## Phase 9: Visual Enhancements
- [x] StreetRacing dark theme
- [x] CityMap configured with background image and location images
- [x] Location hero banners integration for all nested pages via Win98Window

## Phase 10: Backend Architecture & DB Migration
- [x] Init Node.js Express server in `/server`.
- [x] Install Prisma & SQLite dependencies.
- [x] Translate `db_old.sql` to `schema.prisma`.
- [x] Write SQL parsing script to migrate old data into Prisma.
- [x] Create REST API endpoints for initial Frontend integration.
- [x] Refactored all major pages to use live API data.
