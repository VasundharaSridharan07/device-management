import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import {
  loadExperimentConfig,
  saveExperimentConfig,
  type ExperimentConfig,
  type ManageProjectsVariantId,
  type PersonaId,
} from './config';

type ExperimentContextValue = {
  config: ExperimentConfig;
  setPersona: (persona: PersonaId) => void;
  setManageProjects: (variant: ManageProjectsVariantId) => void;
};

const ExperimentContext = createContext<ExperimentContextValue | null>(null);

export function ExperimentProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ExperimentConfig>(loadExperimentConfig);

  const update = useCallback((patch: Partial<ExperimentConfig>) => {
    setConfig((current) => {
      const next = { ...current, ...patch };
      saveExperimentConfig(next);
      return next;
    });
  }, []);

  const setPersona = useCallback(
    (persona: PersonaId) => {
      update({ persona });
    },
    [update],
  );

  const setManageProjects = useCallback(
    (manageProjects: ManageProjectsVariantId) => {
      update({ manageProjects });
    },
    [update],
  );

  const value = useMemo(
    () => ({ config, setPersona, setManageProjects }),
    [config, setManageProjects, setPersona],
  );

  return <ExperimentContext.Provider value={value}>{children}</ExperimentContext.Provider>;
}

export function useExperiment(): ExperimentContextValue {
  const value = useContext(ExperimentContext);
  if (!value) {
    throw new Error('useExperiment must be used within ExperimentProvider');
  }

  return value;
}
