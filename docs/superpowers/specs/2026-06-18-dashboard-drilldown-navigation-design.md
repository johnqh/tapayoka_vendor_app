# Dashboard drill-down navigation — design

**Date:** 2026-06-18
**App:** `tapayoka_vendor_app` (React web, Vite, React Router v6)
**Goal:** Bring the web dashboard's navigation to parity with `tapayoka_vendor_app_rn`, which uses a clear per-level drill-down. Specifically, let a vendor navigate **deeper from a Model (and a Location) into its Offerings, then into each offering's Installations, then into each installation's Slots.**

## Background

### Reference: the RN app (the "clear" model)
Each tab is a drill-down stack — one screen per level, with a dynamic title and a back button at every step:

- **Models:** `ModelsList → ModelOfferings` (⚙ → `ModelSettings`) `→ OfferingDetail` (installations) `→ SlotManagement` (slots)
- **Locations:** `LocationsList → LocationOfferings → OfferingDetail → SlotManagement`

`OfferingDetail` and `SlotManagement` are **shared** screens, contextualized by a `parentType: 'location' | 'model'` param. Count badges (offerings / installations / slots) signal there is more inside.

### Current web app
React Router v6 with a `MasterDetailLayout` shell + left sidebar. Routes live under `/dashboard/:entitySlug/*` (`DashboardPage` renders the sidebar + `<Outlet/>`). `ModelDetailPage` shows model settings plus an **inline offerings table** that dead-ends: offerings open a modal, installations are only a count badge, and there is **no way to reach installations or slots**. `LocationDetailPage` is analogous. There are no offering/installation routes and no deep-linking.

The web hierarchy stops two levels short of the RN app.

### Data hooks (already exported by the installed `@sudobility/tapayoka_lib`)
- `useVendorOfferingsManager(networkClient, baseUrl, entitySlug, token, parentId, parentType)` → `{ offerings, isLoading, error, refresh, addOffering, updateOffering, deleteOffering, clearError }`
- `useVendorInstallationsManager(networkClient, baseUrl, entitySlug, token, offeringId)` → `{ installations, isLoading, error, refresh, addInstallation, updateInstallation(walletAddress, data), deleteInstallation(walletAddress), clearError }`
- `useVendorInstallationSlotsManager(networkClient, baseUrl, entitySlug, token, installationWalletAddress)` → `{ slots, isLoading, error, refresh, addSlot, bulkCreateSlots, updateSlot(slotId, data), deleteSlot(slotId), deleteAllSlots, clearError }`

The web app already uses `useVendorOfferingsManager` (in `ModelDetailPage`/`LocationDetailPage`); the installation/slot hooks are new to the web app but exported by the same package the RN app uses.

## Decisions (agreed)

1. **Pattern:** drill-down pages as **nested URL routes** + a **breadcrumb** trail (not Miller columns, not inline accordions). Mirrors RN and adds deep-linkable URLs.
2. **Depth/scope:** drill all the way through **Slots**, **view-first** — build the pages and lists now; reuse the existing offering create/edit modal; add basic installation/slot edit where cheap; **defer** heavy device-pairing and grid-generation UI (see Deferred).
3. **Locations too:** apply the same drill-down to Locations, using the shared offering/installation pages.
4. **Model settings:** stay **inline** on the model page (with the offerings list below it); no separate settings route.

## Route structure

Extend the existing nested routes under `DashboardPage` (same sidebar shell). Two **new shared** page components serve both subtrees.

```
Models
  /dashboard/:entitySlug/models                                              ModelsPage            [exists]
  /dashboard/:entitySlug/models/:modelId                                     ModelDetailPage       [modify]
  /dashboard/:entitySlug/models/:modelId/offerings/:offeringId               OfferingDetailPage    [NEW, shared]
  /dashboard/:entitySlug/models/:modelId/offerings/:offeringId/installs/:wallet
                                                                             InstallationDetailPage [NEW, shared]
Locations
  /dashboard/:entitySlug/locations                                           LocationsPage         [exists]
  /dashboard/:entitySlug/locations/:locationId                               LocationDetailPage    [modify]
  /dashboard/:entitySlug/locations/:locationId/offerings/:offeringId         OfferingDetailPage    [shared]
  /dashboard/:entitySlug/locations/:locationId/offerings/:offeringId/installs/:wallet
                                                                             InstallationDetailPage [shared]
```

- `:wallet` is the installation's `walletAddress` (its real key; `0x`-hex is URL-safe). It is passed to `useVendorInstallationSlotsManager` and to `updateInstallation`/`deleteInstallation`.
- **Parent inference:** a small pure helper `resolveOfferingParent(params)` returns `{ parentType, parentId }` — `modelId` present → `{ 'model', modelId }`; `locationId` present → `{ 'location', locationId }`. This is the web mirror of the RN `parentType` param and is the unit test target.

## Components

### New
- **`OfferingDetailPage`** (shared) — the offering's **installations list** (RN `OfferingDetailScreen`).
  - Data: `useVendorOfferingsManager(parentId, parentType)` → `find(o => o.id === offeringId)` for name / `pricingTiers` / `vendorModelId`; `useVendorModelsManager()` → find the model (slot type, pricing) for slot context; `useVendorInstallationsManager(offeringId)` → the list.
  - UI: breadcrumb; offering summary header with **edit** (reuse `OfferingModal`); a `Table` of installations (label + slot-count badge) whose rows link to the installation route; installation **edit-label / delete** via `updateInstallation` / `deleteInstallation`.
- **`InstallationDetailPage`** (shared) — the installation's **slots list** (RN `SlotManagement`).
  - Data: `useVendorInstallationSlotsManager(wallet)`; the model's `slot` type drives the view.
  - UI: breadcrumb; a `Table`/list of slots; basic add/edit/delete of single slots (`addSlot` / `updateSlot` / `deleteSlot`) behind a small slot form (reuse `Modal` + `FormField`).
- **`Breadcrumbs`** — top-of-page trail (`Models › {model} › {offering} › {installation}`), each segment a link up the tree. Use `@sudobility/components`' breadcrumb if it exports one; otherwise a small local component.
- **`resolveOfferingParent(params)`** — pure helper (URL params → `{parentType, parentId}`); unit tested.

### Modified
- **`ModelDetailPage`** — keep settings inline; make offerings-table rows **link** to `…/offerings/:offeringId` (the create/edit modal stays for CRUD); add a breadcrumb.
- **`LocationDetailPage`** — make offerings-table rows drill-in links; add a breadcrumb.
- **`App.tsx`** (or the routes module) — register the four new nested routes.

The left sidebar is unchanged; the top-level section highlight stays put while drilling happens in the content pane.

## Data flow

- **OfferingDetailPage:** resolve parent from URL → offerings manager (find offering) + models manager (find model for slot context) → installations manager (`offeringId`) → list. Row click navigates to the installation route.
- **InstallationDetailPage:** installations manager (`offeringId`) → find installation by `wallet` (label, for breadcrumb/header) → slots manager (`wallet`) → list. Model's `slot` type selects which slot affordances are shown.

## Deferred (surface as disabled / "coming soon", not silently omitted)

- **Installation creation via QR / device-address pairing** (RN `QRScannerModal`). For now: view + edit-label + delete + drill into slots. Creating installations is deferred.
- **multi-2D grid generator** (`bulkCreateSlots`) and multi-2D grid view. For now: single-slot add/edit/delete only.

## Cross-cutting

- **States:** every drill page handles loading (`Spinner`), error (`Alert`), and empty (`"No installations yet"` / `"No slots yet"`).
- **Reuse:** built from components already adopted in the app — `Table`, `Button`, `Badge`, `Modal`/`ModalHeader`/`ModalContent`/`ModalFooter`, `Spinner`, `Alert`, `FormField`.
- **Styling/brand:** unchanged; reuse existing tokens and the design system, consistent with the rest of the dashboard.

## Testing

Proportional to the app's existing light suite:
- Unit test `resolveOfferingParent(params)` for both model and location URLs.
- Reuse/extend tests for any price/duration format helpers used in the new pages.
- A render smoke check that the new routes mount and show their empty state without crashing.

## Acceptance criteria

1. From a **Model** page, clicking an offering navigates to a dedicated offering page showing that offering's **installations**; clicking an installation navigates to a page showing its **slots**. Same flow from a **Location** page.
2. Every drill-down page shows a **breadcrumb** trail with working up-links, and the URL is **deep-linkable** (pasting `…/models/:id/offerings/:id/installs/:wallet` lands on the right page).
3. The shared offering/installation pages render correctly under both the `/models/...` and `/locations/...` subtrees (parent inferred from the URL).
4. Loading, error, and empty states are handled on each new page.
5. Deferred features (QR pairing, 2D grid generator) appear as clearly-labeled disabled affordances, not missing/broken UI.
6. `bun run typecheck`, `bun run lint`, `bun run test`, and `bun run build` all pass.

## Out of scope

- Changes to the left sidebar / top-level IA, Orders, Members/Invitations/Workspaces.
- New backend endpoints (uses existing manager hooks only).
- Mobile-specific redesign beyond what the existing responsive layout already provides.
