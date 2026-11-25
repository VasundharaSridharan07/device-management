const STORAGE_KEY = 'devicemanagement.prototype';

export type PersonaId = 'licensed-admin' | 'product-user';

export type ManageProjectsVariantId = 'option-01' | 'option-02';

export type PrototypeUser = {
  avatarAlt: string;
  email: string;
  name: string;
};

export type Persona = {
  id: PersonaId;
  label: string;
  description: string;
  user: PrototypeUser;
};

export type ManageProjectsVariant = {
  id: ManageProjectsVariantId;
  label: string;
  description: string;
};

export type ExperimentConfig = {
  persona: PersonaId;
  manageProjects: ManageProjectsVariantId;
};

export const PERSONAS: readonly Persona[] = [
  {
    id: 'licensed-admin',
    label: 'Licensed Admin',
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
    label: 'Product User',
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
    label: 'Option 01',
    description: 'Current dialog. Assigned and available projects, filtered by server location.',
  },
  {
    id: 'option-02',
    label: 'Option 02',
    description: 'Reserved for the next manage-projects design. Opens a placeholder for now.',
  },
];

export const DEFAULT_EXPERIMENT_CONFIG: ExperimentConfig = {
  persona: 'licensed-admin',
  manageProjects: 'option-01',
};

export function personaById(id: PersonaId): Persona {
  return PERSONAS.find((persona) => persona.id === id) ?? PERSONAS[0];
}

export function manageProjectsVariant(id: ManageProjectsVariantId): ManageProjectsVariant {
  return MANAGE_PROJECTS_VARIANTS.find((variant) => variant.id === id) ?? MANAGE_PROJECTS_VARIANTS[0];
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

    const record = parsed as { persona?: unknown; manageProjects?: unknown };
    return {
      persona: isPersonaId(record.persona) ? record.persona : DEFAULT_EXPERIMENT_CONFIG.persona,
      manageProjects: isManageProjectsVariantId(record.manageProjects)
        ? record.manageProjects
        : DEFAULT_EXPERIMENT_CONFIG.manageProjects,
    };
  } catch {
    return DEFAULT_EXPERIMENT_CONFIG;
  }
}

export function saveExperimentConfig(config: ExperimentConfig) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}
