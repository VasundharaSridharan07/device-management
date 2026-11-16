import deviceIcon from './assets/custom-icons/device.svg';

export type NavIconSource =
  | { type: 'modus'; name: string }
  | { type: 'svgUrl'; src: string }
  | { type: 'svgMarkup'; markup: string };

export type NavItem = {
  path: string;
  value: string;
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
];

export function navFromPath(pathname: string): NavItem {
  return PRIMARY_NAV.find((item) => item.path === pathname) ?? PRIMARY_NAV[0];
}
