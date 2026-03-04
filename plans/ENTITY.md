# Entity Support Plan

## Context

Currently all vendor data (locations, equipment categories, services, etc.) is tied to individual users via `firebaseUserId`. This needs to change to an organization-based model where data belongs to entities (organizations), enabling multi-user collaboration within a vendor organization. The existing `@sudobility/entity_service`, `@sudobility/entity_client`, and `@sudobility/entity_pages` libraries provide the foundation — this plan integrates them into the Tapayoka ecosystem and creates a React Native equivalent (`entity_pages_rn`).

**Post-login flow**: Login → TOS acceptance (if new) → auto-create organization → tab bar UX.

## Decisions

- API routes: `/api/v1/entities/:entitySlug/...` (match shapeshyft/whisperly)
- TOS Cancel: signs user out
- TOS tracking: `tosAcceptedAt` timestamp on users table
- Org creation: auto-generate name from displayName/email, editable later
- Schema: replace `firebaseUserId` with `entityId` (clean cut)
- RN UI: plain React Native components
- RN org screens: entity list, members, invitations (all three)
- Nav placement: under Settings tab
- Scope: both web and RN apps
- Entity types: organization only (no personal entities)

---

## Phase 1: Backend — tapayoka_api

### 1.1 Add entity_service dependency

```bash
cd ~/projects/tapayoka_api && bun add @sudobility/entity_service
```

### 1.2 Database schema changes

**File**: `src/db/schema.ts`

- Add entity tables using `createEntitiesTable`, `createEntityMembersTable`, `createEntityInvitationsTable` from entity_service (with `tapayoka` schema and `"tapayoka"` index prefix)
- Add `tosAcceptedAt: timestamp("tos_accepted_at")` to `users` table
- Replace `firebaseUserId` with `entityId: uuid("entity_id").notNull().references(() => entities.id, { onDelete: "cascade" })` on:
  - `vendorLocations` (remove `firebaseUserId`, add `entityId`)
  - `vendorEquipmentCategories` (remove `firebaseUserId`, add `entityId`)
- Update indexes: replace `firebase_user_idx` with `entity_idx` on both tables
- Update legacy `devices` and `services` tables: change `entityId` from `varchar` to `uuid` with FK to `entities.id`

### 1.3 Database initialization

**File**: `src/db/index.ts`

- Add `runEntityMigration()` call from entity_service in `initDatabase()` (after users table, before vendor tables)
- Config: `{ client, schemaName: "tapayoka", indexPrefix: "tapayoka", migrateProjects: false, migrateUsers: false }`

### 1.4 Entity helpers (new file)

**Create**: `src/lib/entity-helpers.ts`

- Copy pattern from `~/projects/shapeshyft_api/src/lib/entity-helpers.ts`
- Create singleton `entityHelpers` via `createEntityHelpers(config)`
- Implement `getEntityWithPermission(entitySlug, userId, requireEdit?)` returning discriminated union
- Implement `getPermissionErrorStatus(errorCode)` helper

### 1.5 Entity CRUD routes (new file)

**Create**: `src/routes/entities.ts` (replaces `src/routes/vendor/entities.ts`)

Following the shapeshyft/whisperly pattern:

- `GET /entities` — list user's entities
- `POST /entities` — create organization entity (+ set `tosAcceptedAt` on user)
- `GET /entities/:entitySlug` — get entity details + user role
- `PUT /entities/:entitySlug` — update entity (name, description)
- `DELETE /entities/:entitySlug` — delete entity (owner only)

### 1.6 Member routes (new file)

**Create**: `src/routes/entities/members.ts`

- `GET /entities/:entitySlug/members` — list members
- `PUT /entities/:entitySlug/members/:memberId` — update role
- `DELETE /entities/:entitySlug/members/:memberId` — remove member

### 1.7 Invitation routes (new file)

**Create**: `src/routes/entities/invitations.ts`

- `GET /entities/:entitySlug/invitations` — list pending invitations
- `POST /entities/:entitySlug/invitations` — create invitation
- `DELETE /entities/:entitySlug/invitations/:invitationId` — cancel
- `PUT /entities/:entitySlug/invitations/:invitationId` — renew
- `GET /invitations/mine` — list user's pending invitations
- `POST /invitations/:token/accept` — accept
- `POST /invitations/:token/decline` — decline

### 1.8 TOS / onboarding endpoint

**In**: `src/routes/entities.ts` (part of POST /entities)

- `POST /entities` accepts `{ displayName?, acceptTos: true }`
- Sets `tosAcceptedAt` on user record
- Creates organization entity with auto-generated slug
- Returns created entity

Also add:

- `GET /me` — returns user info including `tosAcceptedAt` (used by frontend to decide TOS screen)

### 1.9 Restructure vendor routes

**File**: `src/routes/index.ts`

Change from:
```
vendorRoutes.route("/locations", vendorLocations)
```

To entity-scoped routes:
```
entityRoutes.route("/entities/:entitySlug/locations", vendorLocations)
entityRoutes.route("/entities/:entitySlug/equipment-categories", vendorEquipmentCategories)
entityRoutes.route("/entities/:entitySlug/vendor-services", vendorServicesNew)
entityRoutes.route("/entities/:entitySlug/service-controls", vendorServiceControls)
entityRoutes.route("/entities/:entitySlug/equipments", vendorEquipments)
entityRoutes.route("/entities/:entitySlug/orders", vendorOrders)
entityRoutes.route("/entities/:entitySlug/devices", vendorDevices)
entityRoutes.route("/entities/:entitySlug/services", vendorServices)
entityRoutes.route("/entities/:entitySlug/qr", vendorQr)
entityRoutes.route("/entities", entitiesRouter)
entityRoutes.route("/invitations", invitationsRouter)
entityRoutes.route("/me", meRouter)
```

All entity-scoped routes require `firebaseAuth` middleware. The `roleGuard("vendor")` middleware stays on vendor-specific routes.

### 1.10 Rewrite all vendor route handlers

**Files** (all in `src/routes/vendor/`):
- `locations.ts`
- `equipmentCategories.ts`
- `vendorServices.ts`
- `serviceControls.ts`
- `equipments.ts`
- `orders.ts`
- `devices.ts`
- `services.ts`

**Pattern for each** (using locations as example):

```typescript
// Before:
const firebaseUid = c.get("firebaseUid");
const results = await db.select().from(vendorLocations)
  .where(eq(vendorLocations.firebaseUserId, firebaseUid));

// After:
const { entitySlug } = c.req.param();
const userId = c.get("firebaseUid");
const result = await getEntityWithPermission(entitySlug, userId);
if (result.error !== undefined) {
  return c.json({ ...errorResponse(result.error), errorCode: result.errorCode },
    getPermissionErrorStatus(result.errorCode));
}
const results = await db.select().from(vendorLocations)
  .where(eq(vendorLocations.entityId, result.entity.id));
```

For write operations, use `getEntityWithPermission(entitySlug, userId, true)` to require edit permissions.

### 1.11 Zod schemas

**File**: `src/schemas/index.ts`

- Add `entitySlugParamSchema = z.object({ entitySlug: z.string().min(1) })`
- Add `entityCreateSchema = z.object({ displayName: z.string().optional(), acceptTos: z.literal(true) })`
- Add member/invitation request schemas

---

## Phase 2: Types — tapayoka_types

**File**: `~/projects/tapayoka_types/src/index.ts`

- Remove `firebaseUserId` from `VendorLocation` and `VendorEquipmentCategory` types
- Add `entityId: string` to both types
- Add `TosStatus` type: `{ tosAcceptedAt: string | null }`
- Add `UserProfile` type: `{ id, firebaseUid, email, displayName, role, tosAcceptedAt }`

---

## Phase 3: Client library — tapayoka_client

### 3.1 Add entity_client peer dependency

```bash
cd ~/projects/tapayoka_client && bun add --peer @sudobility/entity_client
```

### 3.2 Update TapayokaClient

**File**: `src/network/TapayokaClient.ts`

All vendor methods gain `entitySlug` as first parameter. URL paths change from `vendor/...` to `entities/${entitySlug}/...`:

```typescript
// Before:
async getVendorLocations(token: FirebaseIdToken): Promise<BaseResponse<VendorLocation[]>> {
  return this.get(buildUrl(this.baseUrl, 'vendor/locations'), token);
}

// After:
async getVendorLocations(entitySlug: string, token: FirebaseIdToken): Promise<BaseResponse<VendorLocation[]>> {
  return this.get(buildUrl(this.baseUrl, `entities/${encodeURIComponent(entitySlug)}/locations`), token);
}
```

Apply same transformation to all vendor methods (~30 methods).

Add new methods:
- `getMe(token)` — `GET /me`
- `acceptTosAndCreateEntity(data, token)` — `POST /entities`

### 3.3 Update hooks

**Files**: `src/hooks/useVendorLocations.ts`, `useVendorEquipmentCategories.ts`, `useVendorServices.ts`, etc.

All hooks gain `entitySlug: string | null` parameter:
- Pass to client methods
- Include in query keys: `QUERY_KEYS.vendorLocations(entitySlug)`
- `enabled: !!entitySlug && !!token`

Add new hooks:
- `useMe(networkClient, baseUrl, token)` — fetch user profile
- `useAcceptTos(networkClient, baseUrl)` — TOS acceptance mutation

### 3.4 Update query keys

**File**: `src/types.ts`

```typescript
export const QUERY_KEYS = {
  vendorLocations: (entitySlug: string) => ['tapayoka', 'vendorLocations', entitySlug] as const,
  vendorEquipmentCategories: (entitySlug: string) => ['tapayoka', 'vendorEquipmentCategories', entitySlug] as const,
  // ... same pattern for all
  me: () => ['tapayoka', 'me'] as const,
} as const;
```

---

## Phase 4: Business logic — tapayoka_lib

### 4.1 Update Zustand stores

**Files**: `src/business/stores/useVendorLocationsStore.ts`, etc.

- Add `entitySlug: string | null` to store state
- `setLocations(locations, entitySlug)` — updates store with entity context
- `reset()` — clears entity-scoped data on entity switch

### 4.2 Update manager hooks

**Files**: `src/business/hooks/useVendorLocationsManager.ts`, etc.

- Add `entitySlug` parameter
- Pass to underlying client hooks
- Sync entity slug to stores
- Reset store on entity slug change

---

## Phase 5: New library — entity_pages_rn

**Create**: `~/projects/entity_pages_rn`

### 5.1 Project setup

```bash
mkdir -p ~/projects/entity_pages_rn/src/pages
```

**package.json**: `@sudobility/entity_pages_rn`
- Peer deps: `react`, `react-native`, `@tanstack/react-query`, `@sudobility/entity_client`, `@sudobility/types`
- Build: TypeScript → ESM via `tsc`

### 5.2 Pages (matching entity_pages functionality)

**Create**: `src/pages/EntityListPage.tsx`
- List organizations the user belongs to
- "Create Organization" button → inline form (TextInput for name)
- Entity selection callback (`onSelectEntity`)
- Navigate to settings callback (`onNavigateToSettings`)
- Uses `useEntities`, `useCreateEntity` from entity_client

**Create**: `src/pages/MembersManagementPage.tsx`
- FlatList of members with role badges
- Owner can change roles (ActionSheet/Picker)
- Owner can remove members (Alert confirmation)
- "Invite" button → InvitationForm
- Uses `useEntityMembers`, `useUpdateMemberRole`, `useRemoveMember`

**Create**: `src/pages/InvitationsPage.tsx`
- FlatList of pending invitations
- Cancel/renew actions per invitation
- Accept/decline for user's own invitations
- Uses `useEntityInvitations`, `useMyInvitations`

**Create**: `src/pages/TosScreen.tsx`
- ScrollView with TOS text
- "Cancel" button → signs out
- "Continue" button → calls acceptTos mutation, then navigates forward
- Receives `onAccept` and `onCancel` callbacks

### 5.3 Exports

**Create**: `src/index.ts`
```typescript
export { EntityListPage } from './pages/EntityListPage';
export { MembersManagementPage } from './pages/MembersManagementPage';
export { InvitationsPage } from './pages/InvitationsPage';
export { TosScreen } from './pages/TosScreen';
```

---

## Phase 6: React Native app — tapayoka_vendor_app_rn

### 6.1 Add dependencies

```bash
cd ~/projects/tapayoka_vendor_app_rn
bun add @sudobility/entity_client @sudobility/entity_pages_rn
```

### 6.2 Entity context

**Create**: `src/context/EntityContext.tsx`

- Wrap `CurrentEntityProvider` from entity_client
- Create `EntityClient` instance using the app's `networkClient` + `baseUrl` from ApiContext
- Pass `user` from AuthContext
- Adapt localStorage persistence to AsyncStorage (the polyfill in `src/polyfills/localStorage.ts` already provides this)

### 6.3 Update App.tsx provider tree

**File**: `App.tsx`

```tsx
<AuthProvider>
  <ApiProvider>
    <QueryClientProvider client={queryClient}>
      <EntityProvider>   {/* NEW */}
        <AppContent />
      </EntityProvider>
    </QueryClientProvider>
  </ApiProvider>
</AuthProvider>
```

### 6.4 Update AppContent navigation gating

**File**: `App.tsx` — `AppContent` component

```tsx
function AppContent() {
  const { isReady, user } = useAuth();
  const { currentEntity, isLoading, isInitialized } = useCurrentEntity();
  const { data: profile } = useMe(...);

  if (!isReady) return <SplashScreen />;
  if (!user) return <LoginScreen />;

  // Loading entity data
  if (isLoading || !isInitialized) return <SplashScreen />;

  // No TOS accepted yet → show TOS screen
  if (!profile?.tosAcceptedAt) return <TosScreen onAccept={handleAcceptTos} onCancel={signOut} />;

  // No entities → shouldn't happen after TOS acceptance, but handle gracefully
  if (!currentEntity) return <SplashScreen />;

  return <AppNavigator />;
}
```

### 6.5 Settings tab — organization management

**File**: `src/screens/settings/SettingsScreen.tsx`

Add "Organization" section with navigation items:
- "Organizations" → EntityListPage
- "Members" → MembersManagementPage
- "Invitations" → InvitationsPage

**File**: `src/navigation/AppNavigator.tsx`

Convert SettingsTab to a stack navigator (like LocationsTab):
```
SettingsStack
├── Settings (main settings screen)
├── OrganizationList (EntityListPage)
├── OrganizationMembers (MembersManagementPage)
└── OrganizationInvitations (InvitationsPage)
```

### 6.6 Update all screens to use entity context

All screens that fetch vendor data must pass `entitySlug` to their hooks:

```typescript
// Before:
const { locations } = useVendorLocationsManager(networkClient, baseUrl, null, token);

// After:
const { currentEntitySlug } = useCurrentEntity();
const { locations } = useVendorLocationsManager(networkClient, baseUrl, currentEntitySlug, token);
```

**Files to update**:
- `src/screens/locations/LocationsListScreen.tsx`
- `src/screens/categories/CategoriesListScreen.tsx`
- `src/screens/services/LocationServicesScreen.tsx`
- `src/screens/services/CategoryServicesScreen.tsx`
- `src/screens/services/ServiceDetailScreen.tsx`
- `src/screens/orders/OrdersScreen.tsx`

---

## Phase 7: Web vendor app — tapayoka_vendor_app

### 7.1 Add dependencies

```bash
cd ~/projects/tapayoka_vendor_app
bun add @sudobility/entity_client @sudobility/entity_pages
```

### 7.2 Wire up providers

**File**: `src/main.tsx`

- Add `CurrentEntityProvider` wrapping the app
- Create `EntityClient` instance with app's `networkClient`

### 7.3 Add TOS screen

**Create**: `src/pages/TosPage.tsx`

- Shows TOS text
- Cancel → sign out
- Continue → create entity + navigate to dashboard

### 7.4 Restructure routes

**File**: `src/App.tsx`

```tsx
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/tos" element={<TosPage />} />
  <Route path="/dashboard" element={<EntityRedirect />} />
  <Route path="/dashboard/:entitySlug" element={<DashboardLayout />}>
    <Route index element={<DashboardPage />} />
    <Route path="devices" element={<DevicesPage />} />
    <Route path="services" element={<ServicesPage />} />
    <Route path="orders" element={<OrdersPage />} />
    <Route path="workspaces" element={<WorkspacesPage />} />
    <Route path="members" element={<MembersPage />} />
    <Route path="invitations" element={<InvitationsPage />} />
    <Route path="settings" element={<SettingsPage />} />
  </Route>
</Routes>
```

### 7.5 EntityRedirect component

**Create**: `src/components/EntityRedirect.tsx`

- Uses `useCurrentEntity()` to get current entity
- Redirects to `/dashboard/:entitySlug`
- Shows loading while entities are being fetched

### 7.6 Organization management pages

**Create**: `src/pages/dashboard/WorkspacesPage.tsx` — wraps `EntityListPage` from entity_pages
**Create**: `src/pages/dashboard/MembersPage.tsx` — wraps `MembersManagementPage`
**Create**: `src/pages/dashboard/InvitationsPage.tsx` — wraps `InvitationsPage`

### 7.7 Update DashboardLayout

**File**: `src/components/layout/DashboardLayout.tsx`

- Read `entitySlug` from URL params
- Add entity switcher (dropdown or sidebar section)
- Pass entity context to child routes

### 7.8 Update data-fetching pages

All dashboard pages pass `entitySlug` from URL params to their hooks.

---

## Implementation Order

1. **tapayoka_types** — update types (remove firebaseUserId, add entityId)
2. **tapayoka_api** — schema + entity_service integration + route restructuring
3. **tapayoka_client** — update client methods + hooks with entitySlug
4. **tapayoka_lib** — update stores + managers with entitySlug
5. **entity_pages_rn** — create new library
6. **tapayoka_vendor_app_rn** — integrate entity context + TOS + org management
7. **tapayoka_vendor_app** — integrate entity context + TOS + org management

Steps 5-7 can be parallelized after steps 1-4 are done. Steps 6 and 7 are independent of each other.

---

## Verification

### Backend
```bash
cd ~/projects/tapayoka_api
bun run typecheck
bun test
# Manual: create user → POST /entities → verify entity + member created
# Manual: GET /entities/:slug/locations → verify entity-scoped data
```

### Client library
```bash
cd ~/projects/tapayoka_client
bun run typecheck
bun test
```

### RN App
```bash
cd ~/projects/tapayoka_vendor_app_rn
bun run typecheck
bun run ios  # or bun run android
# Manual flow: login → see TOS → tap Continue → verify org created → tab bar → verify data loads
# Manual: Settings → Organizations → verify list/create/members/invitations
```

### Web App
```bash
cd ~/projects/tapayoka_vendor_app
bun run typecheck
bun run dev
# Manual flow: login → TOS → dashboard → verify entity-scoped routes
```

---

## Key Files Reference

| Purpose | File |
|---------|------|
| Entity helpers pattern | `~/projects/shapeshyft_api/src/lib/entity-helpers.ts` |
| Entity route pattern | `~/projects/shapeshyft_api/src/routes/entities.ts` |
| CurrentEntityProvider | `~/projects/entity_client/src/hooks/useCurrentEntity.tsx` |
| Entity pages (web) | `~/projects/entity_pages/src/pages/` |
| Current DB schema | `~/projects/tapayoka_api/src/db/schema.ts` |
| Current route index | `~/projects/tapayoka_api/src/routes/index.ts` |
| Current RN App entry | `~/projects/tapayoka_vendor_app_rn/App.tsx` |
| Current RN navigator | `~/projects/tapayoka_vendor_app_rn/src/navigation/AppNavigator.tsx` |
| Current web App entry | `~/projects/tapayoka_vendor_app/src/App.tsx` |
| TapayokaClient | `~/projects/tapayoka_client/src/network/TapayokaClient.ts` |
