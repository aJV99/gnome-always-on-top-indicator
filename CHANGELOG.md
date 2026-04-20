# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Configurable border colour via a colour picker in preferences (hex; default `#bd93f9`).
- Configurable border opacity (0.0–1.0) and corner radius (0–20 px) in preferences.
- GNOME 47+ accent-color integration: borders can now match the desktop accent colour automatically and update when the user changes it. Exposed as a "Use System Accent Colour" switch in preferences (disabled with a hint on GNOME 45/46).
- `.gitignore`, `LICENSE` (GPL-3.0), `CHANGELOG.md`, and `Makefile` for a consistent build and release workflow.
- Borders now apply to dialog, modal dialog, and utility windows in addition to normal windows.
- Border visibility reacts to workspace switches and to the window changing workspace.
- Borders hide while the Activities overview is open and restore when it closes.

### Changed
- Settings changes now flow through a single `changed` handler that reloads every key and restyles live borders, replacing the thickness-only handler. The handler short-circuits when no border-affecting value actually changed, and only re-applies window geometry when thickness changed.
- Custom colour picker is hidden in preferences while the accent-colour toggle is on, and the accent toggle shows as off (with its "Requires GNOME 47 or newer" hint) on older GNOME versions — so the UI always reflects the colour actually driving the border.
- `Gio.Settings` for `org.gnome.desktop.interface` is now constructed only when the `accent-color` key is available, using the schema handle returned by the availability probe.
- `GNOME_ACCENT_COLORS` now cites the libadwaita source so future palette drift is debuggable. The default colour `#bd93f9` is now a named constant shared across the extension and preferences code.
- Project maintenance forked from [perosredo/gnome-always-on-top-indicator](https://github.com/perosredo/gnome-always-on-top-indicator).
- Untracked generated build artifacts (`*.shell-extension.zip`, `schemas/gschemas.compiled`); they are now produced by `make`.
- Collapsed the separate border and signal-handler maps into a single per-window state record.
- Extracted `_borderStyle` and `_applyGeometry` helpers to remove duplicated styling and geometry code.
- `addChrome` is now called with `affectsInputRegion: false`, `affectsStruts: false`, and `trackFullscreen: false` so the overlay cannot steal input, shrink the work area, or linger over fullscreen windows.
- Switched the on-all-workspaces check to the `on_all_workspaces` property for compatibility across Mutter versions.
- Removed the unused `Gio` import; renamed `_windowAddedId` to `_windowCreatedId` to match the signal it tracks.
- `make install` now clears the install directory first so stale files from older versions cannot linger; `SCHEMA_SRC` uses a wildcard so additional schemas rebuild automatically.
- README now documents enabling the extension via `gnome-extensions enable …`.

### Fixed
- Border no longer persists on other workspaces after switching away from an always-on-top window.
- `disable()` iterates a snapshot of tracked windows instead of mutating the map mid-iteration.

## [0.1.0]

### Added
- Initial release: draws a coloured border around windows set to always-on-top.
- Preferences dialog with configurable border thickness (0.25–10.0 px).
