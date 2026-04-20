import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import Gdk from 'gi://Gdk';
import Adw from 'gi://Adw';

import {ExtensionPreferences, gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

function hexToRgba(hex) {
    const rgba = new Gdk.RGBA();
    if (!rgba.parse(hex))
        rgba.parse('#bd93f9');
    return rgba;
}

function rgbaToHex(rgba) {
    const channel = (v) => Math.round(v * 255).toString(16).padStart(2, '0');
    return `#${channel(rgba.red)}${channel(rgba.green)}${channel(rgba.blue)}`;
}

export default class AlwaysOnTopIndicatorPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        const page = new Adw.PreferencesPage({
            title: _('General'),
            icon_name: 'dialog-information-symbolic',
        });
        window.add(page);

        const group = new Adw.PreferencesGroup({
            title: _('Appearance'),
            description: _('Configure the appearance of the border'),
        });
        page.add(group);

        const thicknessRow = new Adw.SpinRow({
            title: _('Border Thickness'),
            subtitle: _('Thickness of the border in pixels'),
            adjustment: new Gtk.Adjustment({
                lower: 0.25,
                upper: 10.0,
                step_increment: 0.25,
                page_increment: 1.0,
            }),
            digits: 2,
            width_chars: 6,
        });
        group.add(thicknessRow);
        settings.bind('border-thickness', thicknessRow, 'value',
            Gio.SettingsBindFlags.DEFAULT);

        const colorButton = new Gtk.ColorDialogButton({
            dialog: new Gtk.ColorDialog({with_alpha: false}),
            valign: Gtk.Align.CENTER,
            rgba: hexToRgba(settings.get_string('border-color')),
        });
        colorButton.connect('notify::rgba', () => {
            const hex = rgbaToHex(colorButton.rgba);
            if (hex !== settings.get_string('border-color'))
                settings.set_string('border-color', hex);
        });
        const colorChangedId = settings.connect('changed::border-color', () => {
            colorButton.rgba = hexToRgba(settings.get_string('border-color'));
        });
        window.connect('close-request', () => settings.disconnect(colorChangedId));

        const colorRow = new Adw.ActionRow({
            title: _('Border Color'),
            subtitle: _('Colour of the always-on-top border'),
            activatable_widget: colorButton,
        });
        colorRow.add_suffix(colorButton);
        group.add(colorRow);

        const opacityRow = new Adw.SpinRow({
            title: _('Border Opacity'),
            subtitle: _('0 (transparent) to 1 (fully opaque)'),
            adjustment: new Gtk.Adjustment({
                lower: 0.0,
                upper: 1.0,
                step_increment: 0.05,
                page_increment: 0.1,
            }),
            digits: 2,
            width_chars: 6,
        });
        group.add(opacityRow);
        settings.bind('border-opacity', opacityRow, 'value',
            Gio.SettingsBindFlags.DEFAULT);

        const radiusRow = new Adw.SpinRow({
            title: _('Corner Radius'),
            subtitle: _('Corner rounding in pixels'),
            adjustment: new Gtk.Adjustment({
                lower: 0.0,
                upper: 20.0,
                step_increment: 0.5,
                page_increment: 2.0,
            }),
            digits: 1,
            width_chars: 6,
        });
        group.add(radiusRow);
        settings.bind('corner-radius', radiusRow, 'value',
            Gio.SettingsBindFlags.DEFAULT);
    }
}
