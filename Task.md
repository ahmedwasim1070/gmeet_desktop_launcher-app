# Task: Premium Services via Microsoft Store (In-App Purchases)

Goal: sell the **Annual ($5.00/year)** and **LifeTime ($20.00 one-time)** premium plans
shown in `PremiumPlansPopup` through the Microsoft Store, and gate premium features
(Virtual Backgrounds, Schedule Meetings, Ad-Free, Priority Support) on the resolved license.

## Current State

Frontend scaffolding is **done** (this session):

| Piece | File | Status |
| :--- | :--- | :--- |
| Store bridge (Tauri `invoke` calls + free-tier fallback) | `src/services/microsoftStore.ts` | ✅ done (Store IDs are TODO placeholders) |
| `AppServices` wrapper — clipboard watcher + premium context | `src/components/services/AppServices.tsx` | ✅ done |
| `usePremiumServices()` hook — `license`, `isPremium`, `openPremiumPopup()`, `purchase(plan)` | exported from `AppServices.tsx` | ✅ done |
| Plans popup wired to `purchase(plan)` | `src/components/premium/PremiumPlansPopup.tsx` | ✅ done |
| Types `PremiumPlanCode`, `PremiumLicense` | `src/types/index.ts` | ✅ done |

The Rust side does **not** exist yet. Until it does, `fetchPremiumLicense()` /
`purchasePremiumPlan()` catch the "command not found" error and fall back to the free
tier — the app keeps working in dev and on non-Windows machines.

Nothing opens the premium popup yet. Call `usePremiumServices().openPremiumPopup()`
from any component inside `<AppServices>` (e.g. an "Upgrade" button or a gated feature).

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
- [ ] Paste the Store IDs into `STORE_ADDON_IDS` in `src/services/microsoftStore.ts`.

## Phase 2 — Rust: Windows.Services.Store Integration

The Store APIs are WinRT (`Windows.Services.Store`), callable from Rust with the
official `windows` crate. They only work when the app runs **packaged (MSIX) with
Store identity** — plain `cargo tauri dev` has no identity, so everything must be
`#[cfg(windows)]`-gated and fail soft.

- [ ] Add to `src-tauri/Cargo.toml`:
  ```toml
  [target.'cfg(windows)'.dependencies]
  windows = { version = "0.58", features = [
    "Services_Store",
    "Foundation_Collections",
    "Win32_UI_Shell",           # IInitializeWithWindow
    "Win32_Foundation",
  ] }
  ```
- [ ] Create `src-tauri/src/store.rs` with two commands (must match the names used in
      `src/services/microsoftStore.ts`):
  - [ ] `get_premium_license` → `StoreContext::GetDefault()` →
        `GetAppLicenseAsync()` → inspect `AddOnLicenses()` for the two add-on
        Store IDs → return `{ isPremium, plan }` (serde-serialized, camelCase).
  - [ ] `purchase_premium_plan(store_id: String)` →
        `RequestPurchaseAsync(store_id)` → on `Succeeded`/`AlreadyPurchased`,
        re-read the license and return it.
  - [ ] **Desktop-app requirement:** before any purchase call, initialize the
        `StoreContext` with the window handle — cast the context to
        `IInitializeWithWindow` and call `Initialize(hwnd)` using the HWND from
        `tauri::Window::hwnd()`. Without this the purchase dialog cannot show and
        the call fails.
  - [ ] Add `#[cfg(not(windows))]` stubs returning the free-tier license so
        macOS/Linux dev builds compile.
- [ ] Register in `src-tauri/src/lib.rs`:
  ```rust
  .invoke_handler(tauri::generate_handler![
      store::get_premium_license,
      store::purchase_premium_plan
  ])
  ```
- [ ] WinRT async (`IAsyncOperation`) blocks — run the Store calls inside
      `tauri::async_runtime::spawn_blocking` and make both commands `async`.

## Phase 3 — Frontend Wiring

- [ ] Replace the `TODO_PARTNER_CENTER_*` placeholders in
      `src/services/microsoftStore.ts` with the real Store IDs (Phase 1).
- [ ] Add a visible entry point that calls `openPremiumPopup()` (e.g. an
      "Upgrade to Premium" button in the greetings row or title bar).
- [ ] Surface purchase failures to the user (currently only `console.error`) —
      e.g. an error line inside `PremiumPlansPopup` when `purchase()` leaves
      the license on `free`.

## Phase 4 — Feature Gating

Use `usePremiumServices().isPremium` to gate:

- [ ] **Schedule Meetings** — open the premium popup instead of
      `ScheduleMeetingPopup` for free users (or allow N free meetings first — decide).
- [ ] **Virtual Backgrounds** — gate the download action in
      `src/components/backgrounds/BackgroundCard.tsx` (feature itself still WIP).
- [ ] **Ad-Free** — no ads exist yet; when added, hide for premium.
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



-- .css - scroll bar ! 
	<main className="app-scroll flex-1">
		{/* ...rest of AppContent */}
	</main>
-- Popup : settings & Schedule a meeting Pop