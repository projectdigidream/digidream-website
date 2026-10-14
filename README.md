# Digidream website

The website for Digidream, a pocket studio for sector-based retro games: what it is, why it exists, each tool, downloads, and the tutorials.

It is a static site in plain HTML, CSS and JavaScript, dressed as a Windows 95 desktop over a green hill. The hill was rendered by the Digidream engine itself, from `modules/hills` in the workspace.

## Pages

- `index.html`: the main page. The welcome window, the three screens the studio runs on, the Download box, "Why I made this", the tools, the tutorials' contents, the AI-slopped example games, and the engine under it all.
- `downloads.html`: every tool's releases, read live from its own GitHub repository.
- `tools.md`: the tools, their descriptions and where they live (below).
- `tutorials/`: the tutorials site ([digidream-tutorials](https://github.com/projectdigidream/digidream-tutorials)). It is bundled in when the site is built, not kept here.

## The tools: `tools.md`

Everything the site says about a tool is in [`tools.md`](tools.md): its card in the Tools window, its tab in the Download box, and its folder on the downloads page. Each tool is a `##` section with a few `- field: value` lines, then the card's text; the top of the file explains every field. The build writes the cards into `index.html` and the list into `assets/tools.js`. It stops, naming the line, if a field is misspelled or missing, or if a screenshot, icon or tutorial page does not exist.

## Downloads come from GitHub Releases

Each tool is released from its own repository, named in `tools.md`:

| Tool | Repository |
|---|---|
| Digidream Studio | [digidream-studio](https://github.com/projectdigidream/digidream-studio) |
| Digidream Packager | [digidream-packager](https://github.com/projectdigidream/digidream-packager) |
| ThreeSprite | [digidream-threesprite](https://github.com/projectdigidream/digidream-threesprite) |
| qPainter | [digidream-qpainter](https://github.com/projectdigidream/digidream-qpainter) |
| DigidreamSound | [digidream-sound](https://github.com/projectdigidream/digidream-sound) |
| DigidreamSynth | [digidream-midisynth](https://github.com/projectdigidream/digidream-midisynth) |

The build writes a snapshot of every repository's releases into `assets/releases.json`, using a token, and the pages read that first. Only when it is more than 15 minutes old do they also ask GitHub directly (`GET /repos/<repo>/releases`, cached for ten minutes per visitor), keeping the snapshot if that fails. Nothing has to be copied here when a release is published.

A file's system is read from its name, so a release only has to say which system each file is for:

- `windows`, `win64`, `.exe`, `.msi` → Windows
- `macos-arm64` (or `darwin`, `arm64`) and `macos-x64` (or `x64`, `intel`); `mac` alone, or a `.dmg`, counts as a universal build
- `linux`, `.AppImage`, `.deb` → Linux
- `.apk`, `android` → Android

For example: `Digidream-Studio-macos-arm64.zip`, `ThreeSprite-windows-x64.zip`, `DigidreamSound-android.apk`. Anything else in a release, such as checksums, is listed under "Other files". The newest release that is not a pre-release is the one the Download box offers.

GitHub allows 60 unauthenticated requests an hour per visitor, which is why the snapshot comes first. When neither the snapshot nor GitHub has a repository's releases, the pages say so and link to them on GitHub. They never show made-up versions.

## Build and preview

```sh
node scripts/build.mjs                       # -> dist/, tutorials from ../tutorials
python3 -m http.server -d dist 8975          # then open http://localhost:8975/
```

Preview `dist/`, not this folder: the tool cards and `assets/tools.js` only exist once the build has written them.

Use `--tutorials <folder>` to bundle a checkout from somewhere other than `../tutorials`, and `--out <folder>` to build somewhere other than `dist/`.

## Publish

`.github/workflows/pages.yml` builds the site with the latest tutorials and deploys it to GitHub Pages. It runs:

- on every push to `main`;
- by hand, from Actions → Run workflow;
- every hour, so the releases snapshot stays fresh;
- when another repository sends a `repository_dispatch`: `tutorials-updated` from the tutorials, `release-published` from a tool.

Pages must be switched on once, in the repository's Settings → Pages, with **Source: GitHub Actions**. "Deploy from a branch" would serve this folder unbuilt: no tool cards, no tutorials, and a Download box that can only say the tool list is missing.

## Credits

The screenshots of the example games show Kenney's "New Platformer Pack" (CC0), chiptunes from OpenGameArt (CC0), and Freedoom's textures (BSD-3-Clause). The pixel font is Pixelify Sans, under the SIL Open Font License (`assets/OFL.txt`).
