UUID           := always-on-top-indicator@sredojevic.ca
EXTENSIONS_DIR := $(HOME)/.local/share/gnome-shell/extensions
INSTALL_DIR    := $(EXTENSIONS_DIR)/$(UUID)

SOURCES := extension.js prefs.js metadata.json
SCHEMA_SRC := schemas/org.gnome.shell.extensions.always-on-top-indicator.gschema.xml
SCHEMA_COMPILED := schemas/gschemas.compiled

.PHONY: all schemas pack install uninstall clean help

all: schemas

help:
	@echo "Targets:"
	@echo "  schemas    Compile GSettings schemas"
	@echo "  pack       Produce a distributable .shell-extension.zip"
	@echo "  install    Install the extension for the current user"
	@echo "  uninstall  Remove the extension for the current user"
	@echo "  clean      Remove build artifacts"

schemas: $(SCHEMA_COMPILED)

$(SCHEMA_COMPILED): $(SCHEMA_SRC)
	glib-compile-schemas --strict schemas/

pack: schemas
	gnome-extensions pack --force \
		--extra-source=README.md \
		--extra-source=LICENSE \
		--extra-source=CHANGELOG.md \
		.

install: schemas
	mkdir -p $(INSTALL_DIR)
	cp -r $(SOURCES) schemas $(INSTALL_DIR)/
	@echo "Installed to $(INSTALL_DIR)"
	@echo "Restart GNOME Shell (Alt+F2, r) on X11 or log out/in on Wayland, then enable the extension."

uninstall:
	rm -rf $(INSTALL_DIR)
	@echo "Removed $(INSTALL_DIR)"

clean:
	rm -f $(SCHEMA_COMPILED)
	rm -f *.shell-extension.zip
