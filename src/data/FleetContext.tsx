import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { ASSETS, assetForDevice, type Asset } from './assets';
import {
  INITIAL_PROJECTS,
  PROJECT_RECORDS,
  addDeviceToProjects,
  addDevicesToProjects,
  removeDeviceFromProject,
  removeDevicesFromProject,
  type Project,
} from './projects';

type FleetContextValue = {
  projects: Project[];
  assets: Asset[];
  assetForDevice: (deviceId: string) => Asset | undefined;
  addDeviceProjects: (deviceId: string, projectIds: string[]) => void;
  removeDeviceProject: (deviceId: string, projectId: string) => void;
  addAssetProjects: (assetId: string, projectIds: string[]) => void;
  removeAssetProject: (assetId: string, projectId: string) => void;
};

const FleetContext = createContext<FleetContextValue | null>(null);

const KNOWN_PROJECT_IDS = new Set(PROJECT_RECORDS.map((record) => record.id));

function initialAssetProjects(): Record<string, string[]> {
  return Object.fromEntries(ASSETS.map((asset) => [asset.id, [...asset.projectIds]]));
}

function appendProjectIds(existing: readonly string[], projectIds: readonly string[]): string[] {
  const next = [...existing];
  for (const projectId of projectIds) {
    if (KNOWN_PROJECT_IDS.has(projectId) && !next.includes(projectId)) {
      next.push(projectId);
    }
  }

  return next;
}

export function FleetProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [assetProjectIds, setAssetProjectIds] = useState<Record<string, string[]>>(
    initialAssetProjects,
  );

  const assets = useMemo(
    () =>
      ASSETS.map((asset) => ({
        ...asset,
        projectIds: assetProjectIds[asset.id] ?? [...asset.projectIds],
      })),
    [assetProjectIds],
  );

  const assetForDeviceId = useCallback(
    (deviceId: string) => assets.find((asset) => asset.deviceIds.includes(deviceId)),
    [assets],
  );

  const addAssetProjects = useCallback((assetId: string, projectIds: string[]) => {
    const asset = ASSETS.find((item) => item.id === assetId);
    const accepted = projectIds.filter((id) => KNOWN_PROJECT_IDS.has(id));
    if (!asset || accepted.length === 0) {
      return;
    }

    setAssetProjectIds((current) => ({
      ...current,
      [assetId]: appendProjectIds(current[assetId] ?? [], accepted),
    }));
    setProjects((current) => addDevicesToProjects(current, asset.deviceIds, accepted));
  }, []);

  const removeAssetProject = useCallback((assetId: string, projectId: string) => {
    const asset = ASSETS.find((item) => item.id === assetId);
    if (!asset) {
      return;
    }

    setAssetProjectIds((current) => ({
      ...current,
      [assetId]: (current[assetId] ?? []).filter((id) => id !== projectId),
    }));
    setProjects((current) => removeDevicesFromProject(current, asset.deviceIds, projectId));
  }, []);

  const addDeviceProjects = useCallback(
    (deviceId: string, projectIds: string[]) => {
      const asset = assetForDevice(deviceId);
      if (asset) {
        addAssetProjects(asset.id, projectIds);
        return;
      }

      setProjects((current) => addDeviceToProjects(current, deviceId, projectIds));
    },
    [addAssetProjects],
  );

  const removeDeviceProject = useCallback(
    (deviceId: string, projectId: string) => {
      const asset = assetForDevice(deviceId);
      if (!asset) {
        setProjects((current) => removeDeviceFromProject(current, deviceId, projectId));
        return;
      }

      removeAssetProject(asset.id, projectId);
    },
    [removeAssetProject],
  );

  const value = useMemo(
    () => ({
      projects,
      assets,
      assetForDevice: assetForDeviceId,
      addDeviceProjects,
      removeDeviceProject,
      addAssetProjects,
      removeAssetProject,
    }),
    [
      projects,
      assets,
      assetForDeviceId,
      addDeviceProjects,
      removeDeviceProject,
      addAssetProjects,
      removeAssetProject,
    ],
  );

  return <FleetContext.Provider value={value}>{children}</FleetContext.Provider>;
}

export function useFleet(): FleetContextValue {
  const value = useContext(FleetContext);
  if (!value) {
    throw new Error('useFleet must be used within FleetProvider');
  }

  return value;
}
