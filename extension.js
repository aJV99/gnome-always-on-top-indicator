import St from 'gi://St';
import Meta from 'gi://Meta';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

const BORDER_COLOR = 'rgba(189, 147, 249, 1)';

const SUPPORTED_WINDOW_TYPES = new Set([
    Meta.WindowType.NORMAL,
    Meta.WindowType.DIALOG,
    Meta.WindowType.MODAL_DIALOG,
    Meta.WindowType.UTILITY,
]);

export default class AlwaysOnTopIndicatorExtension extends Extension {
    constructor(metadata) {
        super(metadata);
        this._windows = new Map();
    }

    enable() {
        this._settings = this.getSettings();
        this._borderWidth = this._settings.get_double('border-thickness');

        this._settingsChangedId = this._settings.connect(
            'changed::border-thickness',
            () => this._onThicknessChanged()
        );

        this._windowCreatedId = global.display.connect(
            'window-created',
            (_display, window) => this._setupWindow(window)
        );

        this._workspaceSwitchedId = global.workspace_manager.connect(
            'workspace-switched',
            () => this._refreshAll()
        );

        for (const actor of global.get_window_actors()) {
            const win = actor.meta_window;
            if (win)
                this._setupWindow(win);
        }
    }

    disable() {
        if (this._settingsChangedId) {
            this._settings.disconnect(this._settingsChangedId);
            this._settingsChangedId = null;
        }
        this._settings = null;

        if (this._windowCreatedId) {
            global.display.disconnect(this._windowCreatedId);
            this._windowCreatedId = null;
        }

        if (this._workspaceSwitchedId) {
            global.workspace_manager.disconnect(this._workspaceSwitchedId);
            this._workspaceSwitchedId = null;
        }

        for (const metaWindow of [...this._windows.keys()])
            this._cleanupWindow(metaWindow);
        this._windows.clear();
    }

    _onThicknessChanged() {
        const newWidth = this._settings.get_double('border-thickness');
        if (newWidth === this._borderWidth)
            return;
        this._borderWidth = newWidth;

        for (const [metaWindow, state] of this._windows) {
            if (state.border) {
                state.border.actor.set_style(this._borderStyle());
                this._applyGeometry(state.border.actor, metaWindow);
            }
        }
    }

    _refreshAll() {
        for (const metaWindow of this._windows.keys())
            this._updateWindowBorder(metaWindow);
    }

    _setupWindow(metaWindow) {
        if (!metaWindow || !SUPPORTED_WINDOW_TYPES.has(metaWindow.get_window_type()))
            return;
        if (this._windows.has(metaWindow))
            return;

        const handlers = {
            above: metaWindow.connect('notify::above', () => this._updateWindowBorder(metaWindow)),
            minimized: metaWindow.connect('notify::minimized', () => this._updateWindowBorder(metaWindow)),
            workspace: metaWindow.connect('workspace-changed', () => this._updateWindowBorder(metaWindow)),
            unmanaged: metaWindow.connect('unmanaged', () => this._cleanupWindow(metaWindow)),
        };

        this._windows.set(metaWindow, {handlers, border: null});
        this._updateWindowBorder(metaWindow);
    }

    _cleanupWindow(metaWindow) {
        const state = this._windows.get(metaWindow);
        if (!state)
            return;

        for (const id of Object.values(state.handlers)) {
            try {
                metaWindow.disconnect(id);
            } catch (_e) {
                // window may already be destroyed
            }
        }

        if (state.border)
            this._destroyBorder(metaWindow);

        this._windows.delete(metaWindow);
    }

    _shouldShowBorder(metaWindow) {
        if (!metaWindow.is_above())
            return false;
        if (metaWindow.minimized)
            return false;

        const activeWs = global.workspace_manager.get_active_workspace();
        const winWs = metaWindow.get_workspace();
        if (winWs && winWs !== activeWs && !metaWindow.is_on_all_workspaces())
            return false;

        return true;
    }

    _updateWindowBorder(metaWindow) {
        if (this._shouldShowBorder(metaWindow))
            this._ensureBorder(metaWindow);
        else
            this._destroyBorder(metaWindow);
    }

    _borderStyle() {
        return `border: ${this._borderWidth}px solid ${BORDER_COLOR}; background-color: transparent;`;
    }

    _applyGeometry(actor, metaWindow) {
        try {
            const rect = metaWindow.get_frame_rect();
            actor.set_position(rect.x - this._borderWidth, rect.y - this._borderWidth);
            actor.set_size(rect.width + 2 * this._borderWidth, rect.height + 2 * this._borderWidth);
        } catch (_e) {
            // window may have been destroyed
        }
    }

    _ensureBorder(metaWindow) {
        const state = this._windows.get(metaWindow);
        if (!state || state.border)
            return;
        if (!metaWindow.get_compositor_private())
            return;

        const actor = new St.Bin({
            reactive: false,
            can_focus: false,
            track_hover: false,
            style: this._borderStyle(),
        });
        this._applyGeometry(actor, metaWindow);
        Main.layoutManager.addChrome(actor, {affectsInputRegion: false});

        const sizeChangedId = metaWindow.connect('size-changed',
            () => this._applyGeometry(actor, metaWindow));
        const positionChangedId = metaWindow.connect('position-changed',
            () => this._applyGeometry(actor, metaWindow));

        state.border = {actor, sizeChangedId, positionChangedId};
    }

    _destroyBorder(metaWindow) {
        const state = this._windows.get(metaWindow);
        if (!state || !state.border)
            return;

        const {actor, sizeChangedId, positionChangedId} = state.border;

        try {
            metaWindow.disconnect(sizeChangedId);
        } catch (_e) { /* gone */ }
        try {
            metaWindow.disconnect(positionChangedId);
        } catch (_e) { /* gone */ }

        Main.layoutManager.removeChrome(actor);
        actor.destroy();

        state.border = null;
    }
}
