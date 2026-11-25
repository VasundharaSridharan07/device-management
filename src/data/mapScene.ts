import { DEVICES } from './devices';

export type MapBasemap = 'street' | 'satellite';

export type MapFilter = 'all' | 'alerts' | 'unavailable';

export type MapAsset = {
  id: string;
  name: string;
  lastReport: string;
  alert: boolean;
  unavailable: boolean;
  latitude: number;
  longitude: number;
};

export type MapGeofenceCategory = 'geofence' | 'project-boundary' | 'avoidance';

export type MapPanelView = 'devices' | 'geofences';

export type MapGeofence = {
  id: string;
  name: string;
  category: MapGeofenceCategory;
  positions: [number, number][];
};

export const GEOFENCE_GROUPS: {
  category: MapGeofenceCategory;
  label: string;
  itemLabel: string;
  icon: string;
}[] = [
  { category: 'geofence', label: 'Geofences', itemLabel: 'Geofence', icon: 'polygon' },
  {
    category: 'project-boundary',
    label: 'Project boundary',
    itemLabel: 'Project boundary',
    icon: 'polygon_area_tool',
  },
  {
    category: 'avoidance',
    label: 'Avoidance zones',
    itemLabel: 'Avoidance zone',
    icon: 'stop_circle',
  },
];

export const MAP_CENTER: [number, number] = [-43.5438, 172.596];
export const MAP_ZOOM = 16;

/** Pins follow each device's last known location. Unavailable follows connectivity off. */
export const MAP_ASSETS: MapAsset[] = DEVICES.map((device) => ({
  id: device.id,
  name: device.name,
  lastReport: device.lastUpdated,
  alert: false,
  unavailable: device.connectivity === 'off',
  latitude: Number(device.latitude),
  longitude: Number(device.longitude),
}));

export const MAP_GEOFENCES: MapGeofence[] = [
  {
    id: 'birmingham-west',
    name: 'Birmingham West',
    category: 'geofence',
    positions: [
      [-43.5448, 172.5974],
      [-43.5434, 172.5996],
      [-43.5452, 172.6008],
      [-43.5464, 172.5982],
    ],
  },
  {
    id: 'birmingham-east',
    name: 'Birmingham East',
    category: 'geofence',
    positions: [
      [-43.5414, 172.6004],
      [-43.5408, 172.6046],
      [-43.5436, 172.6052],
      [-43.5442, 172.601],
    ],
  },
  {
    id: 'west-yard',
    name: 'West yard',
    category: 'geofence',
    positions: [
      [-43.5456, 172.5924],
      [-43.5442, 172.5948],
      [-43.5462, 172.5956],
      [-43.5474, 172.5932],
    ],
  },
  {
    id: 'south-pad',
    name: 'South pad',
    category: 'geofence',
    positions: [
      [-43.5484, 172.5962],
      [-43.5474, 172.5986],
      [-43.549, 172.5994],
      [-43.5498, 172.5968],
    ],
  },
  {
    id: 'site-boundary',
    name: 'Site boundary',
    category: 'project-boundary',
    positions: [
      [-43.5496, 172.5912],
      [-43.5382, 172.5912],
      [-43.5382, 172.6078],
      [-43.5496, 172.6078],
    ],
  },
  {
    id: 'stockpile-exclusion',
    name: 'Stockpile exclusion',
    category: 'avoidance',
    positions: [
      [-43.5406, 172.5936],
      [-43.5398, 172.5952],
      [-43.5412, 172.596],
      [-43.542, 172.5942],
    ],
  },
  {
    id: 'haul-road-buffer',
    name: 'Haul road buffer',
    category: 'avoidance',
    positions: [
      [-43.547, 172.6024],
      [-43.5462, 172.6052],
      [-43.547, 172.6056],
      [-43.5478, 172.6028],
    ],
  },
];

/** Alert total stays as map chrome. Asset and geofence counts match the catalogs. */
export const MAP_COUNTS = {
  assets: MAP_ASSETS.length,
  geofences: MAP_GEOFENCES.length,
  alerts: 94,
} as const;

export function isMapFilter(value: string): value is MapFilter {
  return value === 'all' || value === 'alerts' || value === 'unavailable';
}

export function visibleMapAssets(query: string, filter: MapFilter): MapAsset[] {
  const needle = query.trim().toLowerCase();

  return MAP_ASSETS.filter((asset) => {
    if (filter === 'alerts' && !asset.alert) {
      return false;
    }

    if (filter === 'unavailable' && !asset.unavailable) {
      return false;
    }

    if (needle.length > 0 && !asset.name.toLowerCase().includes(needle)) {
      return false;
    }

    return true;
  });
}

export function visibleMapGeofences(query: string): MapGeofence[] {
  const needle = query.trim().toLowerCase();
  if (needle.length === 0) {
    return MAP_GEOFENCES;
  }

  return MAP_GEOFENCES.filter((geofence) => geofence.name.toLowerCase().includes(needle));
}
