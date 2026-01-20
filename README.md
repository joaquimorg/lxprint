# Thermal Printer Label Editor

A lightweight, browser-based label editor that connects to the LX-D02 thermal printer over Web Bluetooth.
Create simple labels in the browser and print them directly without installing native drivers.

## Features

- Label editor for basic layouts (text and simple arrangements)
- Direct printing to LX-D02 via Web Bluetooth
- No native app or driver installation required
- Runs in modern browsers that support Web Bluetooth

## How it works

The app uses the Web Bluetooth API to discover and connect to the LX-D02 printer.
Once connected, it sends the generated label data to the device for printing.

## Requirements

- LX-D02 thermal printer
- A Web Bluetooth compatible browser (e.g., recent versions of Chrome or Edge)
- Bluetooth enabled on the host device

## Usage

1. Open the app in a supported browser.
2. Design your label in the editor.
3. Click the connect/print action and select the LX-D02 from the Bluetooth device list.
4. Print your label.

## Attribution

Original codebase: https://github.com/paradon/lxprint

## License

MIT. See `LICENSE`.

