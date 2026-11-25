import deviceRecords from './devices.json' with { type: 'json' };

export const ALL_DEVICES_GROUP_ID = 'all';

export type DeviceGroup = {
  id: string;
  label: string;
  deviceIds: string[];
};

export type GroupNameError = 'empty' | 'duplicate';

/** Same ids as project locations in projects.json. */
export const SERVER_LOCATIONS = [
  { id: 'northAmerica', label: 'North America' },
  { id: 'europe', label: 'Europe' },
  { id: 'asia', label: 'Asia Pacific' },
] as const;

export type ServerLocationId = (typeof SERVER_LOCATIONS)[number]['id'];

const SERVER_LOCATION_IDS = new Set<string>(SERVER_LOCATIONS.map((location) => location.id));

export function serverLocationLabel(id: string): string {
  return SERVER_LOCATIONS.find((location) => location.id === id)?.label ?? id;
}

export type DeviceProjectAssignment = {
  projectId: string;
  active: boolean;
};

export type DeviceConnectivity = 'on' | 'off';

export type Device = {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  currentFirmware: string;
  availableFirmware: string;
  lastUpdated: string;
  approximateLocation: string;
  latitude: string;
  longitude: string;
  updateFrequency: string;
  battery: string;
  signal: string;
  serverLocationId: ServerLocationId;
  connectivity: DeviceConnectivity;
  projects: DeviceProjectAssignment[];
};

const CATEGORIES = [
  { id: 'data-collectors', label: 'Data collectors' },
  { id: 'groundworks', label: 'Groundworks' },
  { id: 'machine-control', label: 'Machine control' },
  { id: 'gnss-receivers', label: 'GNSS receivers and smart antennas' },
  { id: 'additional-gnss', label: 'Additional GNSS and surveying equipment' },
] as const;

type DeviceCategory = (typeof CATEGORIES)[number]['label'];

const CATEGORY_LABELS = new Set<string>(CATEGORIES.map((category) => category.label));

function isServerLocationId(value: string): value is ServerLocationId {
  return SERVER_LOCATION_IDS.has(value);
}

function isCategory(value: string): value is DeviceCategory {
  return CATEGORY_LABELS.has(value);
}

function isConnectivity(value: string): value is DeviceConnectivity {
  return value === 'on' || value === 'off';
}

type LoadedDevice = {
  device: Device;
  category: DeviceCategory;
};

function loadDevices(): LoadedDevice[] {
  const seenIds = new Set<string>();
  const seenModels = new Set<string>();

  return deviceRecords.map((record) => {
    if (!isServerLocationId(record.serverLocation)) {
      throw new Error(`Unknown server location for ${record.deviceId}: ${record.serverLocation}`);
    }
    if (!isCategory(record.category)) {
      throw new Error(`Unknown category for ${record.deviceId}: ${record.category}`);
    }
    if (!isConnectivity(record.connectivity)) {
      throw new Error(`Unknown connectivity for ${record.deviceId}: ${record.connectivity}`);
    }
    if (record.remoteAccessSupported !== 'yes' && record.remoteAccessSupported !== 'no') {
      throw new Error(`Unknown remote access support for ${record.deviceId}`);
    }
    if (seenIds.has(record.deviceId)) {
      throw new Error(`Duplicate device id: ${record.deviceId}`);
    }
    if (seenModels.has(record.deviceModel)) {
      throw new Error(`Duplicate device model: ${record.deviceModel}`);
    }
    if (record.remoteAccessSupported === 'no' && record.remoteAccessStatus !== 'notApplicable') {
      throw new Error(`${record.deviceId} does not support remote access`);
    }
    if (record.remoteAccessSupported === 'yes' && record.remoteAccessStatus === 'notApplicable') {
      throw new Error(`${record.deviceId} supports remote access`);
    }
    if (record.remoteAccessStatus === 'offline' && record.connectivity !== 'off') {
      throw new Error(`${record.deviceId} is offline but still connected`);
    }
    if (
      record.remoteAccessStatus === 'needsUpgrade' &&
      record.availableFirmware === record.fieldSoftware
    ) {
      throw new Error(`${record.deviceId} needs an upgrade but firmware matches`);
    }

    seenIds.add(record.deviceId);
    seenModels.add(record.deviceModel);

    return {
      category: record.category,
      device: {
        id: record.deviceId,
        name: record.deviceName,
        model: record.deviceModel,
        serialNumber: record.serialNumber,
        currentFirmware: record.fieldSoftware,
        availableFirmware: record.availableFirmware,
        lastUpdated: record.lastReported,
        approximateLocation: record.lastKnownLocation.label,
        latitude: String(record.lastKnownLocation.latitude),
        longitude: String(record.lastKnownLocation.longitude),
        updateFrequency: record.updateFrequency,
        battery: record.battery,
        signal: record.signal,
        serverLocationId: record.serverLocation,
        connectivity: record.connectivity,
        projects: record.projects.map((assignment) => ({
          projectId: assignment.projectId,
          active: assignment.active,
        })),
      },
    };
  });
}

const LOADED_DEVICES = loadDevices();

export const DEVICES: Device[] = LOADED_DEVICES.map((item) => item.device);

export const INITIAL_GROUPS: DeviceGroup[] = CATEGORIES.map((category) => ({
  id: category.id,
  label: category.label,
  deviceIds: LOADED_DEVICES.flatMap((item) =>
    item.category === category.label ? [item.device.id] : [],
  ),
}));

export function deviceCountLabel(count: number): string {
  return `${count} ${count === 1 ? 'Device' : 'Devices'}`;
}

export function memberCount(groups: DeviceGroup[], groupId: string): number {
  if (groupId === ALL_DEVICES_GROUP_ID) {
    return DEVICES.length;
  }

  return groups.find((group) => group.id === groupId)?.deviceIds.length ?? 0;
}

export function devicesForView(groups: DeviceGroup[], groupId: string, query: string): Device[] {
  const needle = query.trim().toLowerCase();
  const members =
    groupId === ALL_DEVICES_GROUP_ID
      ? null
      : new Set(groups.find((group) => group.id === groupId)?.deviceIds ?? []);

  return DEVICES.filter((device) => {
    if (members && !members.has(device.id)) {
      return false;
    }

    if (!needle) {
      return true;
    }

    return (
      device.name.toLowerCase().includes(needle) ||
      device.model.toLowerCase().includes(needle) ||
      device.serialNumber.toLowerCase().includes(needle)
    );
  });
}

export function devicesOutsideGroup(groups: DeviceGroup[], groupId: string): Device[] {
  const members = new Set(groups.find((group) => group.id === groupId)?.deviceIds ?? []);
  return DEVICES.filter((device) => !members.has(device.id));
}

export function groupNameError(groups: DeviceGroup[], name: string): GroupNameError | null {
  const trimmed = name.trim();
  if (!trimmed) {
    return 'empty';
  }

  const needle = trimmed.toLowerCase();
  const duplicate =
    needle === 'all devices' ||
    groups.some((group) => group.label.trim().toLowerCase() === needle);
  if (duplicate) {
    return 'duplicate';
  }

  return null;
}

export function createGroup(name: string, deviceIds: string[]): DeviceGroup {
  const known = new Set(DEVICES.map((device) => device.id));
  return {
    id: `group-${crypto.randomUUID()}`,
    label: name.trim(),
    deviceIds: [...new Set(deviceIds.filter((id) => known.has(id)))],
  };
}

export function addDevicesToGroup(
  groups: DeviceGroup[],
  groupId: string,
  deviceIds: string[],
): DeviceGroup[] {
  const known = new Set(DEVICES.map((device) => device.id));
  return groups.map((group) => {
    if (group.id !== groupId) {
      return group;
    }

    const next = new Set(group.deviceIds);
    for (const id of deviceIds) {
      if (known.has(id)) {
        next.add(id);
      }
    }

    return { ...group, deviceIds: [...next] };
  });
}

export function removeDevicesFromGroup(
  groups: DeviceGroup[],
  groupId: string,
  deviceIds: string[],
): DeviceGroup[] {
  const drop = new Set(deviceIds);
  return groups.map((group) => {
    if (group.id !== groupId) {
      return group;
    }

    return { ...group, deviceIds: group.deviceIds.filter((id) => !drop.has(id)) };
  });
}
