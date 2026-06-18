# Dashboard Drill-Down Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let vendors drill from a Model or Location into its Offerings → Installations → Slots via nested URL routes with breadcrumbs, matching `tapayoka_vendor_app_rn`.

**Architecture:** Add nested React Router v6 routes under the existing `/dashboard/:entitySlug` shell. Two new **shared** page components (`OfferingDetailPage`, `InstallationDetailPage`) serve both the `/models/...` and `/locations/...` subtrees, inferring the parent (`model` vs `location`) from the URL via a pure helper. Existing detail pages get row-click drill-in + breadcrumbs. Data comes from existing `@sudobility/tapayoka_lib` manager hooks; UI reuses `@sudobility/components`.

**Tech Stack:** React 18, TypeScript, Vite, React Router v6, `@sudobility/components`, `@sudobility/tapayoka_lib`, `@sudobility/tapayoka_types`, Vitest.

## Global Constraints

- Brand/styling unchanged — reuse `@sudobility/components` (`Table`, `Button`, `Badge`, `Modal`, `Spinner`, `Alert`, `FormField`, `Breadcrumb`) and `@sudobility/design` `ui.*` tokens, exactly as the existing dashboard pages do.
- No new backend endpoints — use only existing manager hooks.
- Installation **creation** (QR / device pairing) and the multi-2D slot **grid generator** (`bulkCreateSlots`) are DEFERRED — surface them as clearly-labeled disabled affordances, never silent omissions.
- Installation route param is `:wallet` = the installation's `walletAddress`.
- Every gate must pass before a task is considered done: `bun run typecheck`, `bun run lint`, `bun run test`. Run `bun run build` in the final task.
- Commit after every task with a `feat:`/`test:`/`refactor:` message.

---

### Task 1: Pure routing helpers (`dashboardPaths.ts`)

**Files:**
- Create: `src/lib/dashboardPaths.ts`
- Test: `src/lib/__tests__/dashboardPaths.test.ts`

**Interfaces:**
- Produces:
  - `type OfferingParent = { parentType: 'model' | 'location'; parentId: string }`
  - `resolveOfferingParent(params: { modelId?: string; locationId?: string }): OfferingParent`
  - `sectionPath(entitySlug: string, parentType: 'model' | 'location'): string`
  - `parentDetailPath(entitySlug: string, parent: OfferingParent): string`
  - `offeringPath(entitySlug: string, parent: OfferingParent, offeringId: string): string`
  - `installationPath(entitySlug: string, parent: OfferingParent, offeringId: string, wallet: string): string`

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/__tests__/dashboardPaths.test.ts
import { describe, it, expect } from 'vitest';
import {
  resolveOfferingParent,
  sectionPath,
  parentDetailPath,
  offeringPath,
  installationPath,
} from '../dashboardPaths';

describe('dashboardPaths', () => {
  it('resolves a model parent from route params', () => {
    expect(resolveOfferingParent({ modelId: 'm1' })).toEqual({ parentType: 'model', parentId: 'm1' });
  });

  it('resolves a location parent from route params', () => {
    expect(resolveOfferingParent({ locationId: 'l1' })).toEqual({ parentType: 'location', parentId: 'l1' });
  });

  it('throws when no parent param is present', () => {
    expect(() => resolveOfferingParent({})).toThrow();
  });

  it('builds model subtree paths', () => {
    const parent = { parentType: 'model', parentId: 'm1' } as const;
    expect(sectionPath('e1', 'model')).toBe('/dashboard/e1/models');
    expect(parentDetailPath('e1', parent)).toBe('/dashboard/e1/models/m1');
    expect(offeringPath('e1', parent, 'o1')).toBe('/dashboard/e1/models/m1/offerings/o1');
    expect(installationPath('e1', parent, 'o1', '0xAbc')).toBe(
      '/dashboard/e1/models/m1/offerings/o1/installs/0xAbc'
    );
  });

  it('builds location subtree paths', () => {
    const parent = { parentType: 'location', parentId: 'l1' } as const;
    expect(sectionPath('e1', 'location')).toBe('/dashboard/e1/locations');
    expect(offeringPath('e1', parent, 'o1')).toBe('/dashboard/e1/locations/l1/offerings/o1');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bunx vitest run src/lib/__tests__/dashboardPaths.test.ts`
Expected: FAIL — cannot resolve module `../dashboardPaths`.

- [ ] **Step 3: Write the implementation**

```typescript
// src/lib/dashboardPaths.ts
export type OfferingParent = { parentType: 'model' | 'location'; parentId: string };

export function resolveOfferingParent(params: {
  modelId?: string;
  locationId?: string;
}): OfferingParent {
  if (params.modelId) return { parentType: 'model', parentId: params.modelId };
  if (params.locationId) return { parentType: 'location', parentId: params.locationId };
  throw new Error('resolveOfferingParent: no modelId or locationId in route params');
}

const segment = (parentType: 'model' | 'location') =>
  parentType === 'model' ? 'models' : 'locations';

export function sectionPath(entitySlug: string, parentType: 'model' | 'location'): string {
  return `/dashboard/${entitySlug}/${segment(parentType)}`;
}

export function parentDetailPath(entitySlug: string, parent: OfferingParent): string {
  return `${sectionPath(entitySlug, parent.parentType)}/${parent.parentId}`;
}

export function offeringPath(
  entitySlug: string,
  parent: OfferingParent,
  offeringId: string
): string {
  return `${parentDetailPath(entitySlug, parent)}/offerings/${offeringId}`;
}

export function installationPath(
  entitySlug: string,
  parent: OfferingParent,
  offeringId: string,
  wallet: string
): string {
  return `${offeringPath(entitySlug, parent, offeringId)}/installs/${wallet}`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bunx vitest run src/lib/__tests__/dashboardPaths.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/dashboardPaths.ts src/lib/__tests__/dashboardPaths.test.ts
git commit -m "feat: add dashboard drill-down path helpers"
```

---

### Task 2: `DashboardBreadcrumb` component

**Files:**
- Create: `src/components/DashboardBreadcrumb.tsx`

**Interfaces:**
- Consumes: `@sudobility/components` `Breadcrumb`.
- Produces:
  - `interface Crumb { label: string; to?: string }`
  - `function DashboardBreadcrumb({ crumbs }: { crumbs: Crumb[] }): JSX.Element` — renders the library `Breadcrumb`; the last crumb is `isCurrent`; crumbs with `to` navigate via the SPA router (no full reload).

- [ ] **Step 1: Write the component**

```tsx
// src/components/DashboardBreadcrumb.tsx
import { useNavigate } from 'react-router-dom';
import { Breadcrumb } from '@sudobility/components';

export interface Crumb {
  label: string;
  /** Target path; omit for the current (last) crumb. */
  to?: string;
}

export function DashboardBreadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  const navigate = useNavigate();
  return (
    <Breadcrumb
      items={crumbs.map((c, i) => ({
        label: c.label,
        isCurrent: i === crumbs.length - 1,
        onClick: c.to ? () => navigate(c.to as string) : undefined,
      }))}
    />
  );
}

export default DashboardBreadcrumb;
```

- [ ] **Step 2: Verify it typechecks and lints**

Run: `bun run typecheck && bun run lint`
Expected: PASS (no errors).

- [ ] **Step 3: Commit**

```bash
git add src/components/DashboardBreadcrumb.tsx
git commit -m "feat: add DashboardBreadcrumb wrapper around library Breadcrumb"
```

---

### Task 3: `InstallationFormModal` (edit label)

**Files:**
- Create: `src/components/InstallationFormModal.tsx`

**Interfaces:**
- Consumes: `@sudobility/components` `Modal`, `ModalHeader`, `ModalContent`, `ModalFooter`, `Button`, `FormField`; type `VendorInstallation`, `VendorInstallationUpdateRequest` from `@sudobility/tapayoka_types`.
- Produces:
  - `interface InstallationFormModalProps { open: boolean; installation: VendorInstallation | null; onClose: () => void; onSave: (data: VendorInstallationUpdateRequest) => void | Promise<void>; }`
  - `function InstallationFormModal(props): JSX.Element`

**Notes:** Edit-only (label). Installation creation is deferred (see Global Constraints).

- [ ] **Step 1: Write the component**

```tsx
// src/components/InstallationFormModal.tsx
import { useState, useEffect } from 'react';
import {
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter,
  Button,
  FormField,
} from '@sudobility/components';
import type {
  VendorInstallation,
  VendorInstallationUpdateRequest,
} from '@sudobility/tapayoka_types';

interface InstallationFormModalProps {
  open: boolean;
  installation: VendorInstallation | null;
  onClose: () => void;
  onSave: (data: VendorInstallationUpdateRequest) => void | Promise<void>;
}

export function InstallationFormModal({
  open,
  installation,
  onClose,
  onSave,
}: InstallationFormModalProps) {
  const [label, setLabel] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLabel(installation?.label ?? '');
  }, [installation?.walletAddress, open]);

  const handleSave = async () => {
    if (!label.trim()) return;
    setSaving(true);
    try {
      await onSave({ label: label.trim() });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose} size="small">
      <ModalHeader title="Edit installation" />
      <ModalContent>
        <FormField
          label="Label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Installation label"
        />
      </ModalContent>
      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave} loading={saving} disabled={!label.trim()}>
          Save
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default InstallationFormModal;
```

- [ ] **Step 2: Verify `FormField`'s prop shape, then typecheck/lint**

Read `node_modules/@sudobility/components/dist/forms/inputs/form-field.d.ts` to confirm `FormField` accepts `label`, `value`, `onChange`, `placeholder`. If its change handler differs (e.g. `onChangeText` or `onValueChange`), adjust the `onChange`/`value` props to match the real signature.

Run: `bun run typecheck && bun run lint`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/InstallationFormModal.tsx
git commit -m "feat: add InstallationFormModal for editing installation label"
```

---

### Task 4: `SlotFormModal` (add / edit single slot)

**Files:**
- Create: `src/components/SlotFormModal.tsx`

**Interfaces:**
- Consumes: same modal/form components as Task 3; types `VendorInstallationSlot`, `VendorInstallationSlotCreateRequest`, `VendorInstallationSlotUpdateRequest`.
- Produces:
  - `interface SlotFormModalProps { open: boolean; slot: VendorInstallationSlot | null; onClose: () => void; onSave: (data: VendorInstallationSlotCreateRequest) => void | Promise<void>; }`
  - `function SlotFormModal(props): JSX.Element`

**Notes:** Single-slot label only. Pricing-tier assignment and 2D row/column are deferred.

- [ ] **Step 1: Write the component**

```tsx
// src/components/SlotFormModal.tsx
import { useState, useEffect } from 'react';
import {
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter,
  Button,
  FormField,
} from '@sudobility/components';
import type {
  VendorInstallationSlot,
  VendorInstallationSlotCreateRequest,
} from '@sudobility/tapayoka_types';

interface SlotFormModalProps {
  open: boolean;
  slot: VendorInstallationSlot | null;
  onClose: () => void;
  onSave: (data: VendorInstallationSlotCreateRequest) => void | Promise<void>;
}

export function SlotFormModal({ open, slot, onClose, onSave }: SlotFormModalProps) {
  const [label, setLabel] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLabel(slot?.label ?? '');
  }, [slot?.id, open]);

  const handleSave = async () => {
    if (!label.trim()) return;
    setSaving(true);
    try {
      await onSave({ label: label.trim() });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose} size="small">
      <ModalHeader title={slot ? 'Edit slot' : 'Add slot'} />
      <ModalContent>
        <FormField
          label="Label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Slot label"
        />
      </ModalContent>
      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave} loading={saving} disabled={!label.trim()}>
          Save
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default SlotFormModal;
```

- [ ] **Step 2: Typecheck/lint** (adjust `FormField` props if Task 3 required changes)

Run: `bun run typecheck && bun run lint`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/SlotFormModal.tsx
git commit -m "feat: add SlotFormModal for single-slot add/edit"
```

---

### Task 5: `OfferingDetailPage` (shared — installations list)

**Files:**
- Create: `src/pages/dashboard/OfferingDetailPage.tsx`

**Interfaces:**
- Consumes: `resolveOfferingParent`, `offeringPath`, `installationPath`, `sectionPath`, `parentDetailPath` (Task 1); `DashboardBreadcrumb`, `Crumb` (Task 2); `InstallationFormModal` (Task 3); manager hooks `useVendorOfferingsManager`, `useVendorModelsManager`, `useVendorLocationsManager`, `useVendorInstallationsManager`.
- Produces: default-exported `OfferingDetailPage` React component (used by routes in Task 7).

- [ ] **Step 1: Write the page**

```tsx
// src/pages/dashboard/OfferingDetailPage.tsx
import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EmptyState } from '@sudobility/building_blocks';
import { useApi } from '@sudobility/building_blocks/firebase';
import { useCurrentEntity } from '@sudobility/entity_client';
import { ui } from '@sudobility/design';
import { Badge, Button, Spinner, Table, Alert, type TableColumn } from '@sudobility/components';
import {
  useVendorOfferingsManager,
  useVendorModelsManager,
  useVendorLocationsManager,
  useVendorInstallationsManager,
} from '@sudobility/tapayoka_lib';
import { DashboardBreadcrumb, type Crumb } from '../../components/DashboardBreadcrumb';
import { InstallationFormModal } from '../../components/InstallationFormModal';
import { analyticsService } from '../../config/analytics';
import {
  resolveOfferingParent,
  sectionPath,
  parentDetailPath,
  installationPath,
} from '../../lib/dashboardPaths';
import type { VendorInstallation, VendorInstallationUpdateRequest } from '@sudobility/tapayoka_types';

export function OfferingDetailPage() {
  const params = useParams<{
    entitySlug: string;
    modelId?: string;
    locationId?: string;
    offeringId: string;
  }>();
  const navigate = useNavigate();
  const entitySlug = params.entitySlug as string;
  const offeringId = params.offeringId as string;
  const parent = resolveOfferingParent(params);

  const { networkClient, baseUrl, token } = useApi();
  const { currentEntitySlug } = useCurrentEntity();

  const offeringsManager = useVendorOfferingsManager(
    networkClient,
    baseUrl,
    currentEntitySlug,
    token,
    parent.parentId,
    parent.parentType
  );
  const modelsManager = useVendorModelsManager(networkClient, baseUrl, currentEntitySlug, token);
  const locationsManager = useVendorLocationsManager(
    networkClient,
    baseUrl,
    currentEntitySlug,
    token
  );
  const installationsManager = useVendorInstallationsManager(
    networkClient,
    baseUrl,
    currentEntitySlug,
    token,
    offeringId
  );

  const offering = offeringsManager.offerings.find((o) => o.id === offeringId) ?? null;
  const parentName =
    parent.parentType === 'model'
      ? modelsManager.models.find((m) => m.id === parent.parentId)?.name
      : locationsManager.locations.find((l) => l.id === parent.parentId)?.name;

  useEffect(() => {
    analyticsService.trackPageView(`/dashboard/offerings/${offeringId}`, 'Offering Detail');
  }, [offeringId]);

  const [editing, setEditing] = useState<VendorInstallation | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleEdit = useCallback((inst: VendorInstallation) => {
    setEditing(inst);
    setModalOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (inst: VendorInstallation) => {
      if (!window.confirm(`Delete installation "${inst.label}"?`)) return;
      const ok = await installationsManager.deleteInstallation(inst.walletAddress);
      if (!ok && installationsManager.error) alert(installationsManager.error);
    },
    [installationsManager]
  );

  const handleSave = useCallback(
    async (data: VendorInstallationUpdateRequest) => {
      if (!editing) return;
      const result = await installationsManager.updateInstallation(editing.walletAddress, data);
      if (!result && installationsManager.error) {
        alert(installationsManager.error);
        return;
      }
      setModalOpen(false);
    },
    [editing, installationsManager]
  );

  const crumbs: Crumb[] = [
    { label: parent.parentType === 'model' ? 'Models' : 'Locations', to: sectionPath(entitySlug, parent.parentType) },
    { label: parentName ?? '…', to: parentDetailPath(entitySlug, parent) },
    { label: offering?.name ?? 'Offering' },
  ];

  const columns: TableColumn<VendorInstallation>[] = [
    {
      key: 'label',
      label: 'Installation',
      render: (inst) => <span className="text-gray-900">{inst.label}</span>,
    },
    {
      key: 'slots',
      label: 'Slots',
      render: (inst) =>
        inst.slotCount != null ? (
          <Badge variant="primary" pill>
            {inst.slotCount}
          </Badge>
        ) : null,
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (inst) => (
        <>
          <button
            className={`text-sm mr-3 ${ui.text.linkSubtle}`}
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(inst);
            }}
          >
            Edit
          </button>
          <button
            className={`text-sm ${ui.text.error} hover:opacity-80`}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(inst);
            }}
          >
            Delete
          </button>
        </>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <DashboardBreadcrumb crumbs={crumbs} />
      <h1 className={ui.text.h3}>{offering?.name ?? 'Offering'}</h1>

      {installationsManager.error && (
        <Alert variant="error">{installationsManager.error}</Alert>
      )}

      {/* Installation creation is via device pairing (QR), available in the mobile app — deferred here. */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h2 className={ui.text.h5}>Installations</h2>
          <Button variant="primary" size="sm" disabled title="Pair a device in the mobile app">
            Add (mobile app)
          </Button>
        </div>

        {installationsManager.isLoading ? (
          <div className="p-8 flex justify-center">
            <Spinner ariaLabel="Loading installations" />
          </div>
        ) : installationsManager.installations.length === 0 ? (
          <EmptyState message="No installations yet. Pair a device in the mobile app to add one." />
        ) : (
          <Table
            columns={columns}
            data={installationsManager.installations}
            keyExtractor={(inst) => inst.walletAddress}
            onRowClick={(inst) =>
              navigate(installationPath(entitySlug, parent, offeringId, inst.walletAddress))
            }
            hoverable
          />
        )}
      </div>

      <InstallationFormModal
        open={modalOpen}
        installation={editing}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}

export default OfferingDetailPage;
```

- [ ] **Step 2: Verify the `Spinner`/`Alert`/`EmptyState` prop names against current usage**

`ModelDetailPage.tsx` uses `<Spinner ariaLabel="..." />` and `<EmptyState message=... />`; `OrdersPage.tsx`/`LocationsPage.tsx` use `<Alert variant="error">`. Confirm these match; if `Alert` uses a different prop in this codebase, copy the form already used in `OrdersPage.tsx`.

Run: `bun run typecheck && bun run lint`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/pages/dashboard/OfferingDetailPage.tsx
git commit -m "feat: add shared OfferingDetailPage (installations list)"
```

---

### Task 6: `InstallationDetailPage` (shared — slots list)

**Files:**
- Create: `src/pages/dashboard/InstallationDetailPage.tsx`

**Interfaces:**
- Consumes: Task 1 helpers; `DashboardBreadcrumb`/`Crumb`; `SlotFormModal` (Task 4); hooks `useVendorOfferingsManager`, `useVendorModelsManager`, `useVendorLocationsManager`, `useVendorInstallationsManager`, `useVendorInstallationSlotsManager`.
- Produces: default-exported `InstallationDetailPage`.

- [ ] **Step 1: Write the page**

```tsx
// src/pages/dashboard/InstallationDetailPage.tsx
import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { EmptyState } from '@sudobility/building_blocks';
import { useApi } from '@sudobility/building_blocks/firebase';
import { useCurrentEntity } from '@sudobility/entity_client';
import { ui } from '@sudobility/design';
import { Button, Spinner, Alert, Table, type TableColumn } from '@sudobility/components';
import {
  useVendorOfferingsManager,
  useVendorModelsManager,
  useVendorLocationsManager,
  useVendorInstallationsManager,
  useVendorInstallationSlotsManager,
} from '@sudobility/tapayoka_lib';
import { DashboardBreadcrumb, type Crumb } from '../../components/DashboardBreadcrumb';
import { SlotFormModal } from '../../components/SlotFormModal';
import { analyticsService } from '../../config/analytics';
import {
  resolveOfferingParent,
  sectionPath,
  parentDetailPath,
  offeringPath,
} from '../../lib/dashboardPaths';
import type {
  VendorInstallationSlot,
  VendorInstallationSlotCreateRequest,
} from '@sudobility/tapayoka_types';

export function InstallationDetailPage() {
  const params = useParams<{
    entitySlug: string;
    modelId?: string;
    locationId?: string;
    offeringId: string;
    wallet: string;
  }>();
  const entitySlug = params.entitySlug as string;
  const offeringId = params.offeringId as string;
  const wallet = params.wallet as string;
  const parent = resolveOfferingParent(params);

  const { networkClient, baseUrl, token } = useApi();
  const { currentEntitySlug } = useCurrentEntity();

  const offeringsManager = useVendorOfferingsManager(
    networkClient,
    baseUrl,
    currentEntitySlug,
    token,
    parent.parentId,
    parent.parentType
  );
  const modelsManager = useVendorModelsManager(networkClient, baseUrl, currentEntitySlug, token);
  const locationsManager = useVendorLocationsManager(
    networkClient,
    baseUrl,
    currentEntitySlug,
    token
  );
  const installationsManager = useVendorInstallationsManager(
    networkClient,
    baseUrl,
    currentEntitySlug,
    token,
    offeringId
  );
  const slotsManager = useVendorInstallationSlotsManager(
    networkClient,
    baseUrl,
    currentEntitySlug,
    token,
    wallet
  );

  const offering = offeringsManager.offerings.find((o) => o.id === offeringId) ?? null;
  const installation = installationsManager.installations.find((i) => i.walletAddress === wallet) ?? null;
  const model = offering ? modelsManager.models.find((m) => m.id === offering.vendorModelId) ?? null : null;
  const parentName =
    parent.parentType === 'model'
      ? model?.name ?? modelsManager.models.find((m) => m.id === parent.parentId)?.name
      : locationsManager.locations.find((l) => l.id === parent.parentId)?.name;
  const isGrid = model?.slot === 'multi2D';

  useEffect(() => {
    analyticsService.trackPageView(`/dashboard/installations/${wallet}`, 'Installation Detail');
  }, [wallet]);

  const [editing, setEditing] = useState<VendorInstallationSlot | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleAdd = useCallback(() => {
    setEditing(null);
    setModalOpen(true);
  }, []);

  const handleEdit = useCallback((slot: VendorInstallationSlot) => {
    setEditing(slot);
    setModalOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (slot: VendorInstallationSlot) => {
      if (!window.confirm(`Delete slot "${slot.label}"?`)) return;
      const ok = await slotsManager.deleteSlot(slot.id);
      if (!ok && slotsManager.error) alert(slotsManager.error);
    },
    [slotsManager]
  );

  const handleSave = useCallback(
    async (data: VendorInstallationSlotCreateRequest) => {
      if (editing) {
        const result = await slotsManager.updateSlot(editing.id, data);
        if (!result && slotsManager.error) {
          alert(slotsManager.error);
          return;
        }
      } else {
        const result = await slotsManager.addSlot(data);
        if (!result && slotsManager.error) {
          alert(slotsManager.error);
          return;
        }
      }
      setModalOpen(false);
    },
    [editing, slotsManager]
  );

  const crumbs: Crumb[] = [
    { label: parent.parentType === 'model' ? 'Models' : 'Locations', to: sectionPath(entitySlug, parent.parentType) },
    { label: parentName ?? '…', to: parentDetailPath(entitySlug, parent) },
    { label: offering?.name ?? 'Offering', to: offeringPath(entitySlug, parent, offeringId) },
    { label: installation?.label ?? 'Installation' },
  ];

  const columns: TableColumn<VendorInstallationSlot>[] = [
    {
      key: 'label',
      label: 'Slot',
      render: (slot) => <span className="text-gray-900">{slot.label}</span>,
    },
    {
      key: 'tier',
      label: 'Pricing Tier',
      render: (slot) => <span className="text-gray-500">{slot.pricingTier?.name ?? '—'}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (slot) => (
        <>
          <button
            className={`text-sm mr-3 ${ui.text.linkSubtle}`}
            onClick={() => handleEdit(slot)}
          >
            Edit
          </button>
          <button
            className={`text-sm ${ui.text.error} hover:opacity-80`}
            onClick={() => handleDelete(slot)}
          >
            Delete
          </button>
        </>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <DashboardBreadcrumb crumbs={crumbs} />
      <h1 className={ui.text.h3}>{installation?.label ?? 'Installation'}</h1>

      {slotsManager.error && <Alert variant="error">{slotsManager.error}</Alert>}

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h2 className={ui.text.h5}>Slots</h2>
          {isGrid ? (
            <Button variant="primary" size="sm" disabled title="Grid generation is available in the mobile app">
              Generate grid (mobile app)
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={handleAdd}>
              Add Slot
            </Button>
          )}
        </div>

        {slotsManager.isLoading ? (
          <div className="p-8 flex justify-center">
            <Spinner ariaLabel="Loading slots" />
          </div>
        ) : slotsManager.slots.length === 0 ? (
          <EmptyState message={isGrid ? 'No slots yet. Generate the grid in the mobile app.' : 'No slots yet.'} />
        ) : (
          <Table
            columns={columns}
            data={slotsManager.slots}
            keyExtractor={(slot) => slot.id}
            hoverable
          />
        )}
      </div>

      <SlotFormModal
        open={modalOpen}
        slot={editing}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}

export default InstallationDetailPage;
```

- [ ] **Step 2: Typecheck/lint**

Run: `bun run typecheck && bun run lint`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/pages/dashboard/InstallationDetailPage.tsx
git commit -m "feat: add shared InstallationDetailPage (slots list)"
```

---

### Task 7: Register the four nested routes

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `OfferingDetailPage` (Task 5), `InstallationDetailPage` (Task 6).

- [ ] **Step 1: Add the lazy imports**

In `src/App.tsx`, immediately after the existing line:
```tsx
const ModelDetailPage = lazy(() => import('./pages/dashboard/ModelDetailPage'));
```
add:
```tsx
const OfferingDetailPage = lazy(() => import('./pages/dashboard/OfferingDetailPage'));
const InstallationDetailPage = lazy(() => import('./pages/dashboard/InstallationDetailPage'));
```

- [ ] **Step 2: Add the nested routes**

In the `<Route path="/dashboard/:entitySlug" …>` block, replace these two existing lines:
```tsx
            <Route path="locations/:locationId" element={<LocationDetailPage />} />
```
```tsx
            <Route path="models/:modelId" element={<ModelDetailPage />} />
```
so that each is immediately followed by its drill-down routes:
```tsx
            <Route path="locations/:locationId" element={<LocationDetailPage />} />
            <Route
              path="locations/:locationId/offerings/:offeringId"
              element={<OfferingDetailPage />}
            />
            <Route
              path="locations/:locationId/offerings/:offeringId/installs/:wallet"
              element={<InstallationDetailPage />}
            />
```
```tsx
            <Route path="models/:modelId" element={<ModelDetailPage />} />
            <Route
              path="models/:modelId/offerings/:offeringId"
              element={<OfferingDetailPage />}
            />
            <Route
              path="models/:modelId/offerings/:offeringId/installs/:wallet"
              element={<InstallationDetailPage />}
            />
```

- [ ] **Step 3: Typecheck/lint/build**

Run: `bun run typecheck && bun run lint && bun run build`
Expected: PASS; build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: register offering/installation drill-down routes"
```

---

### Task 8: Drill-in + breadcrumb on `ModelDetailPage`

**Files:**
- Modify: `src/pages/dashboard/ModelDetailPage.tsx`

- [ ] **Step 1: Add imports**

Change the router import line:
```tsx
import { useParams, Link } from 'react-router-dom';
```
to:
```tsx
import { useParams, Link, useNavigate } from 'react-router-dom';
```
Add after the existing `OfferingModal` import:
```tsx
import { DashboardBreadcrumb, type Crumb } from '../../components/DashboardBreadcrumb';
import { offeringPath, sectionPath } from '../../lib/dashboardPaths';
```

- [ ] **Step 2: Add `useNavigate`**

Immediately after:
```tsx
  const { entitySlug, modelId } = useParams<{ entitySlug: string; modelId: string }>();
```
add:
```tsx
  const navigate = useNavigate();
```

- [ ] **Step 3: Make offering action buttons stop row-click propagation**

In `offeringColumns`, replace the two action handlers:
```tsx
            onClick={() => handleEditOffering(inst)}
```
```tsx
            onClick={() => handleDeleteOffering(inst)}
```
with:
```tsx
            onClick={(e) => {
              e.stopPropagation();
              handleEditOffering(inst);
            }}
```
```tsx
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteOffering(inst);
            }}
```

- [ ] **Step 4: Make the offerings table rows drill in**

Replace:
```tsx
          <Table
            columns={offeringColumns}
            data={offeringsManager.offerings}
            keyExtractor={(inst) => inst.id}
            hoverable
          />
```
with:
```tsx
          <Table
            columns={offeringColumns}
            data={offeringsManager.offerings}
            keyExtractor={(inst) => inst.id}
            onRowClick={(inst) =>
              navigate(offeringPath(entitySlug ?? '', { parentType: 'model', parentId: modelId ?? '' }, inst.id))
            }
            hoverable
          />
```

- [ ] **Step 5: Add a breadcrumb above the title**

Replace the header block:
```tsx
      <div className="flex items-center gap-3">
        <Link to={`/dashboard/${entitySlug}/models`} className="text-gray-400 hover:text-gray-600">
          &larr;
        </Link>
        <h1 className={`${ui.text.h3} flex-1`}>{model?.name ?? 'Loading...'}</h1>
      </div>
```
with:
```tsx
      <DashboardBreadcrumb
        crumbs={
          [
            { label: 'Models', to: sectionPath(entitySlug ?? '', 'model') },
            { label: model?.name ?? 'Loading...' },
          ] as Crumb[]
        }
      />
      <h1 className={`${ui.text.h3} flex-1`}>{model?.name ?? 'Loading...'}</h1>
```

- [ ] **Step 6: Typecheck/lint/build**

Run: `bun run typecheck && bun run lint && bun run build`
Expected: PASS. (`Link` is still used by the "Model not found" fallback, so its import stays.)

- [ ] **Step 7: Commit**

```bash
git add src/pages/dashboard/ModelDetailPage.tsx
git commit -m "feat: drill into offerings from ModelDetailPage + breadcrumb"
```

---

### Task 9: Drill-in + breadcrumb on `LocationDetailPage`

**Files:**
- Modify: `src/pages/dashboard/LocationDetailPage.tsx`

**Notes:** `LocationDetailPage` mirrors `ModelDetailPage`'s offerings table + `OfferingModal` structure. Apply the same four edits, using the `location` parent.

- [ ] **Step 1: Add imports** — same as Task 8 Step 1 (add `useNavigate`; add `DashboardBreadcrumb`/`Crumb` and `offeringPath`/`sectionPath` imports).

- [ ] **Step 2: Add `useNavigate`** after the `useParams<{ entitySlug: string; locationId: string }>()` line:
```tsx
  const navigate = useNavigate();
```

- [ ] **Step 3: Stop propagation on the offering Edit/Delete buttons** — same change as Task 8 Step 3 (wrap each handler with `(e) => { e.stopPropagation(); … }`).

- [ ] **Step 4: Add `onRowClick` to the offerings `Table`:**
```tsx
            onRowClick={(inst) =>
              navigate(offeringPath(entitySlug ?? '', { parentType: 'location', parentId: locationId ?? '' }, inst.id))
            }
```
(insert as a prop on the existing `<Table … />`, alongside `keyExtractor` and `hoverable`.)

- [ ] **Step 5: Add a breadcrumb above the title.** Replace the existing back-link header (the `<Link to={\`/dashboard/${entitySlug}/locations\`}…>&larr;</Link>` + `<h1>` block, around `LocationDetailPage.tsx:140`) with:
```tsx
      <DashboardBreadcrumb
        crumbs={
          [
            { label: 'Locations', to: sectionPath(entitySlug ?? '', 'location') },
            { label: location?.name ?? 'Loading...' },
          ] as Crumb[]
        }
      />
      <h1 className={`${ui.text.h3} flex-1`}>{location?.name ?? 'Loading...'}</h1>
```
(Read `LocationDetailPage.tsx` first to match the exact existing header markup before replacing.)

- [ ] **Step 6: Typecheck/lint/build**

Run: `bun run typecheck && bun run lint && bun run build`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/pages/dashboard/LocationDetailPage.tsx
git commit -m "feat: drill into offerings from LocationDetailPage + breadcrumb"
```

---

### Task 10: Full verification & acceptance pass

**Files:** none (verification only).

- [ ] **Step 1: Run all gates**

Run: `bun run typecheck && bun run lint && bun run test && bun run build`
Expected: typecheck clean, lint clean, all vitest tests pass (incl. `dashboardPaths.test.ts`), build succeeds.

- [ ] **Step 2: Manual acceptance checklist** (run `bun run dev`, log in, open a workspace)

Verify each acceptance criterion from the spec:
1. Models → click a model → click an offering row → lands on the offering's **installations** list; click an installation → lands on its **slots** list.
2. Locations → same drill path works (shared pages render under `/locations/...`).
3. Breadcrumb on each drill page shows the trail and each non-current segment navigates up (no full page reload); pasting a deep URL `…/models/:id/offerings/:id/installs/:wallet` lands on the right page.
4. Offering Edit/Delete buttons work without triggering row drill-in.
5. Loading shows a spinner; empty shows "No installations/slots yet"; deferred actions (Add installation, Generate grid) appear disabled with explanatory titles.

- [ ] **Step 3: Final commit (if any checklist fix was needed)**

```bash
git add -A
git commit -m "fix: address drill-down acceptance findings"
```

---

## Self-Review

**Spec coverage:** Routes (Task 7) ✓; shared OfferingDetailPage/InstallationDetailPage with parent inference (Tasks 5,6,1) ✓; breadcrumbs (Tasks 2,5,6,8,9) ✓; both Models & Locations (Tasks 8,9 + shared pages) ✓; settings stay inline (ModelDetailPage settings block untouched) ✓; deferred QR pairing + 2D grid surfaced as disabled affordances (Tasks 5,6) ✓; loading/error/empty states (Tasks 5,6) ✓; testing of `resolveOfferingParent` + path builders (Task 1) ✓; gates incl. build (Tasks 7–10) ✓.

**Placeholder scan:** No TBD/TODO. The two "verify prop shape" steps (Tasks 3,5) are concrete validation actions against named `.d.ts` files / existing usages, not deferred work.

**Type consistency:** `OfferingParent`, `Crumb`, manager method names (`updateInstallation(walletAddress, data)`, `deleteInstallation(walletAddress)`, `addSlot`/`updateSlot(id, data)`/`deleteSlot(id)`), and path-builder signatures are used identically across Tasks 1, 5, 6, 8, 9. Route param names (`entitySlug`, `modelId`/`locationId`, `offeringId`, `wallet`) match between Task 7 routes and the `useParams` calls in Tasks 5, 6.

**Known follow-up to confirm during Task 3/5:** the exact `FormField` change-handler prop and `Alert`/`Spinner`/`EmptyState` prop names — the plan instructs copying the form already used in `ModelDetailPage.tsx`/`OrdersPage.tsx` if they differ.
