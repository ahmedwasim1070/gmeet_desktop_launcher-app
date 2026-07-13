# Task: Premium Services via Microsoft Store (In-App Purchases)

Goal: sell the **Annual ($5.00/year)** and **LifeTime ($20.00 one-time)** premium plans
shown in `PremiumPlansPopup` through the Microsoft Store, and gate premium features
(Virtual Backgrounds, Schedule Meetings, Ad-Free, Priority Support) on the resolved license.

## Current State

Frontend scaffolding is **done** (this session):

| Piece | File | Status |
| :--- | :--- | :--- |
| Store bridge (Tauri `invoke` calls + free-tier fallback) | `src/services/PremiumServices.ts` | ✅ done (Store IDs are TODO placeholders) |
| `AppServices` wrapper — clipboard watcher + premium context | `src/components/services/AppServices.tsx` | ✅ done |
| `usePremiumServices()` hook — `license`, `isPremium`, `openPremiumPopup()`, `purchase(plan)` | exported from `AppServices.tsx` | ✅ done |
| Plans popup wired to `purchase(plan)` | `src/components/premium/PremiumPlansPopup.tsx` | ✅ done |
| Types `PremiumPlanCode`, `PremiumLicense` | `src/types/index.ts` | ✅ done |

The Rust side is **done** (`src-tauri/src/store.rs`) — see Phase 2. On unpackaged
dev builds and non-Windows machines the Store is unreachable, so `fetchPremiumLicense()` /
`purchasePremiumPlan()` catch the error and fall back to the free tier — the app
keeps working everywhere.

The premium popup opens automatically on every launch for free users
(`PremiumProvider`), from the `PremiumStatusButton` in the header / on gated
cards, and when a free user hits "Schedule New".

---

## Phase 1 — Partner Center Setup

- [ ] In [Partner Center](https://partner.microsoft.com/dashboard), open the app
      (`ideaforge.G-MeetDesktopLauncher`, Store ID `9PHKS01R0C0B`) → **Add-ons** → create two add-ons:
  - [ ] **Annual Plan** — product type **Subscription**, period *1 year*
        (if subscription add-ons aren't offered for the account/app type, use
        **Durable** with a 365-day expiration instead).
  - [ ] **LifeTime Plan** — product type **Durable**, *never expires*.
- [ ] Set pricing: Annual $5.00, LifeTime $20.00.
- [ ] Publish the add-ons and copy their **Store IDs** (12-char codes like `9NBLGGH4TNMP`).
- [ ] Paste the Store IDs into `STORE_ADDON_IDS` in `src/services/PremiumServices.ts`.

## Phase 2 — Rust: Windows.Services.Store Integration

The Store APIs are WinRT (`Windows.Services.Store`), callable from Rust with the
official `windows` crate. They only work when the app runs **packaged (MSIX) with
Store identity** — plain `cargo tauri dev` has no identity, so everything must be
`#[cfg(windows)]`-gated and fail soft.

- [x] Add to `src-tauri/Cargo.toml` (pinned `0.61` to match the version already
      in `Cargo.lock`):
  ```toml
  [target.'cfg(windows)'.dependencies]
  windows = { version = "0.61", features = [
    "Foundation",
    "Foundation_Collections",
    "Services_Store",
    "Win32_Foundation",
    "Win32_UI_Shell",           # IInitializeWithWindow
  ] }
  ```
- [x] Create `src-tauri/src/store.rs` with two commands (must match the names used in
      `src/services/PremiumServices.ts`):
  - [x] `get_premium_license` → `StoreContext::GetDefault()` →
        `GetAppLicenseAsync()` → inspect `AddOnLicenses()` for the two add-on
        Store IDs → return `{ isPremium, plan }` (serde-serialized, camelCase).
        The plan→Store ID mapping is passed in from the frontend (`addonIds`)
        so Partner Center IDs live in `PremiumServices.ts` only.
  - [x] `purchase_premium_plan(store_id: String)` →
        `RequestPurchaseAsync(store_id)` → on `Succeeded`/`AlreadyPurchased`,
        re-read the license and return it.
  - [x] **Desktop-app requirement:** before any purchase call, initialize the
        `StoreContext` with the window handle — cast the context to
        `IInitializeWithWindow` and call `Initialize(hwnd)` using the HWND from
        `tauri::Window::hwnd()`. Without this the purchase dialog cannot show and
        the call fails.
  - [x] Add `#[cfg(not(windows))]` stubs returning the free-tier license so
        macOS/Linux dev builds compile.
- [x] Register in `src-tauri/src/lib.rs` (plus `backgrounds::save_background`,
      which copies a bundled background into the user's Downloads folder):
  ```rust
  .invoke_handler(tauri::generate_handler![
      store::get_premium_license,
      store::purchase_premium_plan,
      backgrounds::save_background
  ])
  ```
- [x] WinRT async (`IAsyncOperation`) blocks — run the Store calls inside
      `tauri::async_runtime::spawn_blocking` and make both commands `async`.
- [ ] Compile-check on a Windows machine (`cargo check` in `src-tauri`) — the
      Windows-only code path cannot be built on the macOS dev machine.

## Phase 3 — Frontend Wiring

- [ ] Replace the placeholder Store IDs in `STORE_ADDON_IDS`
      (`src/services/PremiumServices.ts`) with the real Store IDs (Phase 1).
- [x] Add a visible entry point that calls `openPremiumPopup()` —
      `PremiumStatusButton` in the header (with license-loading state), plus
      auto-open on launch for free users.
- [ ] Surface purchase failures to the user (currently only `console.error`) —
      e.g. an error line inside `PremiumPlansPopup` when `purchase()` leaves
      the license on `free`.

## Phase 4 — Feature Gating

Use `usePremiumServices().isPremium` to gate:

- [x] **Schedule Meetings** — "Schedule New" opens the premium popup for free
      users, and `ScheduledMeetingCard` shows a premium-gate overlay.
- [x] **Virtual Backgrounds** — download gated in
      `src/components/backgrounds/BackgroundCard.tsx` (premium overlay for free
      users; icon-only download button saves to Downloads for premium users).
- [ ] Cache the last known license in `localStorage` so premium users aren't
      blocked while offline; refresh from the Store on every launch.

## Phase 5 — Testing & Submission

- [ ] Store purchases only work with Store identity: test by building the MSIX
      (`npm run tauri:windows:build`), sideloading it signed with the Store
      association, or installing a flighted package from the Store.
- [ ] Test matrix: fresh install (free) → purchase Annual → relaunch (still premium) →
      purchase LifeTime path → subscription expiry (Partner Center sandbox).
- [ ] Verify graceful fallback on an unpackaged dev build (must behave as free tier, no crashes).
- [ ] Update the Store listing: mention in-app purchases; re-submit the app with the
      new package version and the two add-ons live.

## References

- Windows In-app purchases overview: <https://learn.microsoft.com/windows/uwp/monetize/in-app-purchases-and-trials>
- Enable purchases of apps & add-ons (`StoreContext`): <https://learn.microsoft.com/windows/uwp/monetize/enable-in-app-purchases-of-apps-and-add-ons>
- `StoreContext` in desktop (Win32/MSIX) apps + `IInitializeWithWindow`: <https://learn.microsoft.com/windows/apps/develop/windows-integration/use-store-context-desktop>
- Add-on submission in Partner Center: <https://learn.microsoft.com/windows/apps/publish/publish-your-app/add-on/create-app-submission>
- `windows` crate docs (`Services::Store`): <https://microsoft.github.io/windows-docs-rs/doc/windows/Services/Store/>

## Building MSIX (x64 + ARM64)

`npm run tauri:windows:build` now builds **x64 and arm64** and combines them into
`src-tauri/target/msix/*.msixbundle` (upload that single file to Partner Center).
`npm run tauri:windows:build:x64` stays available for quick single-arch builds.
One-time setup on the Windows build machine:

```bash
rustup target add x86_64-pc-windows-msvc aarch64-pc-windows-msvc
```

32-bit (x86) is intentionally skipped: the bundler only supports x64/arm64,
Windows 11 has no 32-bit edition, and the remaining Win10 32-bit share is
negligible — not worth the pain.
