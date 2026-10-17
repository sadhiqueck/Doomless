# Doomless

<p align="center">
  <strong>Block the doomscroll. Swap in your sprint.</strong><br>
  A minimalist desktop Chrome extension that intercepts distraction triggers on YouTube, Instagram, and TikTok — replacing infinite algorithmic feeds with your daily work backlog.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Manifest-V3-18181b?style=flat-square" alt="Manifest V3">
  <img src="https://img.shields.io/badge/Privacy-100%25%20Local-10b981?style=flat-square" alt="100% Local">
  <img src="https://img.shields.io/badge/Telemetry-Zero-18181b?style=flat-square" alt="Zero Telemetry">
  <img src="https://img.shields.io/badge/Backend-$0%20Required-18181b?style=flat-square" alt="No Backend Required">
  <img src="https://img.shields.io/badge/License-MIT-gray?style=flat-square" alt="License: MIT">
</p>

---

## ⚡ The Problem vs The Fix

Every blocker app just blocks and leaves you staring at nothing. Every flashcard app is a separate destination you have to remember to open.

| Traditional Website Blockers | Doomless |
|---|---|
| Leaves you staring at a harsh blank screen or guilt-trip graphic | **Instantly swaps** the doomscroll for a 30-second unit of your actual work |
| Geared toward students (flashcards, GCSEs, SATs) | Built for **knowledge workers & devs** (sprint tickets, PRs, reading lists) |
| Binary all-or-nothing site blocking | **Granular controls** (disable Shorts/Reels while keeping search & tools) |
| Requires cloud accounts, external databases, or subscriptions | **100% client-side**, offline-first, $0 server cost, zero tracking |

---

## ✨ Features

- **🎯 Zero-Flicker Interception**: Executes at `document_start` using scoped CSS injection — hides feeds before the DOM paints with 0ms flash.
- **🎛 Granular Distraction Filtering**:
  - **YouTube**: Intercept the Home Feed, disable **Shorts**, or hide Watch Sidebar recommendations.
  - **Instagram**: Intercept the Main Feed, block **Reels**, or hide the Explore tab.
  - **TikTok**: Intercept the **For You Page (FYP)**, Following stream, or LIVE broadcast tab.
- **🎨 Cal.com Minimalist Design**: Crafted with crisp typography (Inter), neutral surfaces, zinc borders, and sleek, calm toggle switches.
- **📋 Frictionless Backlog Ingestion**:
  - Paste your sprint tasks or daily goals (supports `- [ ]` markdown checkboxes).
  - One-click import from `.md` or `.txt` notes.
  - Fetch open tickets directly from any GitHub repo (`owner/repo`).
- **☕ Shame-Free Breathers**: Choose between **Soft Nudge** (with an optional 5-minute unlock timer) or **Strict Boundary** (hard lock during sprint hours).
- **🔒 100% Private & Serverless**: All state is stored locally in `chrome.storage.local`. No external servers, no tracking, no cookies, and zero network calls.

---

## 🚀 Quick Install (Developer Mode)

Install and run locally in under 30 seconds:

1. Clone or download this repository:
   ```bash
   git clone https://github.com/your-username/doomless.git
   ```
2. Open Google Chrome and navigate to:
   ```text
   chrome://extensions
   ```
3. Toggle on **Developer mode** in the top-right corner.
4. Click **Load unpacked** and select the `doomless` folder.
5. Open [YouTube](https://youtube.com), [Instagram](https://instagram.com), or [TikTok](https://tiktok.com) to experience your new sprint swap!

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + Shift + F` *(Mac: `Cmd + Shift + F`)* | Toggle Doomless interception ON / OFF globally |

---

## 🛠 Tech Stack

- **Platform**: Chrome Extension (Manifest V3)
- **Frontend**: Vanilla JavaScript (ES2022), Semantic HTML5, CSS3 Variables
- **Storage**: `chrome.storage.local` with deep-merge schema hydration
- **Typography**: Inter by Rasmus Andersson
- **Backend**: **None** — 100% client-side sandboxed architecture

---

## 📄 License

MIT © [Your Name / Organization]
