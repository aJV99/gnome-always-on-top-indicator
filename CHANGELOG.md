# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Configurable border colour via a colour picker in preferences (hex; default `#bd93f9`).
- Configurable border opacity (0.0–1.0) and corner radius (0–20 px) in preferences.

### Changed
- Settings changes now flow through a single `changed` handler that reloads every key and restyles live borders, replacing the thickness-only handler.

### Added
- `.gitignore`, `LICENSE` (GPL-3.0), `CHANGELOG.md`, and `Makefile` for a consistent build and release workflow.
- Borders now apply to dialog, modal dialog, and utility windows in addition to normal windows.
- Border visibility reacts to workspace switches and to the window changing workspace.
- Borders hide while the Activities overview is open and restore when it closes.

### Changed
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
