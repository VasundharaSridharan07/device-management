import projectRecords from './projects.json' with { type: 'json' };

export type MapBasemap = 'street' | 'satellite';

export type MapFilter = 'all' | 'alerts' | 'unavailable';

export type MapEntityView = 'devices' | 'assets';

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

/** 10368 Westmoor Dr, Westminster, CO. Both worksites fit at this zoom. */
export const MAP_CENTER: [number, number] = [39.89715, -105.11539];
export const MAP_ZOOM = 15;

/**
 * Four scenario assets around Westmoor Dr. Two sit inside Sanders Dam Worksite
 * and two inside Riverway Extension. Each asset and its devices share one site.
 */
export const SCENE_SITES = {
  excavator: { label: 'Sanders Dam pad', latitude: 39.898, longitude: -105.1264 },
  dozer: { label: 'Sanders Dam west', latitude: 39.8966, longitude: -105.1242 },
  receiver: { label: 'Riverway yard', latitude: 39.8974, longitude: -105.1154 },
  tablet: { label: 'Riverway south', latitude: 39.8964, longitude: -105.1142 },
} as const;

const BOUNDARY_PROJECT_IDS = ['g432DvVWd38', 'wX5yZ6aB7cD'] as const;

function projectBoundary(projectId: string): MapGeofence {
  const record = projectRecords.find((item) => item.id === projectId);
  if (!record) {
    throw new Error(`Missing project boundary ${projectId}`);
  }

  const positions = JSON.parse(record.address.geometry) as [number, number][];
  return {
    id: `project-${projectId}`,
    name: record.name,
    category: 'project-boundary',
    positions,
  };
}

export const MAP_GEOFENCES: MapGeofence[] = [
  {
    id: 'birmingham-west',
    name: 'Birmingham West',
    category: 'geofence',
    positions: [
      [39.9026, -105.1292],
      [39.9028, -105.1256],
      [39.9016, -105.1254],
      [39.9014, -105.129],
    ],
  },
  {
    id: 'birmingham-east',
    name: 'Birmingham East',
    category: 'geofence',
    positions: [
      [39.9014, -105.1176],
      [39.9016, -105.1134],
      [39.9004, -105.1132],
      [39.9002, -105.1174],
    ],
  },
  {
    id: 'west-yard',
    name: 'West yard',
    category: 'geofence',
    positions: [
      [39.899, -105.1344],
      [39.8988, -105.1324],
      [39.8968, -105.1326],
      [39.897, -105.1346],
    ],
  },
  {
    id: 'south-pad',
    name: 'South pad',
    category: 'geofence',
    positions: [
      [39.8938, -105.117],
      [39.8936, -105.1136],
      [39.8924, -105.1138],
      [39.8926, -105.1172],
    ],
  },
  ...BOUNDARY_PROJECT_IDS.map(projectBoundary),
  {
    id: 'stockpile-exclusion',
    name: 'Stockpile exclusion',
    category: 'avoidance',
    positions: [
      [39.8974, -105.1292],
      [39.8976, -105.1278],
      [39.8964, -105.1276],
      [39.8962, -105.129],
    ],
  },
  {
    id: 'haul-road-buffer',
    name: 'Haul road buffer',
    category: 'avoidance',
    positions: [
      [39.899, -105.1206],
      [39.8988, -105.1196],
      [39.8958, -105.1198],
      [39.896, -105.1208],
    ],
  },
];

/** Alert total stays as map chrome. The entity count follows the active map view. */
export const MAP_COUNTS = {
  geofences: MAP_GEOFENCES.length,
  alerts: 94,
} as const;

export function isMapFilter(value: string): value is MapFilter {
  return value === 'all' || value === 'alerts' || value === 'unavailable';
}

export function visibleMapGeofences(query: string): MapGeofence[] {
  const needle = query.trim().toLowerCase();
  if (needle.length === 0) {
    return MAP_GEOFENCES;
  }

  return MAP_GEOFENCES.filter((geofence) => geofence.name.toLowerCase().includes(needle));
}
