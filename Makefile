.PHONY: all build assets upload serv clean nuke
.SECONDARY:

#KATEX_VERSION := 0.10.2
URL_MATERIALIZE_ZIP := https://github.com/Dogfalo/materialize/releases/download/1.0.0/materialize-src-v1.0.0.zip
URL_MATERIALICONS_CSS := https://fonts.googleapis.com/icon?family=Material+Icons
#URL_KATEX := https://cdn.jsdelivr.net/npm/katex@$(KATEX_VERSION)
#URL_KATEX_CSS := $(URL_KATEX)/dist/katex.min.css
#URL_KATEX_JS := $(URL_KATEX)/dist/katex.min.js
#URL_KATEX_AUTO_RENDER_JS := $(URL_KATEX)/dist/contrib/auto-render.min.js
ASSETS := assets/materialize-src assets/material-icons.css
#assets/katex.min.css assets/katex.min.js assets/katex-auto-render.min.js

all: clean build upload

build: assets
	hugo

assets: $(ASSETS)

upload:
	echo "Upload not implemented"

assets/materialize-src: assets/materialize.zip
	unzip $< -d assets

assets/materialize.zip:
	mkdir -p $(dir $@)
	wget -O $@ $(URL_MATERIALIZE_ZIP)

assets/material-icons.css:
	mkdir -p $(dir $@)
	wget -O $@ $(URL_MATERIALICONS_CSS)

#assets/katex.min.css:
	#mkdir -p $(dir $@)
	#wget -O $@ $(URL_KATEX_CSS)

#assets/katex.min.js:
	#mkdir -p $(dir $@)
	#wget -O $@ $(URL_KATEX_JS)

#assets/katex-auto-render.min.js:
	#mkdir -p $(dir $@)
	#wget -O $@ $(URL_KATEX_AUTO_RENDER_JS)

serv: clean assets
	hugo server

clean:
	rm -rf resources public

nuke: clean
	rm -rf $(ASSETS)
