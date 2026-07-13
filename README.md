<div align="center">

    
# ⚙️ MaintainIQ
### Enterprise Infrastructure Ledger & Predictive Maintenance Portal

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.2-7952B3?logo=bootstrap&logoColor=white)](https://getbootstrap.com/)
[![HTML5](https://img.shields.io/badge/HTML5-Semantic-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![Status](https://img.shields.io/badge/Status-Active-success)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)]()

*A premium, responsive, performance-optimized single-page portal for critical infrastructure asset management, predictive maintenance scheduling, and real-time operational logging.*

[Overview](#-overview) •
[Features](#-key-features) •
[Architecture](#-architecture) •
[Getting Started](#-getting-started) •
[Customization](#-customization) •
[Roadmap](#-roadmap) •
[Contributing](#-contributing)

</div>

---

## 🧭 Overview

**MaintainIQ** is a glassmorphism-inspired operational dashboard built for field engineers, maintenance supervisors, and operations directors who need a fast, data-dense view of infrastructure health. It ships as a **monolithic, dependency-light single-page application** — no build step, no bundler, no backend required to preview — making it trivial to fork, brand, and wire into an existing API or auth layer.

The interface prioritizes **scannability at density**: analytics tiles surface health at a glance via state-indicative glow accents, while the Infrastructure Ledger table supports multi-level status tagging and fast client-side filtering for high-volume asset registries.

---

## 🚀 Key Features

| Category | Capability | Details |
|---|---|---|
| **UI/UX** | Premium SaaS aesthetic | Clean typography (Inter), micro-animations driven by CSS custom properties, native-feeling transitions |
| **Responsiveness** | Adaptive layout engine | Fluid breakpoints from micro-viewports (mobile) to high-density desktop monitors |
| **Analytics** | Dynamic health grid | At-a-glance KPI tiles with state-indicative glow accents (healthy / warning / critical) |
| **Data Management** | Infrastructure Ledger | High-scannability asset registry with quick filtering and multi-level status tags |
| **Auth** | Secure gate | Dual-state login/registration wrapper with smooth interactive toggles |
| **Theming** | Token-driven design | Centralized CSS custom properties for one-line rebranding |
| **Performance** | Zero build overhead | No bundler, no node_modules, no compile step — open and run |

---

## 🏗️ Architecture

### Design Philosophy

MaintainIQ follows a **utility-first layout, token-driven theming** approach:

- **Bootstrap 5.3.2** handles structural layout (grid, spacing, responsive containers)
- **Vanilla CSS custom properties (`:root` tokens)** handle all branding, motion, and elevation — enabling full re-skinning without touching component markup
- **Semantic HTML5** ensures accessibility and predictable DOM structure for future component extraction (e.g., migrating to React/Vue)

### System Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     index.html (SPA)                     │
├───────────────────────────┬───────────────────────────────┤
│      Presentation Layer     │        Interaction Layer      │
│  ─────────────────────────  │  ─────────────────────────── │
│  • Semantic HTML5 sections   │  • Auth gate state toggle    │
│  • Bootstrap 5.3.2 grid      │  • Ledger filter/search       │
│  • CSS custom-property       │  • Micro-interaction hooks    │
│    design tokens             │    (hover, focus, glow)       │
├───────────────────────────┴───────────────────────────────┤
│              Typography & Iconography Layer                │
│        Inter (Google Fonts) · Bootstrap Icons               │
└─────────────────────────────────────────────────────────┘
```

### Repository Structure

```
maintainiq/
├── index.html          # Monolithic single-page application entry point
│                        #   ├── <head>       → meta, font/icon CDN links, design tokens
│                        #   ├── Auth Gate     → login/registration toggle component
│                        #   ├── Analytics Grid→ KPI tiles with glow-state indicators
│                        #   ├── Ledger Table  → filterable asset registry
│                        #   └── Scripts       → vanilla JS interaction handlers
├── README.md            # Repository documentation and setup manual
├── LICENSE              # MIT license text
└── .gitignore           # (recommended) ignore local editor/IDE artifacts
```

> 💡 **Note:** The current structure is intentionally monolithic for rapid prototyping and zero-dependency deployment. See [Roadmap](#-roadmap) for the suggested modularization path.

---

## ⚡ Getting Started

### Prerequisites

| Requirement | Purpose | Notes |
|---|---|---|
| Modern browser | Renders the SPA | Chrome, Edge, Firefox, Safari (last 2 versions) |
| Git | Clone the repo | Optional — direct download also works |
| Local server (optional) | Live reload during editing | VS Code "Live Server" extension recommended |

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/MuhammadMuzammil-TheDeveloper/MaintainIQ-Enterprise-Infrastructure-Ledger.git

# 2. Navigate to the workspace
cd maintainiq

# 3a. Open directly in a browser
open index.html          # macOS
start index.html          # Windows
xdg-open index.html       # Linux

# 3b. OR serve locally with live reload (recommended for development)
npx live-server .
```

### Verifying the Build

Once open, confirm the following render correctly:

- [ ] Auth gate loads with login/registration toggle functional
- [ ] Analytics grid displays glow-state accent colors
- [ ] Ledger table populates and responds to filter input
- [ ] Layout reflows correctly at mobile, tablet, and desktop breakpoints

---

## 🎨 Customization

All branding and motion parameters are centralized as CSS custom properties in the `:root` block — no component markup needs to change to reskin the app.

```css
:root {
    /* Brand */
    --miq-primary:        #2563EB;  /* Signature branding color */
    --miq-primary-dark:   #1E40AF;  /* Hover/active state */
    --miq-success:        #16A34A;  /* Healthy-state glow accent */
    --miq-warning:        #D97706;  /* Warning-state glow accent */
    --miq-critical:       #DC2626;  /* Critical-state glow accent */

    /* Structure */
    --radius-lg:          18px;     /* Component rounding (cards, modals) */
    --radius-sm:          8px;      /* Rounding for inputs/badges */
    --glass-blur:         12px;     /* Glassmorphism backdrop-filter intensity */

    /* Motion */
    --transition-base:    0.25s cubic-bezier(0.4, 0, 0.2, 1);
    --transition-slow:    0.45s ease-in-out;
}
```

| Token | Default | Effect When Changed |
|---|---|---|
| `--miq-primary` | `#2563EB` | Recolors CTAs, active nav states, focus rings |
| `--radius-lg` | `18px` | Adjusts card/modal corner rounding sitewide |
| `--glass-blur` | `12px` | Controls glassmorphism panel translucency |
| `--transition-base` | `0.25s` | Tunes micro-interaction easing curve globally |

> ⚙️ **Tip:** Because theming is token-based, you can generate light/dark or client-specific themes by swapping a single `<style>` block or toggling a `data-theme` attribute at runtime.

---

## 🗺️ Roadmap

- [ ] Extract inline JS into modular `assets/js/*.js` files
- [ ] Introduce a lightweight state layer (e.g., Alpine.js) for the Ledger filter logic
- [ ] Add persistent theming via `localStorage`-backed `data-theme` switch
- [ ] Wire Auth Gate to a real backend (JWT / OAuth2) via a documented API contract
- [ ] Add automated accessibility audit (axe-core) to CI
- [ ] Publish a Storybook-style component reference for the design tokens

---

## 🤝 Contributing

Contributions are welcome. Please follow this workflow:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit changes with clear messages: `git commit -m "feat: add X"`
4. Push to your fork: `git push origin feature/your-feature-name`
5. Open a Pull Request describing the change and its motivation

Please keep PRs focused — one concern per PR — and preserve the existing token-driven theming convention rather than hardcoding colors or spacing.

---

## 📄 License

This repository is distributed under the **MIT License**. You are free to modify and deploy this baseline framework for commercial or educational operations. See [`LICENSE`](./LICENSE) for full terms.

---

<div align="center">

Built for teams who keep critical infrastructure running.

</div>
