# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- `.gitignore`, `LICENSE` (GPL-3.0), `CHANGELOG.md`, and `Makefile` for a consistent build and release workflow.

### Changed
- Project maintenance forked from [perosredo/gnome-always-on-top-indicator](https://github.com/perosredo/gnome-always-on-top-indicator).
- Untracked generated build artifacts (`*.shell-extension.zip`, `schemas/gschemas.compiled`); they are now produced by `make`.

## [0.1.0]

### Added
- Initial release: draws a coloured border around windows set to always-on-top.
- Preferences dialog with configurable border thickness (0.25–10.0 px).
