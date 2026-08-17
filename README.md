# Omarchy System Monitor

A lightweight [Omarchy](https://omarchy.org/) bar widget showing real-time
**CPU %, RAM %, and download speed** — each fronted by an icon glyph instead
of a text label.

```
[microchip] 42%   [memory] 63%   [download] 5.2M/s
```

## Features

- Live CPU usage (from `/proc/stat`)
- Live memory usage (from `/proc/meminfo`)
- Live download speed across all active interfaces (from `/proc/net/dev`)
- Icon glyphs instead of text labels — theme-aware, matches the built-in bar icons
- No external service or helper process; reads `/proc` directly on a timer
- Left click opens `btop` in a floating terminal
- Hot-reloads: edit settings in `shell.json` and the widget updates live

## Install

```bash
omarchy plugin add https://github.com/throni001/omarchy-system-monitor.git --enable --yes
```

Or install by hand:

```bash
git clone https://github.com/throni001/omarchy-system-monitor.git ~/.config/omarchy/plugins/tanzil.sysmon
omarchy-shell shell rescanPlugins
omarchy plugin enable tanzil.sysmon
```

Move it around the bar with:

```bash
omarchy bar move tanzil.sysmon --section right
```

## Removal

```bash
omarchy plugin remove tanzil.sysmon --yes
```

This disables the widget and removes the git checkout. The upstream repository
is left untouched.

## Settings

Per-widget settings live inline in `~/.config/omarchy/shell.json`:

```json
{
  "id": "tanzil.sysmon",
  "intervalMs": 1000,
  "netInterface": ""
}
```

| Key             | Type   | Default | Description                                    |
|-----------------|--------|---------|------------------------------------------------|
| `intervalMs`    | number | `1000`  | Refresh interval in milliseconds (min 250)     |
| `netInterface`  | string | `""`    | Network interface to watch; empty = all except `lo` |

## Icons

| Metric    | Glyph      | Name            |
|-----------|------------|-----------------|
| CPU       | `\uf2db`   | fa-microchip    |
| RAM       | `\uefc5`   | fa-memory       |
| Download  | `\uf019`   | fa-download     |

Icons come from the system Nerd Font (e.g. JetBrainsMono Nerd Font), so they
follow the active theme's bar color automatically.

## Requirements

- Omarchy (Quickshell-based shell)
- A Nerd Font as the bar font (default on Omarchy)

## License

MIT