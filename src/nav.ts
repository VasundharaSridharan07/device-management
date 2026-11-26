import deviceIcon from './assets/custom-icons/device.svg';

export type NavIconSource =
  | { type: 'modus'; name: string }
  | { type: 'svgUrl'; src: string }
  | { type: 'svgMarkup'; markup: string };

export type NavItemId =
  | 'map'
  | 'devices'
  | 'geofences'
  | 'alerts'
  | 'configurations'
  | 'firmware-updates'
  | 'ibss'
  | 'partners';

export type NavItem = {
  path: string;
  value: NavItemId;
  label: string;
  icon: NavIconSource;
  description: string;
};

export const PRIMARY_NAV: NavItem[] = [
  {
    path: '/',
    value: 'map',
    label: 'Map',
    icon: { type: 'modus', name: 'map' },
    description: 'View devices and activity on the map.',
  },
  {
    path: '/devices',
    value: 'devices',
    label: 'Devices',
    icon: { type: 'svgUrl', src: deviceIcon },
    description: 'Device inventory will appear here.',
  },
  {
    path: '/geofences',
    value: 'geofences',
    label: 'Geofences',
    icon: { type: 'modus', name: 'polygon' },
    description: 'Geofence setup will appear here.',
  },
  {
    path: '/alerts',
    value: 'alerts',
    label: 'Alerts',
    icon: { type: 'modus', name: 'alert' },
    description: 'Alerts and notifications will appear here.',
  },
  {
    path: '/configurations',
    value: 'configurations',
    label: 'Configurations',
    icon: { type: 'modus', name: 'settings' },
    description: 'Configuration setup will appear here.',
  },
  {
    path: '/firmware-updates',
    value: 'firmware-updates',
    label: 'Firmware updates',
    icon: { type: 'modus', name: 'download' },
    description: 'Firmware updates will appear here.',
  },
  {
    path: '/ibss',
    value: 'ibss',
    label: 'IBSS',
    icon: { type: 'modus', name: 'antenna' },
    description: 'IBSS will appear here.',
  },
  {
    path: '/partners',
    value: 'partners',
    label: 'Partners',
    icon: { type: 'modus', name: 'people_group' },
    description: 'Partners will appear here.',
  },
];

const NAV_ITEM_IDS = new Set<NavItemId>(PRIMARY_NAV.map((item) => item.value));

export function isNavItemId(value: unknown): value is NavItemId {
  return typeof value === 'string' && NAV_ITEM_IDS.has(value as NavItemId);
}

/** Checked items in catalog order, skipping anything that is not a nav id. */
export function orderedSideNav(ids: readonly unknown[]): NavItemId[] {
  const selected = new Set(ids.filter(isNavItemId));
  return PRIMARY_NAV.map((item) => item.value).filter((id) => selected.has(id));
}

export function visibleNavItems(ids: readonly NavItemId[]): NavItem[] {
  const selected = new Set(ids);
  return PRIMARY_NAV.filter((item) => selected.has(item.value));
}

export function navFromPath(pathname: string): NavItem {
  if (
    pathname === '/devices' ||
    pathname.startsWith('/devices/') ||
    pathname.startsWith('/assets/')
  ) {
    return PRIMARY_NAV.find((item) => item.value === 'devices') ?? PRIMARY_NAV[0];
  }

  return PRIMARY_NAV.find((item) => item.path === pathname) ?? PRIMARY_NAV[0];
}
