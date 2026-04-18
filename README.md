# HA Kanban Todo Card

> Home Assistant Lovelace card for `todo.*` entities with Kanban layout and drag-and-drop between lists.

## Credits

Fork of [Raptor Todo Hub Card](https://github.com/Inter-Raptor/raptor-todo-hub-card) by **Inter-Raptor (Vivien Jardot)** — all base functionality (multi-list rendering, category presets, i18n, auto-remove, urgency engine, progress bars, icon-click toggle, long-press delete) is their work. Licensed MIT.

This fork adds:

- **Kanban layout** — all configured lists rendered as horizontal columns in a single card
- **Drag-and-drop between columns** — HTML5 DnD with optimistic UI updates and rollback on error
- **Responsive fallback** — stacks vertically on viewport &lt; 700 px

See [CREDITS.md](CREDITS.md) for full attribution.

## Installation

### Via HACS (Custom Repository)

1. HACS → Frontend → three-dot menu → **Custom repositories**
2. Add repository URL: `https://github.com/xerxesxe/ha-kanban-todo-card`
3. Category: **Lovelace**
4. Click **Add**, then install **HA Kanban Todo Card**
5. Reload the browser

### Manual

Copy `ha-kanban-todo-card.js` to `/config/www/` and register it as a Lovelace resource:

```yaml
# In your Lovelace resources
url: /local/ha-kanban-todo-card.js
type: module
```

## Basic Configuration

```yaml
type: custom:ha-kanban-todo-card
title: Todos
layout: kanban        # or 'tabs' for upstream Raptor behavior
language: en          # en | fr (de/es planned)
lists:
  - entity: todo.dringend
    label: Urgent
    icon: mdi:alert-circle
    color_mode: category
    categories:
      - key: work
        match: "#work"
        labels: { en: Work }
        color_on: "#22c55e"
      - key: personal
        match: "#personal"
        labels: { en: Personal }
        color_on: "#0ea5e9"
  - entity: todo.wichtig
    label: Important
    icon: mdi:alert
    color_mode: category
    categories:
      - key: work
        match: "#work"
        labels: { en: Work }
        color_on: "#22c55e"
      - key: personal
        match: "#personal"
        labels: { en: Personal }
        color_on: "#0ea5e9"
  # ... more lists
```

## Config Options

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `layout` | `"kanban"` \| `"tabs"` | `"kanban"` | Layout mode. Kanban shows all lists side-by-side; tabs shows one list at a time with a tab bar (upstream Raptor behavior). |
| `title` | string | from locale | Card title |
| `language` | `"en"` \| `"fr"` | `"en"` | UI strings language |
| `lists` | array (required) | — | List of lists to display |
| `lists[].entity` | string (required) | — | HA todo entity ID |
| `lists[].label` | string | entity name | Column/tab header label |
| `lists[].icon` | string | — | MDI icon |
| `lists[].categories` | array | — | Custom categories with colors (hashtag matching) |
| `lists[].preset` | string | — | Built-in preset: `grocery` \| `urgency` \| `rooms` \| `timeframe` |
| `lists[].default_category` | string | — | Default category key for new items |
| `lists[].color_mode` | `"category"` \| `"urgency_age"` | — | How items get colored |
| `lists[].auto_remove_completed_seconds` | number | — | Auto-remove completed items after N seconds |

All upstream Raptor features (urgency engine, progress bars, sorting, i18n dictionaries for category labels in DE/ES via presets) are inherited — see the [upstream README](https://github.com/Inter-Raptor/raptor-todo-hub-card) for the full option reference.

## Drag and Drop

In `layout: kanban`, each item is draggable. Grab an item and drop it on another column — the item is removed from the source list and added to the target list via HA service calls (`todo.remove_item` + `todo.add_item`). The item's description (HA metadata) is preserved.

On drop:

1. **Optimistic UI** — the item moves locally immediately
2. **HA service calls** — `remove_item` on source, `add_item` on target
3. **Re-fetch** both lists to sync the new UID
4. On cross-list drops, the target `add_item` runs before the source `remove_item`. If the second call fails, you get a temporary duplicate (recoverable) rather than a lost task.

Known limitations:

- Touch DnD on mobile browsers is unreliable (HTML5 DnD quirk). Desktop-first for v1.0.
- Due dates, descriptions, and category hashtags in the summary are preserved.
- Brief window between optimistic move and re-fetch where the item references the old UID — in rare cases a rapid click immediately after drop could hit a stale UID.

DnD is disabled in `layout: tabs`.

## Development

```bash
git clone https://github.com/xerxesxe/ha-kanban-todo-card.git
cd ha-kanban-todo-card
# Edit ha-kanban-todo-card.js
# Syntax check:
node -c ha-kanban-todo-card.js
# Install locally: copy into /config/www/ and reload HA frontend
```

No build step. Vanilla JS + LitElement (via HA's `hui-view` prototype chain). Single file.

## License

MIT. See [LICENSE](LICENSE).

## Changelog

See [CHANGELOG.md](CHANGELOG.md).
