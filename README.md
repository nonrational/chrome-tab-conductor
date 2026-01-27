# Tab Conductor Chrome Extension

A Chrome extension that orchestrates your tabs - consolidate windows and tidy up.

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select this folder
4. The extension will appear in your toolbar

## Usage

1. Click the Tab Conductor icon in your toolbar
2. Click "Gather All Tabs" to consolidate all tabs into one window
3. Click "Close Tabs to the Left" to close all tabs before the current one
4. Click "Close Old Tabs (1hr+)" to close tabs not accessed in the last hour

## Features

- Consolidates tabs from all windows into a single window
- Close tabs to the left of current tab
- Close tabs not accessed in the last hour
- Preserves pinned tabs
- Shows current tab count in the popup
- Context menu support (right-click to close tabs to the left)
- Dark/light theme support (ir_black inspired color scheme)

## Permissions

- `tabs`: Required to access and manipulate browser tabs
- `windows`: Required to create new windows and close existing ones
- `contextMenus`: Required for right-click menu integration
