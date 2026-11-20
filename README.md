<h1><img src="assets/app.ico" width="24" height="24"> CASIO FX-991ES PLUS Simulator</h1>

<img src="docs/calculator.png" width="273" height="568">

Windows simulator of the CASIO fx-991ES PLUS (2nd Edition).

This is a simulation, not an emulator. It contains no ROM or firmware; the calculator functions were written in code. You must own the physical calculator to use it.

⚠️ This project is not affiliated with, endorsed by, or sponsored by CASIO in any way.

## Requirements

- Windows 10 or 11
- WebView2 Runtime

## Releases

- `fx991es-sim-setup.exe`
- `fx991es-sim-portable.zip`

## Controls

- Numbers and Numpad-Numbers both work.
- `SHIFT` + `AC` closes the calculator.
- Arrows Work.
- Size and contrast are can be changed at SHIFT + SETUP.
- No runtime folders (Webview) are created beside the executable.

## Build from source

```powershell
cargo build --release
cargo build --release --features installed
```
