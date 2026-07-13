# G-Meet Desktop Launcher

**Package Name:** `ideaforge.G-MeetDesktopLauncher`

A lightweight desktop utility designed to streamline Google Meet access, scheduling, and session management. It removes browser overhead by providing a direct, native experience for launching and organizing meetings efficiently.

---

## 🌐 Live Deployment

| Environment    | Status        | Access                                                                |
| :------------- | :------------ | :-------------------------------------------------------------------- |
| **Production** | 🟢 **Online** | [**Microsoft Store**](https://apps.microsoft.com/detail/9PHKS01R0C0B) |

---

## 💎 Premium & In-App Purchases

Premium is sold through **Microsoft Store in-app purchases** (`Windows.Services.Store`)
as two add-ons — an **Annual Plan** and a **LifeTime Plan**. The license is resolved
natively from the Store on every launch (`src-tauri/src/store.rs`) and gates the
premium features:

- Virtual background downloads
- Meeting scheduling & reminders
- 24/7 priority support

Creating and joining meetings stays free. Payments are handled entirely by the
Microsoft Store purchase dialog — the app never sees or stores payment data.

### Developer Environment

`VITE_APP_ENVIRONMENT` in `.env` (`DEVELOPMENT` / `PRODUCTION`) unlocks premium
locally for testing (shown as the "Developer" plan in Settings). It is baked in
at build time and double-locked: `.env.production` pins `PRODUCTION` for every
release build, and release bundles ignore the flag in code — so shipped packages
can never grant the developer license.

---

## 🛠 Tech Stack

### Core Architecture

- **Framework:** Tauri v2 (Rust-based desktop runtime)
- **UI:** React (Vite)
- **Language:** TypeScript, Rust
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Packaging:** MSIX / msixbundle (x64 + ARM64, Windows Store Ready)

---

## ⚖️ License & Rights

**Status:** Proprietary / Closed Source

This application is distributed as a closed-source product by Idea Forge.

- Source code is not publicly available.
- Redistribution and modification are restricted.
- Provided for demonstration and usage via official releases only.

---

© 2026 Idea Forge. All rights reserved.
