# RHOBEAR Designs — Desktop (Tauri)

This folder is the **offline desktop shell** for RHOBEAR Designs. It wraps the
prebuilt web editor (`editor/dist/`) in a Tauri (WebView2) window and ships it
as a installable Windows app branded **RHOBEAR Designs**, with the red
constellation bear as its icon and tray.

No desktop networking is required: the editor's HTML/JS/CSS is embedded into the
binary at build time and served from the local webview.

## Layout

```
src-tauri/
├── Cargo.toml              # Rust manifest (tauri v2, tray-icon feature)
├── build.rs                # tauri-build
├── tauri.conf.json         # product name, window, bundle, tray, icon set
├── app-icon.png            # source red-bear PNG (512×512) — icon generator input
├── icons/                  # generated icons (.ico/.icns/all PNG sizes + Store logos)
├── capabilities/
│   └── default.json        # ACL: core:default on the `main` window
└── src/
    ├── lib.rs              # window + red-bear tray (close→tray, Open/Quit)
    └── main.rs             # binary entry → lib::run()
```

## Prerequisites (Windows)

- Rust (stable, `x86_64-pc-windows-msvc`) — `rustup default stable-msvc`
- MSVC Build Tools 2022 (C++ workload: `cl.exe`, `link.exe`)
- WebView2 Runtime (preinstalled on Windows 10/11; the installer will fetch the
  bootstrapper if missing)
- Node.js + npm (for the editor build)

## Commands

Run from `editor/` (this package's parent):

```bash
npm run build          # build the web editor → editor/dist
npm run desktop:dev    # tauri dev (launches vite dev server + the shell, HMR)
npm run package        # vite build, then tauri build → installers
npm run package:bin    # vite build, then tauri build --no-bundle (just the .exe)
```

`npm run package` outputs installers under:

```
editor/src-tauri/target/release/bundle/
├── nsis/RHOBEAR Designs_1.0.0_x64-setup.exe   ← primary installer (.exe)
└── msi/RHOBEAR Designs_1.0.0_x64_en-US.msi     ← Windows Installer (.msi)
```

> MSI output requires WiX (Tauri downloads it automatically) and the Windows
> "VBSCRIPT" optional feature. If `light.exe` fails, enable it under
> Settings → Apps → Optional features → More Windows features, or build with
> `-b nsis` only: `npx tauri build --bundles nsis`.

## Tray behavior

- The window close button (×) **hides to the tray** — the editor keeps running
  in the background.
- Left-click the red-bear tray icon, or choose **Open RHOBEAR Designs**, to
  bring the window back.
- **Quit RHOBEAR Designs** in the tray menu exits the app.

## Regenerating icons

```bash
npx tauri icon src-tauri/app-icon.png
```

This regenerates every size in `icons/` (PNG, `.ico`, `.icns`, iOS/Android,
Store logos) from the source red bear.

## Code signing

The installer is produced **unsigned**. Signing is the owner's release step.
To sign, either set a Windows certificate thumbprint:

```jsonc
// tauri.conf.json → bundle.windows
"certificateThumbprint": "<THUMBPRINT>",
"timestampUrl": "http://timestamp.digicert.com"
```

…or use a custom signing command via `bundle.windows.signCommand`. See
<https://v2.tauri.app/distribute/sign-windows/>.

## Known offline caveat

The editor loads its UI fonts (DM Sans, JetBrains Mono) from Google Fonts over
the network. When fully offline the app still launches and is fully functional;
the fonts simply fall back to system defaults. Bundling the fonts into the
editor for pixel-perfect offline rendering is tracked as a follow-up (it lives
in the editor, not the shell).
