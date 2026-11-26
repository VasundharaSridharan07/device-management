import { DEVICES, type ServerLocationId } from './devices';
import projectRecords from './projects.json' with { type: 'json' };

export type ProjectLocation = 'northAmerica' | 'europe' | 'asia';

export type ProjectPerson = {
  status: string;
  id: string;
  tiduuid: string;
  email: string;
  firstName: string;
  lastName: string;
};

/** Connect-style project catalog. Device membership is not part of this record. */
export type ProjectRecord = {
  id: string;
  name: string;
  rootId: string;
  thumbnail: string;
  address: {
    text?: string;
    geometry: string;
  };
  location: ProjectLocation;
  lastVisitedOn: string;
  modifiedOn: string;
  createdOn: string;
  createdBy: ProjectPerson;
  modifiedBy: ProjectPerson;
  updatedOn: string;
  updatedBy: ProjectPerson;
  size: number;
  filespaceId: string;
  description: string;
  license: {
    policyType: string;
    appAccess: boolean;
  };
  access: string;
  iamGroupId: string;
};

const PROJECT_LOCATIONS = new Set<ProjectLocation>(['northAmerica', 'europe', 'asia']);

function isProjectLocation(value: string): value is ProjectLocation {
  return PROJECT_LOCATIONS.has(value as ProjectLocation);
}

export const PROJECT_RECORDS: ProjectRecord[] = projectRecords.map((record) => {
  if (!isProjectLocation(record.location)) {
    throw new Error(`Unknown project location: ${record.location}`);
  }

  return {
    ...record,
    location: record.location,
  };
});

export const ACCOUNT_NAME = 'Sanderson Account';

/**
 * Placeholder until the project management application URL is supplied.
 * View links open `${PROJECT_VIEW_URL}/${projectId}` in a new tab.
 */
export const PROJECT_VIEW_URL = 'https://example.com/projects';

export function projectViewUrl(projectId: string): string {
  return `${PROJECT_VIEW_URL}/${encodeURIComponent(projectId)}`;
}

/**
 * Temporary project shape until the project object metadata is supplied.
 * `regionId` is the server location whose project list includes this project.
 * `activeDeviceIds` lists devices currently active here. A device may be
 * active in more than one project. Active state is not edited in the dialog.
 */
export type Project = {
  id: string;
  name: string;
  regionId: ServerLocationId;
  deviceIds: string[];
  activeDeviceIds: string[];
};

const KNOWN_DEVICE_IDS = new Set(DEVICES.map((device) => device.id));

const PROJECT_IDS = new Set(PROJECT_RECORDS.map((record) => record.id));

for (const device of DEVICES) {
  for (const assignment of device.projects) {
    if (!PROJECT_IDS.has(assignment.projectId)) {
      throw new Error(`Unknown project ${assignment.projectId} on device ${device.id}`);
    }

    const region = PROJECT_RECORDS.find((record) => record.id === assignment.projectId)?.location;
    if (region !== device.serverLocationId) {
      throw new Error(`Device ${device.id} is assigned outside ${device.serverLocationId}`);
    }
  }
}

/** Membership is the inverse of each device's project assignments. */
export const INITIAL_PROJECTS: Project[] = PROJECT_RECORDS.map((record) => {
  const members = DEVICES.flatMap((device) => {
    const assignment = device.projects.find((item) => item.projectId === record.id);
    return assignment ? [{ id: device.id, active: assignment.active }] : [];
  });

  return {
    id: record.id,
    name: record.name,
    regionId: record.location,
    deviceIds: members.map((member) => member.id),
    activeDeviceIds: members.filter((member) => member.active).map((member) => member.id),
  };
});

export function isDeviceActiveInProject(project: Project, deviceId: string): boolean {
  return project.deviceIds.includes(deviceId) && project.activeDeviceIds.includes(deviceId);
}

export function projectsForDevice(projects: Project[], deviceId: string): Project[] {
  return projects.filter((project) => project.deviceIds.includes(deviceId));
}

export function projectsForDeviceInRegion(
  projects: Project[],
  deviceId: string,
  regionId: string,
): Project[] {
  return projectsForDevice(projects, deviceId).filter((project) => project.regionId === regionId);
}

export function projectsAvailableToAdd(projects: Project[], deviceId: string): Project[] {
  return projects.filter((project) => !project.deviceIds.includes(deviceId));
}

export function projectsAvailableInRegion(
  projects: Project[],
  deviceId: string,
  regionId: string,
): Project[] {
  return projects.filter(
    (project) => project.regionId === regionId && !project.deviceIds.includes(deviceId),
  );
}

export function activeProjectCount(projects: Project[], deviceId: string): number {
  return projectsForDevice(projects, deviceId).filter((project) =>
    isDeviceActiveInProject(project, deviceId),
  ).length;
}

export function assignedOutsideRegionCount(
  projects: Project[],
  deviceId: string,
  regionId: string,
): number {
  return projectsForDevice(projects, deviceId).filter((project) => project.regionId !== regionId)
    .length;
}

export function projectsByIds(projects: Project[], projectIds: readonly string[]): Project[] {
  const ids = new Set(projectIds);
  return projects.filter((project) => ids.has(project.id));
}

export function projectsByIdsInRegion(
  projects: Project[],
  projectIds: readonly string[],
  regionId: string,
): Project[] {
  return projectsByIds(projects, projectIds).filter((project) => project.regionId === regionId);
}

export function projectsAvailableForIdsInRegion(
  projects: Project[],
  projectIds: readonly string[],
  regionId: string,
): Project[] {
  const ids = new Set(projectIds);
  return projects.filter((project) => project.regionId === regionId && !ids.has(project.id));
}

export function assignedIdsOutsideRegionCount(
  projects: Project[],
  projectIds: readonly string[],
  regionId: string,
): number {
  return projectsByIds(projects, projectIds).filter((project) => project.regionId !== regionId)
    .length;
}

/** Up to two names, then "N more". Empty membership reads as unavailable. */
export function projectMembershipLabel(projects: Project[], projectIds: readonly string[]): string {
  const names = projectsByIds(projects, projectIds).map((project) => project.name);
  if (names.length === 0) {
    return 'Unavailable';
  }

  const preview = names.slice(0, 2);
  const hidden = names.length - preview.length;
  return hidden > 0 ? `${preview.join(', ')}, ${hidden} more` : preview.join(', ');
}

export function isAssetActiveInProject(project: Project, deviceIds: readonly string[]): boolean {
  return (
    deviceIds.length > 0 &&
    deviceIds.every((deviceId) => isDeviceActiveInProject(project, deviceId))
  );
}

export function activeAssetProjectCount(
  projects: Project[],
  projectIds: readonly string[],
  deviceIds: readonly string[],
): number {
  return projectsByIds(projects, projectIds).filter((project) =>
    isAssetActiveInProject(project, deviceIds),
  ).length;
}

export function addDevicesToProjects(
  projects: Project[],
  deviceIds: readonly string[],
  projectIds: readonly string[],
): Project[] {
  return deviceIds.reduce(
    (current, deviceId) => addDeviceToProjects(current, deviceId, [...projectIds]),
    projects,
  );
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
  return removeDevicesFromProject(projects, [deviceId], projectId);
}

/** Drops every listed device from one project. Other memberships stay. */
export function removeDevicesFromProject(
  projects: Project[],
  deviceIds: string[],
  projectId: string,
): Project[] {
  const members = new Set(deviceIds);
  return projects.map((project) => {
    if (project.id !== projectId) {
      return project;
    }

    return {
      ...project,
      deviceIds: project.deviceIds.filter((id) => !members.has(id)),
      activeDeviceIds: project.activeDeviceIds.filter((id) => !members.has(id)),
    };
  });
}

