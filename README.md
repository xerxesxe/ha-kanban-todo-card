# HA Kanban Todo Card

> Home Assistant Lovelace card for `todo.*` entities with Kanban layout, drag-and-drop between and within lists, and manual ordering.

## Credits

Fork of [Raptor Todo Hub Card](https://github.com/Inter-Raptor/raptor-todo-hub-card) by **Inter-Raptor (Vivien Jardot)** — all base functionality (multi-list rendering, category presets, i18n dictionaries, auto-remove, urgency engine, progress bars, icon-click toggle, long-press delete) is their work. Licensed MIT.

This fork adds:

- **Kanban layout** — all configured lists rendered as horizontal columns in a single card
- **SortableJS-based drag-and-drop** — smooth animations, touch support, drop-position preview
- **Manual ordering** — drag within a column to reorder; position persisted in item description
- **Cross-list drag** — move items between columns; description, due date, and category hashtags preserved
- **Collapsible "Completed" section** per Kanban column
- **Responsive fallback** — stacks vertically on viewport &lt; 700 px
- **German + Spanish UI** in addition to inherited EN/FR

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

Minimum Home Assistant: **2023.11.0** (when the `todo.*` entity domain was introduced).

## Basic Configuration

```yaml
type: custom:ha-kanban-todo-card
title: Todos
layout: kanban        # or 'tabs' for upstream Raptor behavior
language: en          # en | fr | de | es
lists:
  - entity: todo.urgent
    label: Urgent
    icon: mdi:alert-circle
    color_mode: category
    categories:
      - key: work
        match: "#work"
        labels: { en: Work, de: Arbeit, fr: Travail, es: Trabajo }
        color_on: "#22c55e"
      - key: personal
        match: "#personal"
        labels: { en: Personal, de: Privat, fr: Personnel, es: Personal }
        color_on: "#0ea5e9"
  - entity: todo.important
    label: Important
    icon: mdi:alert
    color_mode: category
    categories:
      # same categories as above
  # ... more lists
```

## Config Options

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `layout` | `"kanban"` \| `"tabs"` | `"kanban"` | Layout mode. Kanban shows all lists side-by-side; tabs shows one list at a time with a tab bar (upstream Raptor behavior). |
| `title` | string | from locale | Card title |
| `language` | `"en"` \| `"fr"` \| `"de"` \| `"es"` | `"en"` | UI strings language |
| `lists` | array (required) | — | List of lists to display |
| `lists[].entity` | string (required) | — | HA todo entity ID |
| `lists[].label` | string | entity name | Column/tab header label |
| `lists[].icon` | string | — | MDI icon |
| `lists[].categories` | array | — | Custom categories with colors (hashtag matching) |
| `lists[].preset` | string | — | Built-in preset: `grocery` \| `urgency` \| `rooms` \| `timeframe` |
| `lists[].default_category` | string | — | Default category key for new items |
| `lists[].color_mode` | `"category"` \| `"urgency_age"` | — | How items get colored |
| `lists[].sort_by` | `"manual"` \| `"due"` \| `"category"` \| `"urgency"` \| ... | `"manual"` in kanban, inherited default in tabs | Sort mode |
| `lists[].show_completed_in_kanban` | boolean | `true` | Show the collapsible "Completed" toggle at the bottom of each Kanban column |
| `lists[].auto_remove_completed_seconds` | number | — | Auto-remove completed items after N seconds |

All upstream Raptor options (urgency engine thresholds, progress bar colors, sort modes, localized category presets) are inherited — see the [upstream README](https://github.com/Inter-Raptor/raptor-todo-hub-card) for the full option reference.

## Drag and Drop

In `layout: kanban`, items drag via SortableJS (loaded dynamically from jsDelivr CDN on first Kanban render).

- **Within a list:** drag up or down to reorder. The new order is persisted as a numeric `position:` key in the item's description.
- **Between lists:** drag from column A to column B. The card calls `todo.add_item` on the target first, then `todo.remove_item` on the source. If the second call fails, you see a temporary duplicate (recoverable) rather than a lost task.
- **Preserved on move:** description, due date, and category hashtags embedded in the summary.
- **Touch support:** SortableJS's pointer polyfill. Long-press (150 ms) to start a drag on touch devices so normal taps still toggle completion.

If SortableJS fails to load (no internet, CSP restrictions, CDN outage), the card shows an in-card banner at the top of the Kanban view. The list view still works; only DnD is unavailable.

Disabled in `layout: tabs`.

### Manual ordering internals

Positions are computed as `(prev + next) / 2` on each drop. After roughly 52 consecutive inserts at the same spot, float precision is exhausted; the card detects this and auto-renumbers the column to `1000, 2000, 3000, ...` via batched `todo.update_item` calls.

## Development

```bash
git clone https://github.com/xerxesxe/ha-kanban-todo-card.git
cd ha-kanban-todo-card
# Edit ha-kanban-todo-card.js
# Syntax check:
node -c ha-kanban-todo-card.js
# Install locally: copy into /config/www/ and reload HA frontend
```

No build step. Vanilla JS + LitElement (via HA's `hui-view` prototype chain). Single file. SortableJS is loaded at runtime from jsDelivr.

## Known Limitations

- Requires internet access on first Kanban render to fetch SortableJS (cached by the browser thereafter).
- No GUI editor yet — configure via YAML.
- No keyboard-based DnD for accessibility (SortableJS limitation).

## License

MIT. See [LICENSE](LICENSE).

## Changelog

See [CHANGELOG.md](CHANGELOG.md).
