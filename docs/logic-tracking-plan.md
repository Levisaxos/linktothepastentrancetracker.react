# Logic Tracking — Design Plan

Status: **PLAN AGREED — not yet built.** Core decisions locked (see §9); this doc
is the source of truth for scope and sequencing.

**Decisions locked:**
- **Logic source: JS port** of the ALttP apworld rules (Option 1). No Pyodide/backend.
- **Sequencing: manual item interface first**, logic engine on top of it, **AP
  integration added later** once the engine is proven.

---

## 1. What we're trying to build

Right now the tracker records **where entrances lead** (the manual entrance
layout) and **which checks are done**. It has no notion of *reachability* — it
can't tell you "you can get here right now" vs "you're missing an item / a
connection."

The feature: given (a) the items the player currently has and (b) the entrance
layout the player has discovered, compute for every check / region whether it is
**in logic** (reachable + collectable now), **out of logic** (needs more
items/connections), or **unknown** (depends on unexplored entrances), and show
that on the map.

---

## 2. The three inputs to a logic calculation

A "what's in logic" answer is a pure function of three things. Recognizing that
these come from three *different* sources is the key architectural insight:

| Input | Source | Notes |
|---|---|---|
| **Items you have** | **Archipelago (AP)** — auto-tracked over the network, with a manual fallback | This is the "connect to AP and collect data" idea. |
| **Entrance / region graph** | **The tracker itself** — the user's manual entrance assignments | AP does *not* hand a tracker the entrance layout for ALttP ER; discovering it *is the whole point of this app*. So the graph is user-provided, not from AP. |
| **Logic rules** (item requirements per region/check) | A port/derivation of the **ALttP apworld** logic | The hard part. See §5. |

So: **items from AP + graph from the tracker + rules from the apworld → reachability**.

---

## 3. High-level architecture / data flow

```
┌─────────────────┐     ReceivedItems / checked_locations      ┌──────────────────┐
│  Archipelago    │ ─────────────(WebSocket)──────────────────▶│  AP Client       │
│  server (room)  │                                            │  (browser, ws)   │
└─────────────────┘                                            └────────┬─────────┘
                                                                        │ item names,
                                                                        │ checked ids
                                                                        ▼
        user's manual entrance layout                          ┌──────────────────┐
        (existing game.locations) ────────────────────────────▶│  Logic Engine    │
                                                                │  (pure JS)       │
        ALttP logic rules (ported) ────────────────────────────▶│  reachability    │
                                                                └────────┬─────────┘
                                                                        │ per-check /
                                                                        │ per-region status
                                                                        ▼
                                                                ┌──────────────────┐
                                                                │  MapView / UI    │
                                                                │  in/out of logic │
                                                                └──────────────────┘
```

The Logic Engine is a **pure function**: `(items, entranceGraph, rules) → status map`.
Keeping it pure makes it testable and lets us drive it from AP *or* from manual
item toggles.

---

## 4. Part A — Archipelago connection

**Feasibility: good.** Browsers can open a `wss://` WebSocket to any host with no
CORS restriction, so the CRA app can talk to AP directly — **no backend needed**
for this part.

AP's network protocol (text/JSON over WebSocket) as a *tracker* client:

1. Connect to the room's WebSocket (`wss://archipelago.gg:<port>` or self-hosted).
2. Receive `RoomInfo`.
3. (Optional) `GetDataPackage` → `DataPackage` — gives the name↔id maps for ALttP
   items and locations. We map by **name** because ids are apworld-specific.
4. Send `Connect`: `{ game: "A Link to the Past", name: <slot>, password,
   items_handling: 0b111, tags: ["Tracker"], slot_data: true, version, uuid }`.
5. Receive `Connected` (`slot`, `missing_locations`, `checked_locations`,
   `slot_data`) or `ConnectionRefused`.
6. Receive `ReceivedItems` (full list on connect, deltas after) → **the items we have**.
7. Receive `RoomUpdate` → keep `checked_locations` in sync.

What we harvest:
- **Items** → feed the logic engine.
- **checked_locations** → could auto-mark checks as done (bonus; syncs the
  existing check-tracking UI with the real game).
- **slot_data** → randomizer settings (glitches, goal, entrance shuffle mode,
  etc.) that the logic engine needs to pick the right rule variant.

Work required:
- A `apClient` service (connect/reconnect, packet handling, state).
- **Name mapping**: AP location names → tracker check ids (`checkData`), and AP
  item names → logic item names. This is a real mapping table / normalization
  step, not free.
- UI: connection panel (host, port, slot, password), status indicator.

Open question: do we also want a **manual item panel** (toggle items on/off
without AP)? Recommended yes, as the fallback and for offline use — and it drops
out naturally since the logic engine only wants an item list.

---

## 5. Part B — The logic engine (the hard part)

The apworld logic is **Python** (`worlds/alttp/Rules.py`, `StateHelpers.py`,
`Regions.py`, `EntranceShuffle.py`, `Dungeons.py`). It's expressed as rules over
a `CollectionState` and a region graph. It **cannot run as-is in the browser.**

Three ways to get the rules into our app:

### Option 1 — Port the logic to JavaScript (recommended)
Reimplement the ALttP reachability rules in JS as data + small predicate
functions (`state.has('Hammer')`, `state.hasMelee()`, glitch flags, etc.),
driven by the same region graph the tracker already models.

- ➕ Runs instantly in-browser, no backend, no WASM weight, fully testable, fits
  the interactive tracker use case (recomputes on every item/entrance change).
- ➕ This is what real JS/Lua trackers (PopTracker, EmoTracker packs) do.
- ➖ Substantial, faithful transcription work; must be kept in sync with apworld
  logic changes; risk of subtle divergence from "official" logic.

### Option 2 — Run the actual apworld in Pyodide (Python→WASM)
- ➕ Uses the *real* rules (matches the user's original idea literally).
- ➖ The apworld isn't built to run standalone in-browser; it expects a full
  `MultiWorld`, options, RNG. Heavy download, awkward to drive incrementally,
  significant spike risk. Probably overkill for a live tracker.

### Option 3 — Small Python backend running the apworld
- ➕ Real rules.
- ➖ Reintroduces a server (this app is currently a static localStorage SPA);
  hosting/latency; still needs the graph fed in from the client.

**DECIDED: Option 1 (JS port)**, scoped tightly at first (see §8). "Use the
original apworld for logic rules" is honored by *deriving* a faithful JS port
from it and validating against known seeds — not by executing the Python in the
browser. We can revisit Pyodide later if exactness ever becomes critical.

---

## 6. Part C — Reconciling the tracker's graph with logic regions

The tracker's map locations, connectors, and dungeons (§`mapData`,
`locationTypes`, `checkData`) are the app's *own* model. The logic rules think in
terms of AP/ALttP **regions and entrances**. We need a mapping layer:

- Each tracker map node → one or more logic regions.
- Each connector/dungeon assignment the user makes → an **edge** in the logic
  region graph (this is how the user's manual layout becomes the graph the engine
  traverses).
- Each `checkData` entry → the logic "location" whose access rule we evaluate.

Unassigned entrances = **unknown** edges → the engine should return a third state
("possibly in logic, depends on unexplored entrance") rather than a hard yes/no.

This mapping table is a big chunk of the work and needs the most care.

---

## 7. Part D — UI

- Per-check / per-region visual state: **in logic**, **out of logic**, **unknown**.
  (Colour/opacity/badge on existing map buttons — cheap given current MapView.)
- AP connection panel + status.
- Optional manual item tracker panel.
- Optional: filter/list view of "everything currently in logic."

Kept last on purpose — it's the least risky part once the engine exists.

---

## 8. Phases

Each phase is independently useful and ends with a concrete, checkable result.
Phases 1–3 are the core; 4–6 are follow-on. We confirm the "first target mode"
(§9.3) at the start of Phase 2.

The dependency spine: **items model → logic engine → graph mapping → wire to UI
→ AP → breadth → polish.** Nothing downstream can be trusted until the piece
above it is validated, so we validate at the end of each phase, not at the end.

---

### Phase 1 — Item state model + manual item panel  ✅ BUILT
**Goal:** a canonical, testable representation of "what the player has," editable
by hand. Foundation everything else consumes. No logic, no AP.

**Shipped:** `src/data/itemData.js` (canonical list + AP names + icon mapping),
`src/services/itemStateService.js` (pure model + derived helpers) with
`itemStateService.test.js` (12 tests passing), `src/components/ItemPanel.jsx`
(collapsible bottom-left panel, left-click add / right-click remove). Persisted
per-game via `gameService` (create + load migration) and the `GameTracker`
auto-save watcher. Build compiles clean.

**In scope**
- Canonical item list for ALttP (progression items + counts: swords 0–4,
  bottles 0–4, mail, gloves, boots, flippers, pearl, medallions, rods, etc.),
  named to match apworld item names (drives later AP mapping).
- A pure `ItemState` model with `has(item)`, `count(item)`, `hasAny/hasAll`,
  plus derived helpers we'll need later (`hasMelee()`, `canLiftHeavy()`, …).
- A manual **item panel** UI (click to toggle / increment), persisted per-game
  in the existing localStorage game object.

**Out of scope:** any reachability, any map colouring, AP.

**Deliverables:** `itemData` (canonical list), `itemStateService` (pure),
`ItemPanel` component, item state saved on the game.

**Done when:** I can open a game, toggle items, reload, and the item state
survives; `itemStateService` has unit tests for the derived helpers.

---

### Phase 2 — Logic engine + region-graph mapping — **target: Full / Crossed ER**
**Goal:** prove end-to-end reachability for **Full / Crossed entrance rando**,
driven by hardcoded item states + a hardcoded entrance layout (not the UI yet).
This is the hard core (§5 + §6) and the mode the tracker actually exists for.

**Why ER first (not Vanilla):** every one of the 147 map nodes is already a
physical overworld entrance/spot; the user assigns *what's behind it* (dungeon
section / connector / useful location). That assignment **is** a graph edge, so
ER is the only mode that exercises the app's core mechanism. Vanilla would
validate an engine that never uses the manual layout. Cost: ER is the largest
logic surface, so Phase 2 is split into sub-steps, each independently checkable.

**Out of scope (whole phase):** UI wiring (Phase 3), other modes (Phase 5),
glitch logic (Phase 6), AP (Phase 4).

#### Sub-steps
- **2a — Region model + overworld graph (static).** ✅ BUILT. `src/logic/`:
  `rules.js` (pure access predicates over item state), `regions.js` (overworld
  region set using **verbatim AP region names** for 2b/2e alignment),
  `overworldGraph.js` (fixed item-gated walking edges, each tagged CONFIDENT or
  VALIDATE, with an import-time guard against unknown region names),
  `README.md`, tests green. **Deferred by design:** fine ledge adjacency and
  LW↔DW portals (folded into 2b), and VALIDATE→CONFIDENT promotion (2e).
- **2b — Entrance mapping layer.** ✅ BUILT. `nodeRegions.js` maps all 147
  map-nodes → their overworld region (first pass, uncertain entries tagged `V`).
  `entranceGraph.js`: `buildEntranceEdges` turns connector placements (paired by
  `number`) into two-way edges — spanning worlds for free — and `buildGraph`
  assembles overworld + `crossWorldPortals` (just the 2 DM portals) + entrance
  edges into an adjacency map for the solver. Dead-end interiors add no edge.
  Tests: 147-node coverage, region-id validity, connector pairing, edge cases.
- **2c — Access rules per edge / per check.** ✅ BUILT. `checkRules.js`:
  `checkId → predicate(itemState)` for the item requirement beyond reaching the
  region (confident overworld gates; boss-defeat rules tagged VALIDATE). Absent
  = free once reachable. **Big deferral, documented:** dungeon-internal key logic
  (small/big keys, gated rooms) is NOT modelled — dungeon chests are reachable
  once the dungeon is entered. Prize-gated checks (pedestal/Ganon) left default
  pending a pendant/crystal model.
- **2d — Reachability solver.** ✅ BUILT. `logicEngine.evaluate(itemState,
  gameLocations) → { [checkId]: 'in'|'out'|'unknown' }`. Plain reachability from
  the start region (edges are item-only, no fixed-point needed) + per-check
  rules. Three-state: **in** = reachable + rule passes; **out** = reachable but
  item-blocked; **unknown** = interior not placed yet or its region only opens
  via unrecorded entrances. End-to-end test confirms completing a connector
  flips a dungeon's checks unknown→in.
- **2f — Mode support (standard + inverted).** 🚧 The engine must support BOTH
  worlds-orientations (the app already has `isInverted` per game). Sub-steps:
  - **2f-1 — Mode-aware core.** Thread a `mode` through the engine; centralize
    the bunny/**Moon Pearl** gate as a per-region rule keyed off region world +
    mode (`pearlWorld(standard)=dark`, `pearlWorld(inverted)=light`); make the
    start region mode-dependent. Also fixes a latent standard-mode bug (DW entry
    currently doesn't require the pearl). Standard stays correct.
  - **2f-2 — Inverted start (small).** For an *entrance* tracker, inverted is
    NOT a connectivity rewrite — the user records the connections themselves, and
    each node's physical world is fixed (verified: light-map nodes → light
    regions, dark-map nodes → dark regions), so the pearl-flip from 2f-1 already
    makes inverted reachability correct. The only real inverted-specific knob is
    the **start region** (home-world entry). Decide how the engine learns it
    (fixed default vs. derived from where the user records their spawn).
- **2g — Keys in the interface (NOT a dungeon-logic port).** Decided
  (2026-07-05): hand-porting each dungeon's internal room/door graph re-invents
  what the apworld already does and is the most error-prone work for the least
  tracker value. Instead: **track keys in the UI and let the player reason about
  internal doors themselves.**
  - **2g-1 — Keys as items.** ✅ BUILT. `src/data/dungeons.js`: canonical logical
    dungeon list (`apName` matches AP key names; per-seed small-key counts taken
    from the spoiler, soft cap) + generated `keyItems` (`sk_<id>`/`bk_<id>`),
    appended to the item registry so `getItemById`/`getItemByApName`/itemState
    work uniformly. Tests green.
  - **2g-2 — Surface keys in the UI.** Show per-dungeon small/big key counts so
    the player can track them. Small UI task (folds into Phase 3). **No
    per-dungeon door-graph port.**
  - **Consequence:** dungeon checks stay at "reachable once the dungeon is
    entered." The engine models the **overworld + entrance** logic; inside a
    dungeon, the visible key counts are the aid. 2e therefore validates
    overworld/entrance reachability, not full keysanity spheres.
- **2e — Validation harness.** ✅ Spoiler received:
  `docs/AP_61433691708157974920_Spoiler.txt` (**Inverted, Crossed, keysanity,
  key-drop**; Mire=Ether, TR=Bombos). Parse header/entrances/locations/
  playthrough; map AP names → our model; feed the layout + a growing item set in
  and assert reachable checks match the spheres. **Depends on 2f + 2g** to match
  this spoiler; can partially run (overworld checks) sooner.

**Deliverables:** `logicRegions` + overworld edge data (2a), node/interior
mapping tables (2b), access-rule functions (2c), pure `logicEngine` (2d),
mode support (2f), key logic (2g), validation harness + the checked-in spoiler
fixture (2e).

**Done when:** for the known Inverted/Crossed keysanity seed, with its entrance
layout loaded, the engine's in-logic set matches the spoiler's spheres at empty
inventory, a mid-game item set, and near-complete.

> **Build order:** 2f (mode) → 2g (keys) → 2e (validate against the spoiler).
> 2f-1 is well-grounded and lands first; 2f-2 and 2g each need source grounding.

---

### Phase 3 — Wire engine to items + entrance layout, show on the map
**Goal:** the feature becomes real and interactive for the narrow mode.

**In scope**
- Feed the engine live from the Phase 1 item panel + the game's entrance layout.
- Recompute on every item/entrance change (memoized; perf matters — see existing
  auto-save/render-optimization work).
- Map UI: render **in / out / unknown** on existing location buttons.

**Out of scope:** AP, other modes.

**Deliverables:** engine hooked into `MapView`; three-state styling on buttons.

**Status:** ✅ core BUILT + verified live.

**Overlay semantics (corrected 2026-07-05):** the highlight is driven by
**region reachability from the spawn**, for ALL nodes — not just ones with an
assigned interior. A node lights **green** when its overworld region is reachable
(you can walk there and go check it), **amber** when reachable but the only
remaining checks of an *assigned* interior are item-blocked, and is **unlit**
when you can't reach it yet. Verified: spawn in the Light World lights the whole
Light World (61 nodes) green and leaves the Dark World unlit. (First cut wrongly
keyed the highlight on assigned interiors only, so an empty game lit nothing —
fixed.) `MapView` computes `getReachableRegions(...)` for the node highlight and
`evaluate(...)` for the per-check amber refinement; `LocationButton` draws the
ring via box-shadow. "Show logic" toggle + legend above the maps.

**Spawn marker:** ✅ BUILT + verified live. "Set spawn / Change spawn" button in
the logic toolbar enters a pick mode; clicking any node stores `game.startNodeId`
(persisted via the auto-save watcher; initialized in `gameService`). The spawn
node gets a blue outline; the engine starts reachability there. Verified:
Eastern Palace placed on a dark-world node read `unknown` under the default
start, then flipped to `in` once that node was marked as spawn.

**Remaining in Phase 3:**
- **Key display (2g-2)** — show per-dungeon small/big key counts.
- Optional: per-check states in the hover tooltip.
- **Vanilla-as-tracker (deferred, user request):** make Vanilla pre-fill
  `locationId`-based placements for every location so it works as a plain map
  tracker (fixes the legacy `{type,value}` schema gap).

**Observation (pre-existing, not logic-related):** Vanilla's
`gameService.getDefaultLocations` uses a legacy `{type,value}` schema with no
`locationId`, so those defaults render as `?` and the engine can't read them.
Only `locationId`-based placements (what entrance modes produce) participate in
logic. Flag for the user; may be intended.

**Done when:** toggling an item or assigning an entrance visibly and correctly
updates what's in logic on the map, live, for the chosen mode.

---

### Phase 4 — Archipelago client (auto-populate items)
**Goal:** items flow from a live AP room instead of manual entry; manual panel
becomes the fallback.

**In scope**
- `apClient` service: connect/reconnect, `Connect` as a Tracker, handle
  `Connected` / `ReceivedItems` / `RoomUpdate`, `DataPackage` name mapping.
- AP → `ItemState` bridge (map AP item names to our canonical items).
- Connection panel UI (host, port, slot, password) + status indicator.
- **Confirm §9.4**: also auto-mark checked locations from AP, or items only?

**Out of scope:** other modes, glitch logic.

**Deliverables:** `apClient`, AP↔item mapping, connection UI.

**Done when:** connecting to a real room populates the item state (and the map
updates) without manual entry; disconnect falls back to the manual panel cleanly.

---

### Phase 5 — Broaden logic coverage to the other modes
**Goal:** correctness for the remaining randomizer modes, one at a time.

**In scope:** Dungeons Simple/Full/Crossed, Simple/Restricted/Full/Crossed,
inverted world — each added and validated against a known seed before moving on.

**Done when:** each supported mode has passed the Phase 2 validation harness.

---

### Phase 6 — Polish
**Goal:** the long tail.

**In scope:** glitch-logic variants driven by `slot_data`, a "what's in logic"
list/filter view, edge cases, UX refinement.

**Done when:** by feel — this phase has no hard gate.

---

## 9. Decisions

1. **Logic source — JS port.** ✅ Decided (see §5).
2. **AP vs manual first — manual first.** ✅ Decided. Build the logic engine
   against a manual item panel (Phases 1–3), add AP after (Phase 4).

3. **First target mode — Full / Crossed ER.** ✅ Decided. It's the only mode that
   exercises the manual-layout-as-graph mechanism (see Phase 2). Largest surface,
   so Phase 2 is split into sub-steps 2a–2e.

Still to confirm when we reach the relevant phase:

4. **Scope of AP data** — items only, or also auto-mark checked locations from AP?
   *Confirm at Phase 4.*

---

## 10. Risks / unknowns

- **Logic fidelity**: a hand-port can subtly diverge from official logic. Mitigate
  with a validation harness against known seeds/spoilers.
- **Mapping surface area**: tracker nodes ↔ logic regions ↔ AP names is three
  mappings; the bulk of the grind lives here.
- **"Unknown" state**: entrance rando means the graph is partial mid-game; the
  engine must handle incomplete graphs gracefully (three-state, not boolean).
- **slot_data shape**: exact ALttP `slot_data` fields (glitch level, ER mode,
  goal) need confirming against a real room to drive rule variants.
```
