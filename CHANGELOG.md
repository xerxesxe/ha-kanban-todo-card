# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.3.0] - 2026-04-19

### Fixed (the big DnD overhaul)

The card now reverts SortableJS's DOM mutation in `onEnd` before processing
the drop. This is the standard pattern for combining SortableJS with a
reactive framework that owns the DOM. Without it, lit-html's internal cache
of where each rendered template lives drifts away from reality (we use
`.map()` which is unkeyed), and stale `data-uid` attributes leak into
the next drag, causing `Validation error: item_not_found` from HA.

Position is now computed from DATA neighbours (sorted by position field),
not DOM neighbours. After the revert the DOM no longer reflects the
user's drop intent — only `ev.newIndex` does.

State is refreshed from HA BEFORE the service calls run, eliminating the
race where our local cache lags behind the server after rapid drops.

### Added
- `debug: true` config option — verbose console logging for the DnD flow.
- Headless test harness (`/tmp/test-card-flow.mjs`, `/tmp/test-stale-uid.mjs`)
  that runs the real card class against the real HA WebSocket API. Catches
  regressions before they hit the browser.

### Verified
- Three rapid cross-list moves complete cleanly (uid threading correct).
- Stale-uid drop (captured uid no longer in any list) is caught by the
  guard and aborts without a HA service error.

## [1.2.0] - 2026-04-19

### Added
- German and Spanish UI translations (previously only EN/FR for chrome; DE/ES were preset-only).
- Collapsible "Completed" section at the bottom of each Kanban column (hidden by default; click toggle to expand).
- In-card error banner when SortableJS fails to load from CDN (previously silent failure).
- Per-list config validation: missing `entity` now throws with a clear message.
- Version constant + version string in the loaded-banner console log.
- Automatic position-renumbering when float-precision is exhausted (~52 inserts at same spot).

### Changed
- Error messages in `setConfig` now honor the configured `language` (was hardcoded to French).
- CSS specificity replaces the `!important` chain on Sortable classes — future SortableJS upgrades won't silently break styling.
- Cross-list drop refreshes both lists in parallel (was sequential).
- `shouldUpdate` blocks LitElement re-renders while a drag is in progress, preventing mid-drag DOM tear-down.

### Fixed
- README stale claim that due dates were lost on cross-list moves — they're preserved since v1.1.

## [1.1.4] - 2026-04-18

### Fixed
- Stale-UID guard: if a dropped DOM node carries a uid that no longer exists in our data (from a previous drop's server re-keying), the handler now aborts and refreshes instead of calling the service with a dead uid. Fixes "Eintrag der To-do-Liste kann nicht gefunden werden" errors on rapid drops.
- In-flight lock: `_dragOpInFlight` flag prevents a second drop from racing while the first is still awaiting HA services.
- Cross-list order reversed: target `add_item` runs before source `remove_item`. Network error between calls now leaves a recoverable duplicate instead of a lost task.
- Drop position accuracy: `swapThreshold: 0.65` + `invertSwap: true` for tighter drop math. Cards now land where the user drops them.

## [1.1.3] - 2026-04-18

### Fixed
- Persistent Sortable bindings via DOM-node → instance Map. Previous implementation destroyed and recreated all Sortable instances on every LitElement `updated()`. Mid-drag state changes would destroy the instance handling the drag, causing `Cannot read properties of null (reading 'removeEventListener')`.

## [1.1.2] - 2026-04-18

### Fixed
- Reverted `forceFallback: true` — the fallback clone is appended to `document.body`, which is outside the Lovelace Shadow DOM. This broke pointer-coordinate math, leaving the drag image stuck mid-page. Native HTML5 DnD is used instead (touch still works via `supportPointer`).

## [1.1.1] - 2026-04-18

### Fixed
- Ghost placeholder is now a dashed outline, not a solid blue fill with hidden text.
- `filter: ".item-icon"` so complete-icon clicks no longer start a drag.
- `delayOnTouchOnly: 150` so brief touches still trigger click handlers.

## [1.1.0] - 2026-04-18

### Added

- **Manual ordering within and between lists** — items carry a `position` value in their description, used for sorting.
- **SortableJS integration** — smooth drag animations, drop-position preview, touch support on mobile.
- New `sort_by: manual` per-list option (default in Kanban layout).

### Changed

- Replaced HTML5 Drag-and-Drop with SortableJS for better UX and reliability.
- Position is computed via midpoint-of-siblings so rarely requires renumbering.

### Removed

- Custom HTML5 DnD handlers (now provided by SortableJS).

### Dependencies

- SortableJS 1.15.6 is loaded dynamically from jsDelivr CDN on first Kanban render. No extra installation step required.

## [1.0.0] - 2026-04-18

### Added

- Fork of [Raptor Todo Hub Card](https://github.com/Inter-Raptor/raptor-todo-hub-card) as independent HACS plugin.
- `layout: kanban | tabs` config option (default: `kanban`).
- Horizontal multi-column Kanban rendering via CSS Grid.
- HTML5 Drag-and-Drop between columns (Kanban mode only) with optimistic UI and rollback on error.
- Responsive: columns stack vertically at viewport &lt; 700 px.
- `window.customCards` registration for HACS card picker.

### Inherited from Raptor Todo Hub Card

All of the following features are the work of the original author (Inter-Raptor / Vivien Jardot):

- Multi-list support
- Category presets (grocery, urgency, rooms, timeframe)
- Custom categories with color pills (hashtag matching)
- Icon-click toggle complete
- Long-press to delete
- Auto-remove completed items (per-list delay, persisted via summary tag)
- Urgency engine (due date + age colors)
- Progress bar per list (progress or severity coloring)
- Item sorting modes (`due`, `category`, `urgency`, etc.)
- i18n UI strings (EN, FR)
- i18n category labels in presets (EN, FR, DE, ES)

### Attribution

See [CREDITS.md](CREDITS.md) for full attribution.
