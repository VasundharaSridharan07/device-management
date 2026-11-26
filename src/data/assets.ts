import { DEVICES, type ServerLocationId } from './devices';
import { SCENE_SITES } from './mapScene';
import { PROJECT_RECORDS } from './projects';

export const UNAVAILABLE = 'Unavailable';

export const NO_ASSOCIATED_ASSET = 'No associated asset';

/** Catalog devices used by the four scenarios. Reported components are not in this set. */
export const SCENARIO_DEVICE_IDS = {
  ec520: 'm2J6uF9cQ7r',
  ec520w: 'n7K1xG4eR5s',
  snm941: 'v5T2fP4nA8z',
  r750: 'r3P7bK1hW4v',
  tablet: 'e6W3hB9uG2f',
} as const;

const PROJECT = {
  sandersDam: 'g432DvVWd38',
  riverway: 'wX5yZ6aB7cD',
  greenLine: 'k7NpQ2mLx9A',
  kettlewell: 'wuhrHCBI7X4',
  harbor: 'pR8sT1uVw2X',
  civic: 'gH9iJ0kL1mN',
  oakGrove: 'oP2qR3sT4uV',
  alpine: 'eF8gH9iJ0kL',
} as const;

/** Nested hardware from a status message. These are not catalog devices and cannot be opened. */
export type ReportedComponent = {
  model: string;
  serialNumber: string | null;
  firmware: string | null;
  location: string | null;
  connected: boolean;
};

/**
 * Equipment derived from a status message, plus the authored dozer scenario.
 * A null field was absent from the message. The dozer has no status message,
 * so only its scenario identity is filled in.
 */
export type Asset = {
  id: string;
  name: string;
  type: string;
  make: string | null;
  model: string | null;
  serialNumber: string | null;
  attachmentName: string | null;
  lastReported: string | null;
  projectIds: string[];
  locationLabel: string;
  latitude: number;
  longitude: number;
  deviceIds: string[];
  components: ReportedComponent[];
};

function component(
  model: string,
  serialNumber: string | null,
  firmware: string | null,
  connected: boolean,
  location: string | null = null,
): ReportedComponent {
  return { model, serialNumber, firmware, connected, location };
}

/** Sample 01 `devices[]` rows that are not the catalog EC520-W or SNM941. */
const EXCAVATOR_COMPONENTS: ReportedComponent[] = [
  component('GS5xx', null, null, false),
  component('GS5xx', null, null, false),
  component('GS5xx', null, null, false),
  component('GS5xx', null, null, false),
  component('GS5xx', null, null, false),
  component('X20', null, null, false),
  component('MS9xx', null, null, false),
  component('MS9xx', null, null, false),
  component('VM510', null, null, false),
  component('CI5xx', '0', null, false),
  component('AA510', null, null, false),
];

const excavator = SCENE_SITES.excavator;
const dozer = SCENE_SITES.dozer;
const receiver = SCENE_SITES.receiver;
const tablet = SCENE_SITES.tablet;

export const ASSETS: Asset[] = [
  {
    id: 'asset-excavator',
    name: 'Two Piece Boom Autos (325FLCR)',
    type: 'Excavator',
    make: 'Caterpillar',
    model: '325FLCR (Two-piece boom)',
    serialNumber: null,
    attachmentName: 'Steelwrist X20 20190318',
    lastReported: '2026-11-26T05:35:49Z',
    projectIds: [PROJECT.sandersDam, PROJECT.greenLine, PROJECT.harbor],
    locationLabel: excavator.label,
    latitude: excavator.latitude,
    longitude: excavator.longitude,
    deviceIds: [SCENARIO_DEVICE_IDS.ec520w, SCENARIO_DEVICE_IDS.snm941],
    components: EXCAVATOR_COMPONENTS,
  },
  {
    id: 'asset-gnss-receiver',
    name: 'Trimble',
    type: 'Trimble GNSS Receiver',
    make: 'Trimble',
    model: 'R750',
    serialNumber: '6430R05389',
    attachmentName: null,
    lastReported: '2026-11-26T05:34:56Z',
    projectIds: [PROJECT.riverway, PROJECT.alpine, PROJECT.civic],
    locationLabel: receiver.label,
    latitude: receiver.latitude,
    longitude: receiver.longitude,
    deviceIds: [SCENARIO_DEVICE_IDS.r750],
    components: [],
  },
  {
    id: 'asset-dozer',
    name: 'Dozer',
    type: 'Dozer',
    make: null,
    model: null,
    serialNumber: null,
    attachmentName: null,
    lastReported: null,
    projectIds: [PROJECT.sandersDam, PROJECT.greenLine, PROJECT.kettlewell],
    locationLabel: dozer.label,
    latitude: dozer.latitude,
    longitude: dozer.longitude,
    deviceIds: [SCENARIO_DEVICE_IDS.ec520],
    components: [],
  },
  {
    id: 'asset-tablet',
    name: 'Tablet DAD214200985',
    type: 'Tablet',
    make: null,
    model: null,
    serialNumber: 'DAD214200985',
    attachmentName: null,
    lastReported: '2026-08-28T15:56:27Z',
    projectIds: [PROJECT.riverway, PROJECT.kettlewell, PROJECT.oakGrove],
    locationLabel: tablet.label,
    latitude: tablet.latitude,
    longitude: tablet.longitude,
    deviceIds: [SCENARIO_DEVICE_IDS.tablet],
    components: [],
  },
];

const PROJECT_IDS = new Set(PROJECT_RECORDS.map((record) => record.id));
const DEVICE_BY_ID = new Map(DEVICES.map((device) => [device.id, device]));

function sameCoordinate(left: number, right: number): boolean {
  return Math.abs(left - right) < 1e-9;
}

const claimedDevices = new Set<string>();

for (const asset of ASSETS) {
  if (new Set(asset.projectIds).size !== asset.projectIds.length) {
    throw new Error(`Duplicate project on asset ${asset.id}`);
  }

  for (const projectId of asset.projectIds) {
    if (!PROJECT_IDS.has(projectId)) {
      throw new Error(`Unknown project ${projectId} on asset ${asset.id}`);
    }
  }

  for (const deviceId of asset.deviceIds) {
    if (claimedDevices.has(deviceId)) {
      throw new Error(`Device ${deviceId} is on more than one asset`);
    }
    claimedDevices.add(deviceId);

    const device = DEVICE_BY_ID.get(deviceId);
    if (!device) {
      throw new Error(`Unknown device ${deviceId} on asset ${asset.id}`);
    }

    const membership = device.projects.map((assignment) => assignment.projectId).sort();
    const assetProjects = [...asset.projectIds].sort();
    if (membership.join('|') !== assetProjects.join('|')) {
      throw new Error(`Device ${deviceId} must share projects with ${asset.id}`);
    }

    if (
      !sameCoordinate(Number(device.latitude), asset.latitude) ||
      !sameCoordinate(Number(device.longitude), asset.longitude)
    ) {
      throw new Error(`Device ${deviceId} is not at the ${asset.id} coordinate`);
    }
  }
}

export function displayValue(value: string | null | undefined): string {
  const trimmed = value?.trim() ?? '';
  if (!trimmed || trimmed === '---') {
    return UNAVAILABLE;
  }

  return trimmed;
}

export function assetById(assetId: string): Asset | undefined {
  return ASSETS.find((asset) => asset.id === assetId);
}

export function assetForDevice(deviceId: string): Asset | undefined {
  return ASSETS.find((asset) => asset.deviceIds.includes(deviceId));
}

/** Server location shared by the asset's devices. Mixed fleets keep the first device's location. */
export function serverLocationForDevices(deviceIds: readonly string[]): {
  locationId: ServerLocationId;
  shared: boolean;
} {
  const locations = deviceIds.flatMap((deviceId) => {
    const locationId = DEVICE_BY_ID.get(deviceId)?.serverLocationId;
    return locationId ? [locationId] : [];
  });
  const locationId = locations[0] ?? 'northAmerica';
  return {
    locationId,
    shared: locations.length > 0 && locations.every((id) => id === locationId),
  };
}

export function associatedAssetLabel(deviceId: string): string {
  return assetForDevice(deviceId)?.name ?? NO_ASSOCIATED_ASSET;
}
