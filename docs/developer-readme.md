# Focus Extension — Developer Documentation

## Architecture Overview
- **Manifest V3:** Background service worker (`background.js`), storage alarms, and client-side content scripts.
- **Zero-Flash Ingestion:** CSS rules are injected at `document_start` to hide feeds before initial DOM render.
- **Swap Layer:** The `FocusCard` module mounts a sticky note over feed placeholder targets.
- **Local Storage:** All settings and task queues use `chrome.storage.local`.

## Local Development
1. Open Google Chrome and navigate to `chrome://extensions`.
2. Toggle on **Developer Mode** (top right corner).
3. Click **Load unpacked** and select this directory.
4. Open YouTube, Instagram, or TikTok to test feed hiding and task display.

## Running Tests
Run `tests/check-selectors.js` in the developer console on any supported site to verify feed selectors are healthy.
