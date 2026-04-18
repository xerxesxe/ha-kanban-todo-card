# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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
