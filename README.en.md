# dsh-hsr-ui

[简体中文](README.md) | **English**

A **Honkai: Star Rail** themed skin for **DeepSeek Harness** — deep-space navy and gold palette,
glass surfaces, a user-chosen background image, and a layered animated portrait that blinks and
follows the pointer.

**Colors and looks only — no layout change**: button positions, interactions and shortcuts stay as they are.

> Works with both **`dsh web`** and the **DeepSeek Harness desktop app** ✓

> 🤖 **Built entirely with DeepSeek Harness** — the browser half (~2,600 lines), the host half,
> the offline pipeline behind the 22-layer portrait, all documentation and the **179 regression
> assertions** were written, refactored and maintained by it across several sessions; artwork and
> design decisions come from the author ✓.

## Features

| | |
|---|---|
| **Theme** | Light and dark palettes; 10 customizable colors; chat transparency and blur; page base color; background-image opacity and blur |
| **Portrait** | An animated portrait composited from 22 PNG layers: real blinking, irises that follow the pointer (returning to center after ~2 s, glancing up while an answer is generated), spring-damped hair and skirt; toggle with **`Ctrl + H`**, resize and reposition, enter/exit animation with bubble and sparkle particles |
| **Background image** | Yours to choose (none is bundled); `cover`-fitted to any size without stretching; compressed and stored locally only |
| **Extras** | DeepSeek balance in the bottom-right corner (refreshed after every answer); adjustable horizontal position of the chat panel |

## Install

> Package name, bundle row name and repository name are all `dsh-hsr-ui` ✓

**A · From GitHub** (recommended, one command) — ask the Agent in Harness to call `plugin_manager`:

```
action: install_bundle
target: github:LuoTian48/dsh-hsr-ui
```

It installs the package, selects the bundle and writes the profile for you ✓ — do **not** edit profile files by hand ✗.
Restart Harness when asked ✓ (replacing an installed package needs a restart to load a fresh JS module generation ✓).

**B · From a local clone** (works offline):

```sh
git clone https://github.com/LuoTian48/dsh-hsr-ui.git
```

```
action: install_bundle
target: /absolute/path/to/the/clone
```

**C · Manual mount** (only if the two ways above do not work):

1. Put this directory anywhere;
2. In a profile's `package.json` (`~/.dsh/profiles/web/` for the web UI, `~/.dsh/profiles/desktop/`
   for the desktop app) add to `dependencies`: `"dsh-hsr-ui": "link:<absolute path to this repo>"`;
3. In the same directory's `cordis.patch.yml` add:

   ```yaml
   - insert:
       - id: dsh-hsr-ui
         name: dsh-hsr-ui
   ```

4. Run `pnpm install` in that profile directory, then **restart** Harness (a page refresh is not enough).

> ⚠️ Do not mix the three ways — a bundle install plus a manual insert leaves a duplicate `dsh-hsr-ui` row ✗.

## Usage

After installing, open **Settings → HSR_UI** (everything applies immediately; values live in the browser's `localStorage`):

| Control | Default | Effect |
|---|---|---|
| Chat transparency / blur | 50% / 50% | Strength of the glass effect on the header and the chat card |
| Background image opacity / blur | 0% / 0% | How strong and how blurry the background image is |
| Page base color | light 0.66 / dark 0.35 | The backdrop of every page, and how much the background image is dimmed — raise it if text is hard to read ✓ |
| Panel background | light `#fbfaf6` / dark `#161d30` | Base color of panels, cards and hover previews |
| Background image (light / dark theme) | none | Pick your own image (downscaled to 1920 px wide, stored locally only); reset to the plain gradient |
| Chat panel horizontal position | 50% | 0% left, 50% centered, 100% right |
| Portrait | on / 340 px / bottom / 100% | Size 120–480 px, vertical (bottom/center/top), horizontal 0–100%; **`Ctrl + H` shows or hides it at any time** |
| Enter/exit animation, bubble size | on / 100% | Jump-in with a bounce plus bubble and sparkle particles, sink-and-fade on exit; bubble size 50%–250% |
| Panel colors (light and dark) | current skin colors | 10 color slots × both themes, following the app's appearance setting; a "restore defaults" button is included |

**On first launch** a small card invites you to pick a background image ✓ — none is bundled ✓, and
browsers do not allow opening a file dialog without a user gesture, so the card's button opens it ✓.
Choosing "later" dismisses it for good ✓; you can always change the image in the settings ✓.

## Artwork and licensing

- **No background image is bundled** ✓ — the original embedded one was third-party artwork and has been
  removed; a fresh install shows the theme's own gradient ✓.
- **The portrait is the author's own artwork** ✓ (`assets/portrait.png`, the embedded copy, and the 22 layer PNGs ✓).
- This is an **unofficial fan project**, not affiliated with the game's publisher; game and character
  names appear for descriptive purposes only and remain the property of their owners.

## Compatibility notes

- **No dependency on host build hashes** ✓: rules such as the chat-card glass are bound to a class the
  plugin adds at runtime (hooked on stable `data-*` attributes such as `[data-conversation-scroll]` ✓),
  so they keep working on the web UI, the desktop app and future versions ✓.
- **Press `Ctrl+F5` after updating** ✓: client-plugin code is imported when the page loads and does not
  hot-reload without a running dev watcher ✗.
- The balance feature reads `DEEPSEEK_API_KEY` from this machine's DSH credentials ✓ in the **host process**
  only ✓ — it is never exposed to the browser ✓. Without a key it shows 0 ✓ and everything else still works ✓.

## Uninstall

```
plugin_manager  action: remove_bundle  target: dsh-hsr-ui
```

For a manual mount: `dsh plugin --profile <profile> remove dsh-hsr-ui`, and delete the matching insert
entry from `cordis.patch.yml` ✓.

## License

MIT ✓ — see [CHANGELOG.md](CHANGELOG.md) for the change history ✓
