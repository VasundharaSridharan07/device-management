import { isNavItemId, orderedSideNav, type NavItemId } from '../nav';

const STORAGE_KEY = 'devicemanagement.prototype';

export type PersonaId = 'licensed-admin' | 'product-user';

export type ManageProjectsVariantId = 'option-01' | 'option-02';

export type InventoryViewId = 'device-only' | 'device-and-asset';

export type PrototypeUser = {
  avatarAlt: string;
  email: string;
  name: string;
};

export type Persona = {
  id: PersonaId;
  /** Permission in the account, such as Licensed Admin. */
  role: string;
  /** Who this persona is in the field, such as Fleet / Equipment Manager. */
  label: string;
  description: string;
  user: PrototypeUser;
};

export type ManageProjectsVariant = {
  id: ManageProjectsVariantId;
  label: string;
  description: string;
};

export type InventoryView = {
  id: InventoryViewId;
  label: string;
  description: string;
};

export type ExperimentConfig = {
  persona: PersonaId;
  manageProjects: ManageProjectsVariantId;
  inventoryView: InventoryViewId;
  sideNav: NavItemId[];
};

export const PERSONAS: readonly Persona[] = [
  {
    id: 'licensed-admin',
    role: 'Licensed Admin',
    label: 'Fleet / Equipment Manager',
    description:
      'Administers the account. Can create groups, register devices, and assign devices to projects.',
    user: {
      avatarAlt: 'Alex Rivera',
      email: 'alex.rivera@trimble.com',
      name: 'Alex Rivera',
    },
  },
  {
    id: 'product-user',
    role: 'Product User',
    label: 'Field operator',
    description:
      'Works with devices already in the account. Groups and project membership stay read-only.',
    user: {
      avatarAlt: 'Jordan Lee',
      email: 'jordan.lee@trimble.com',
      name: 'Jordan Lee',
    },
  },
];

export const MANAGE_PROJECTS_VARIANTS: readonly ManageProjectsVariant[] = [
  {
    id: 'option-01',
    label: 'Project cleanup (only unassign)',
    description: 'Assigned projects only. Remove a device or asset, and open the project.',
  },
  {
    id: 'option-02',
    label: 'Assign and unassign',
    description: 'Assigned and available projects, filtered by server location.',
  },
];

export const INVENTORY_VIEWS: readonly InventoryView[] = [
  {
    id: 'device-only',
    label: 'Device only view',
    description:
      'Map and devices stay in device context. Asset view and View asset stay hidden.',
  },
  {
    id: 'device-and-asset',
    label: 'Device and asset view',
    description: 'Device view and asset view, including View asset on device details.',
  },
];

export const DEFAULT_SIDE_NAV: readonly NavItemId[] = [
  'map',
  'devices',
  'alerts',
  'configurations',
  'firmware-updates',
];

export const DEFAULT_EXPERIMENT_CONFIG: ExperimentConfig = {
  persona: 'licensed-admin',
  manageProjects: 'option-01',
  inventoryView: 'device-only',
  sideNav: [...DEFAULT_SIDE_NAV],
};

export function personaById(id: PersonaId): Persona {
  return PERSONAS.find((persona) => persona.id === id) ?? PERSONAS[0];
}

export function manageProjectsVariant(id: ManageProjectsVariantId): ManageProjectsVariant {
  return MANAGE_PROJECTS_VARIANTS.find((variant) => variant.id === id) ?? MANAGE_PROJECTS_VARIANTS[0];
}

/** Device and asset toggles, plus View asset on device details. */
export function showsAssetView(inventoryView: InventoryViewId): boolean {
  return inventoryView === 'device-and-asset';
}

/** Account administration: groups, device registration, and project assignment. */
export function canAdministerDevices(persona: PersonaId): boolean {
  return persona === 'licensed-admin';
}

function isPersonaId(value: unknown): value is PersonaId {
  return PERSONAS.some((persona) => persona.id === value);
}

function isManageProjectsVariantId(value: unknown): value is ManageProjectsVariantId {
  return MANAGE_PROJECTS_VARIANTS.some((variant) => variant.id === value);
}

function isInventoryViewId(value: unknown): value is InventoryViewId {
  return INVENTORY_VIEWS.some((view) => view.id === value);
}

function sideNavFrom(value: unknown): NavItemId[] {
  if (!Array.isArray(value)) {
    return [...DEFAULT_SIDE_NAV];
  }

  const ordered = orderedSideNav(value);
  const hasKnownId = value.some(isNavItemId);
  if (!hasKnownId && value.length > 0) {
    return [...DEFAULT_SIDE_NAV];
  }

  return ordered;
}

export function loadExperimentConfig(): ExperimentConfig {
  if (typeof window === 'undefined') {
    return DEFAULT_EXPERIMENT_CONFIG;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_EXPERIMENT_CONFIG;
    }

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed == null) {
      return DEFAULT_EXPERIMENT_CONFIG;
    }

    const record = parsed as {
      persona?: unknown;
      manageProjects?: unknown;
      inventoryView?: unknown;
      sideNav?: unknown;
    };
    return {
      persona: isPersonaId(record.persona) ? record.persona : DEFAULT_EXPERIMENT_CONFIG.persona,
      manageProjects: isManageProjectsVariantId(record.manageProjects)
        ? record.manageProjects
        : DEFAULT_EXPERIMENT_CONFIG.manageProjects,
      inventoryView: isInventoryViewId(record.inventoryView)
        ? record.inventoryView
        : DEFAULT_EXPERIMENT_CONFIG.inventoryView,
      sideNav: sideNavFrom(record.sideNav),
    };
  } catch {
    return DEFAULT_EXPERIMENT_CONFIG;
  }
}

export function saveExperimentConfig(config: ExperimentConfig) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}
