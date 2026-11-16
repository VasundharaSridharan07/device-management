import { DEVICES } from './devices';

export const ACCOUNT_NAME = 'Sanderson Account';

export type Project = {
  id: string;
  name: string;
  deviceIds: string[];
};

const KNOWN_DEVICE_IDS = new Set(DEVICES.map((device) => device.id));

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'green-line-phase-2',
    name: 'Green Line Phase 2',
    deviceIds: ['device-01', 'device-02', 'device-14'],
  },
  {
    id: 'bassin-project',
    name: 'Bassin Project',
    deviceIds: ['device-01', 'device-09'],
  },
  {
    id: 'davids-project',
    name: "David's Project",
    deviceIds: ['device-01'],
  },
  {
    id: 'riverway-extension',
    name: 'Riverway Extension',
    deviceIds: ['device-05', 'device-14'],
  },
  {
    id: 'sanders-dam',
    name: 'Sanders Dam Project',
    deviceIds: ['device-05', 'device-14'],
  },
];

export function projectsForDevice(projects: Project[], deviceId: string): Project[] {
  return projects.filter((project) => project.deviceIds.includes(deviceId));
}

export function projectsAvailableToAdd(projects: Project[], deviceId: string): Project[] {
  return projects.filter((project) => !project.deviceIds.includes(deviceId));
}

export function addDeviceToProjects(
  projects: Project[],
  deviceId: string,
  projectIds: string[],
): Project[] {
  if (!KNOWN_DEVICE_IDS.has(deviceId)) {
    return projects;
  }

  const addTo = new Set(projectIds);
  return projects.map((project) => {
    if (!addTo.has(project.id) || project.deviceIds.includes(deviceId)) {
      return project;
    }

    return { ...project, deviceIds: [...project.deviceIds, deviceId] };
  });
}

export function removeDeviceFromProject(
  projects: Project[],
  deviceId: string,
  projectId: string,
): Project[] {
  return projects.map((project) => {
    if (project.id !== projectId) {
      return project;
    }

    return { ...project, deviceIds: project.deviceIds.filter((id) => id !== deviceId) };
  });
}
