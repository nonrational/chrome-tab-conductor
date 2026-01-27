# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Tab Conductor is a Chrome extension (Manifest V3) that consolidates browser tabs from multiple windows into a single window.

## Development

No build step required. Load the extension directly in Chrome:
1. Navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select this folder

After making changes, click the refresh icon on the extension card in `chrome://extensions/`.

## Architecture

- **lib.js** - Core logic (`consolidateTabs`, `closeTabsToLeft`, `closeOldTabs`) as ES modules
- **popup.html/popup.js** - UI that imports and calls lib.js functions directly
- **background.js** - Service worker for context menu setup, imports from lib.js
- **manifest.json** - Extension configuration (Manifest V3 with ES modules)
- **assets/** - Icons (SVG source and PNG exports at 16, 48, 128px)
