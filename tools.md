# The tools

Everything the site says about each tool lives here: its card in the Tools
window on the main page, its tab in the Download box, and its folder on the
downloads page. Edit this file, then run `node scripts/build.mjs` (the Pages
workflow runs it for you on every push).

How a section is laid out:

- The `##` heading is the tool's full name. The Download box and the downloads
  page use it.
- The `- field: value` lines describe it. The fields are listed below.
- Every other line is the card's text on the main page. A blank line starts a
  new paragraph.

The fields:

- `id`: a short name the page uses inside (no spaces). Do not change it once
  the tool has releases: links like `downloads.html#threesprite` use it.
- `card`: the name on the card, if it should be shorter than the heading.
- `window`: the card's title bar.
- `icon`: one of the pixel icons in `assets/icons.js` (map, box, sprite, paint,
  sound, music, graph, ...).
- `repository`: the tool's repository under github.com/projectdigidream. Its
  releases are what the Download box offers. Leave it out for something that
  is not downloaded on its own, and say `comes with` instead.
- `comes with`: the `id` of the tool that includes this one.
- `tutorial`: where its tutorial starts, inside the tutorials (`sprites/`).
- `screenshot`: a picture in `assets/shots/`, and `screenshot text`, which
  describes it for people who cannot see it.
- `short`: one or two sentences for the Download box and the downloads page.
- `wide`: `yes` gives the card the whole width of the window.

The cards and the Download tabs follow the order of the sections.

## Digidream Studio

- id: studio
- card: Studio
- window: Studio - maps · play
- icon: map
- repository: digidream-studio
- tutorial: studio/
- screenshot: studio-3d.jpg
- screenshot text: Studio's 3D map editor on Cinderfall's west foundry
- wide: yes
- short: The level editor and hub: maps, monsters, weapons, triggers, graphs and Play. Includes the other tools as plugins.

Maps, monsters, weapons, props, triggers, screens and Play in one
touch-first editor. Draw a room, raise its floor, drop a monster, press Play.

## ThreeSprite

- id: threesprite
- window: ThreeSprite - sprites
- icon: sprite
- repository: digidream-threesprite
- tutorial: sprites/
- screenshot: sprite-rig.jpg
- screenshot text: ThreeSprite rigging a pixel-art hero
- short: Billboard sprites with a 3D rig behind them, baked into any number of views.

Billboard sprites with a 3D rig behind them. 3D bone animation is included.

## qPainter

- id: qpainter
- window: qPainter - textures
- icon: paint
- repository: digidream-qpainter
- tutorial: textures/
- screenshot: texture.jpg
- screenshot text: qPainter painting a red brick texture
- short: Pixel-art textures with palettes, layers, frames and a live 3D preview.

Pixel-art textures with wrap, palettes, ramps, layers and frames, and a live
3D preview.

## DigidreamSound

- id: sound
- window: DigidreamSound - sfx
- icon: sound
- repository: digidream-sound
- tutorial: sounds/
- screenshot: sound.jpg
- screenshot text: DigidreamSound editing a sound recipe
- short: Sound effects as recipes, not recordings. MIT licensed.

Sound effects as recipes, not recordings. A hundred sounds weigh about 80 KB. Arguably the rawest part of the suite.

## DigidreamSynth

- id: synth
- window: DigidreamSynth - music
- icon: music
- repository: digidream-midisynth
- tutorial: music/
- screenshot: synth.jpg
- screenshot text: DigidreamSynth arranging a boss track, opened from the Studio
- short: A small DAW with a deterministic synth: piano roll, patches, loops and cues.

A small DAW with piano roll, patches, loops and cues. The game synthesizes the
music itself. Very raw yet.

## Graphs

- id: graphs
- window: Graphs - logic
- icon: graph
- comes with: studio
- tutorial: graphs/
- screenshot: cinder-graph.jpg
- screenshot text: A story graph for Cinderfall's boss fight

Blueprint-style logic for a map or the whole game. Lua is there when you want
it.

## Digidream Packager

- id: packager
- card: Packager
- window: Packager - export
- icon: box
- repository: digidream-packager
- tutorial: studio/10-play-and-export.html
- screenshot: packager.jpg
- screenshot text: The Packager page
- short: A module in, a game out: Android, Windows, macOS and Linux apps, built in the browser.

A module in, a game out: Android, Windows, macOS, Linux. All in the browser,
nothing uploaded. IOS and Android AAB exports are yet to come.
