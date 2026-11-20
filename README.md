# ZH Labs Command Center

> **Brand:** ZH Labs  
> **Tagline:** Build. Automate. Grow.  
> **Platform:** Google Chrome (Manifest V3 Extension) & Modern Web Application  
> **Primary User:** Zunaid Ishan ([@zunaidhasan](https://github.com/zunaidhasan))

---

## 1. Product Overview

**ZH Labs Command Center** is a personal productivity operating system and Chrome New Tab dashboard designed specifically for AI engineering, full-stack development, client operations, agency workflows, UI/UX design, and deep focus.

Rather than presenting an empty new tab or a static bookmark list, ZH Labs Command Center unifies frequently accessed engineering resources, agency pipeline trackers, client communication contexts, design utilities, and focus sessions into an aesthetic dark developer-tool workspace.

---

## 2. Visual Design System

Designed after a minimalist dark technical aesthetic matching the visual mockups:

| Design Token | Hex Code | Purpose |
|---|---|---|
| **Main Background** | `#090B10` | Deep obsidian backdrop |
| **Primary Card Surface** | `#11151D` | Elevated container cards |
| **Secondary Surface** | `#181D27` | Inner widgets and inputs |
| **Border Default** | `#262C37` | Subtle technical division |
| **Primary Accent** | `#EF233C` | Signature ZH Labs Crimson Red |
| **Engineering Accent** | `#1EA7FF` | Terminal and code highlights |
| **Client Operations Accent**| `#18D879` | Sales, Fiverr, and revenue metrics |
| **Creative Accent** | `#B66BFF` | Design, Fal.ai, and Webflow tools |
| **Personal Accent** | `#FFB21A` | Learning, research, and quick notes |
| **Primary Text** | `#F5F6F8` | High contrast readable content |
| **Secondary Text** | `#9299A8` | Subtitles, labels, and metadata |

### Typography
- **Headings:** Space Grotesk
- **Body Content:** Inter
- **Technical Metadata & Code:** IBM Plex Mono

---

## 3. Core Modules & Features

### A. Four-Zone Bookmark Architecture
1. **AI & Full-Stack Engineering Hub:**
   - **Folder 1: AI Research & Agents** (Perplexity AI, Grok, ChatGPT, Qwen Chat, Manus, Z.ai Chat, LMSYS Arena, Ask-Chat)
   - **Folder 2: Software Dev & Coding** (GitHub, Vercel & KodeCupid, FreeBuff, Agent Browser, MonkeyCode AI)
2. **Client Operations & Sales Pipeline:**
   - **Folder 3: Client Ops & Agency** (Fiverr, Sardar IT Slack, Tsoro AI SEO, The Shanty & Co, WP Pro Converter)
   - **Quick Stats Chart:** Live glowing sparkline with monthly growth metrics
3. **UI/UX & Design Sandbox:**
   - **Folder 4: Design & Creative AI** (Fal.ai, Adobe Firefly, Figma, Transjt AI, NovaPersona Webflow)
   - **Quick Tools Launchers:** Direct triggers for Color Picker, JSON Formatter, SVG Optimizer, and Image Converter
4. **Personal & Quick-Research Scratchpad:**
   - **Folder 5: Learning & Utilities** (YouTube, Grammarly, APKPure, Full Page Capture, Wappalyzer)
   - **Todo / Notes Mini Checklist:** Real-time interactive tasks with celebratory confetti

### B. Universal Command Palette (`Ctrl + K` / `Cmd + K`)
- Instant fuzzy search across Bookmarks, Projects, Tasks, and Notes.
- Slash Command Execution:
  - `/theme <preset>` — Switch between Midnight, Cyber, Violet, Crimson, Forest, Light
  - `/workspace <mode>` — Switch between Engineering, Client Ops, Creative, Personal
  - `/todo <task>` — Create a new task
  - `/note <content>` — Save a quick note
  - `/github <repo>` — Search repositories
  - `/docs <query>` — Search DevDocs
  - `/search <query>` — Google search

### C. Personal Profile & Avatar Customizer
- Custom Avatar upload with local storage persistence
- Display Name (`Zunaid Ishan`), Username (`@zunaidhasan`), and Status indicator (`Online`, `Coding`, `In the zone`)
- Social profile links (GitHub, LinkedIn, Fiverr, Slack)

### D. Advanced Theme Engine
- 6 Handcrafted Presets: **Midnight**, **Cyber**, **Violet**, **Crimson**, **Forest**, and **Light**
- Custom Hex Accent Color Picker
- Wallpaper Presets: Midnight Mountain, Cyber Grid, Deep Space, Gradient Aura, Minimalist
- Adjustable Wallpaper Opacity, Card Backdrop Blur, and Density toggles

### E. Productivity Suite
- **To-Do Task Checklist:** Priority badges (urgent, high, medium, low), due dates, and completion status
- **Markdown Quick Notes:** Create, edit, pin, search, and 1-click copy code snippets
- **Daily Focus Widget:** Primary daily mission outcome with Top 3 focus tasks
- **Pomodoro Focus Timer:** 25m work / 5m short break / 15m long break with Web Audio harmonic chimes
- **Client Brief Contexts:** Structured notes template for requirements, budget, deadlines, and next actions

### F. Projects & Deployment Health Monitor
- Preconfigured with **DeshVox**, **EchoNote**, **ZHcode**, and **KodeCupid**
- Real-time HTTP ping health checks with latency recording
- Environment tags (Production, Staging, Development)

### G. Client Operations & Sardar IT Reference Engine
- Quick Launchers: Fiverr Dashboard, Fiverr Inbox, LinkedIn, Sardar IT Slack, Airtable Hub
- 6-Stage Kanban Pipeline (New Inquiries, Pending Reply, Proposals Sent, Active Orders, In Progress, Delivered)
- Portfolio Showcase Database: Searchable cases with 1-click client pitch copying

### H. Developer & Design Utilities
- **Color Picker & Converter:** Instant HEX / RGB / HSL conversion
- **JSON Formatter & Validator:** Beautify, minify, and schema validation
- **Base64 Tool:** Encode and decode text
- **URL Tool:** Encode and decode query strings
- **SVG Optimizer:** Minifies markup with real-time SVG rendering
- **QR Code Generator:** Generates scannable QR codes
- **Image Converter & Compressor:** In-browser canvas conversion between WebP, JPEG, and PNG

### I. Browser Lock & Session Security
- **Password barrier:** full-screen lock replaces the dashboard before any workspace data mounts. Passwords are stretched with **PBKDF2-SHA256 (210,000 iterations)** and a random 16-byte salt; only the hash is stored, never the password.
- **Session guarding:** lock manually from the sidebar or Settings → *Browser Lock & Security*. Every tab is redirected to the lock page, with the original URLs snapshotted and restored after a successful unlock.
- **Sensitive page blocking:** `chrome://`, `edge://`, `devtools://`, `about:` and similar browser-internal pages are denied while locked (closed if the browser refuses the redirect).
- **Idle auto-lock:** configurable inactivity timer (Off / 1–60 minutes) enforced by both `chrome.idle` in the service worker and an in-page activity fallback.
- **Lock on startup:** optionally require the password the first time Chrome starts.
- **Failed-attempt monitoring:** failed unlocks are logged (timestamp + lock reason, capped at 50), with a lockout after 5 consecutive failures for 60 seconds.

> **Security scope:** this is a local access barrier for this Chrome profile, not disk encryption.
> It cannot intercept OS-level shortcuts (`Ctrl+W`, `Ctrl+Shift+I`) or DevTools opened from an
> external process, and anyone with file-system access can read extension storage. Use full-disk
> encryption and your OS account lock for protection at that layer.

---

## 4. Technology Stack

- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS + PostCSS
- **Icons:** Lucide Icons + Custom SVG Brand Badges
- **State Management:** Zustand
- **Local Persistence:** Chrome Storage API + IndexedDB (`idb`) + LocalStorage Fallback
- **Extension Platform:** Chrome Extension Manifest V3
- **Testing:** Vitest + React Testing Library + Fake-IndexedDB

---

## 5. Chrome Extension Installation Guide

You can load the build into Google Chrome as your default New Tab in 60 seconds:

1. **Build the extension package:**
   ```bash
   npm run build
   ```
2. Open Google Chrome and enter:
   ```
   chrome://extensions
   ```
3. Enable **Developer mode** via the toggle switch in the top-right corner.
4. Click **Load unpacked** in the top-left toolbar.
5. Select the **`dist`** directory generated inside the project folder (for example `<project-folder>\dist`).
6. Open a new tab (`Ctrl + T`) to launch **ZH Labs Command Center**! (The extension overrides the new tab page.)

> If the extension was already loaded before the manifest fix, click the **Reload** icon on the
> extension card in `chrome://extensions`. After changing `public/manifest.json`, run `npm run build`
> again so `dist/manifest.json` is refreshed.

---

## 6. Running Development Server

To develop locally in regular browser mode:

```bash
# Install dependencies
npm install

# Start local dev server
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 7. Running Unit Tests

```bash
# Execute test suite
npm test
```

All 38 tests across bookmarks, theme switching, project management, profile updates, productivity state, and browser-lock crypto/lockout behavior pass with 0 errors.

---

## 8. Extension Notes

- **New tab override:** the extension replaces the new tab page and opens the dashboard. Clicking the toolbar icon opens it in a normal tab.
- **Permissions:** `storage` (settings/state), `bookmarks` (read and sync Chrome bookmarks), `tabs` (lock enforcement — redirect/restore guarded tabs), `idle` (idle auto-lock), and `https://*/*` + `http://*/*` (project deployment health checks).
- **Browser Lock storage:** `chrome.storage.local` key `lock_config` holds the salt + PBKDF2 hash and security settings; `chrome.storage.session` key `lock_tab_snapshot` holds the temporary tab URL map while locked (cleared on unlock/browser restart).
- **CSP:** the build ships `script-src 'self'; object-src 'self'` — no inline scripts and no remote code, as required by Manifest V3.
- **Fonts are self-hosted** (`src/assets/fonts`, SIL OFL licensed) so the dashboard renders identically offline.

### Packaging

```bash
npm run chrome:pack   # zips dist/ into release/extension.zip
npm run chrome:build  # build + optional dist/update.xml
```

The extension version comes from `package.json` and is injected into
`public/manifest.json` / `dist/manifest.json` automatically on build. To generate
the auto-update manifest, provide the published extension ID:

```bash
EXTENSION_ID=<32-character-extension-id> npm run chrome:build
```

---

## 9. License

Designed and developed for **ZH Labs**.  
**Build. Automate. Grow.**
