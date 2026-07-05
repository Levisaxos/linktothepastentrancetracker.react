# `src/logic` — ALttP logic engine

The reachability engine for the "what's in / out of logic" feature. See
`docs/logic-tracking-plan.md` for the full plan; this README covers the module.

## The idea in one line

Reachability is a pure function of three inputs:

```
evaluate(itemState, entranceLayout) → { [checkId]: 'in' | 'out' | 'unknown' }
```

- **itemState** — what the player has (`src/services/itemStateService.js`, editable
  by the manual panel now, fed by Archipelago in Phase 4).
- **entranceLayout** — the user's manual entrance assignments (`game.locations`),
  which become graph edges.
- **rules** — a JS port of the ALttP apworld logic (this module).

## Files (build order = Phase 2 sub-steps)

| File | Sub-step | Purpose |
|---|---|---|
| `rules.js` | 2a | Pure access-rule predicates over item state. The vocabulary everything else is written in. |
| `regions.js` | 2a | The overworld region set. **`id`s are verbatim AP region names** so 2b mapping and 2e validation line up. |
| `overworldGraph.js` | 2a | Fixed (non-shuffled) walking edges between regions, item-gated. |
| `nodeRegions.js` | 2b | Maps each of the 147 tracker map-nodes → the region it sits in. The hinge that makes a placed entrance a graph edge. |
| `entranceGraph.js` | 2b | `buildEntranceEdges(locations)` turns connector placements into two-way edges; `buildGraph(locations)` assembles overworld + portals + entrance edges into an adjacency map for the solver. |
| `checkRules.js` | 2c | `checkId → predicate(itemState)`: what a check needs *beyond* reaching its region. Absent = free once reachable. |
| `mode.js` | 2f | Standard vs inverted: `pearlWorld(mode)`, `startRegion(mode)`, `modeFromGame(game)`. The pearl/bunny gate is applied by the solver per region world + mode, so one edge set serves both. |
| `logicEngine.js` | 2d/2f | `evaluate(itemState, gameLocations, {mode\|inverted}) → { checkId: 'in'\|'out'\|'unknown' }`. Reachability (with the pearl gate) + per-check rules. |
| *(validation harness)* | 2e | Runs the engine against a real spoiler log. **Needs a spoiler from the user.** Not built yet. |

The engine is wired end-to-end (2a–2d): `evaluate()` returns a state for every
check. Output is still **provisional** until 2e validates it against a spoiler.

## Region graph model

- A **region** is a contiguous area you can move within freely once you're in it.
- An **edge** is a traversal with an optional `requires(itemState)` predicate.
- In the *overworld* graph the regions form several **disconnected components**
  (Death Mountain isn't walkable from the Light World; the two worlds are
  separate). Entrances and portals (2b) stitch them together — that's the whole
  point of an entrance tracker.

## Fidelity status (important)

`overworldGraph.js` edges are tagged:

- **CONFIDENT** — item gates taken from the apworld `Rules.py`.
- **VALIDATE** — plausible but unconfirmed; the 2e harness confirms/corrects.

**Inverted:** handled (2f). For an *entrance* tracker, inverted is not a
connectivity rewrite — the user records the connections, each node's physical
world is fixed (test-enforced: light-map nodes → light regions, dark → dark), and
the solver flips the pearl gate by mode (`pearlWorld`). The start comes from the
**recorded spawn node** (`evaluate(..., { startNode })`), which is always
reachable regardless of the pearl. The UI marker for the spawn lands in Phase 3.

Still to firm up:

1. **Dungeon key logic (2g)** — keys are shuffled (keysanity); dungeon chests are
   still treated as reachable once the dungeon is entered. Needs per-dungeon
   interior graphs + keys in the item model.
3. **Fine ledge-to-ledge adjacency** — many nodes map to a coarse connected
   region for now (see `nodeRegions.js`).
4. **LW↔DW portals** — `crossWorldPortals` holds only the two DM portals (and is
   standard-oriented); most cross-world travel emerges from recorded connectors.
5. **Connector directionality / internal gates** — connectors are currently free
   and two-way; real one-way drops and item-gated connectors need marking.

The 2e validation harness (against a known spoiler) is the mechanism that turns
VALIDATE edges into CONFIDENT ones and flushes out gaps. Until then, treat
engine output for ER as **provisional**.

## Conventions

- Predicates take the item-state map and return a boolean. Keep new logic in
  `rules.js` rather than inlining item lookups, so it reads like `StateHelpers`.
- Region `id`s must match AP names exactly. `overworldGraph.js` throws at import
  if an edge references an unknown region — keep that guard.
