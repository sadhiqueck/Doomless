# Focus Extension

> **Block the scroll. Swap in your work.**

A Chrome extension built entirely in modern web tech that hides distracting social media feeds on **YouTube**, **Instagram**, and **TikTok** — and instantly swaps in a 30-second swipeable sticky note of what you're actually working on right now.

---

## ✨ Why Focus Extension?

1. **Intercepts the Reach-for-the-Phone Moment:** Other blockers leave you staring at a blank wall or require you to open a separate app. Focus Extension intercepts the exact gesture and redirects it to your work.
2. **Knowledge Worker Backlog Swap:** Designed for sprint tasks, tickets, and reading chapters — not just student flashcards.
3. **Zero-Flash Feed Hiding:** Manifest V3 content scripts run at `document_start` to eliminate feed flicker.
4. **Shame-Free Cooldown:** Need a quick break? "Let me through" provides a 5-minute unlock timer.
5. **100% Private:** Zero tracking, no accounts, and all data lives on your device in `chrome.storage.local`.

---

## 🚀 Quick Install (Developer Mode)

1. Clone or download this repository.
2. In Chrome, open `chrome://extensions`.
3. Enable **Developer mode** in the top-right corner.
4. Click **Load unpacked** and select this project folder.
5. Open YouTube, Instagram, or TikTok to see your focus sticky note!

---

## 🛠 Stack
- **Manifest V3** Chrome Extension
- Plain HTML5 / CSS3 / Vanilla JavaScript
- `chrome.storage.local` persistence
- Chrome Alarms & Commands API

---

## 📦 Project Structure
- `manifest.json`: Extension configuration & permissions
- `background.js`: Service worker for alarms & shortcuts
- `content/`: Site-specific content scripts & shared card swap layer
- `popup/`: Toolbar popup with site toggles & quick-add
- `options/`: Settings page with markdown & GitHub imports
- `onboarding/`: 4-step first-run setup wizard
- `stats/`: Productivity metrics & 28-day consistency heatmap
- `docs/`: Store listing, QA checklist, and developer docs

---
Licensed under MIT.
