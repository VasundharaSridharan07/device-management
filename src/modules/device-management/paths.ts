export const DM_MAP_PATH = '/device-management';
export const DM_DEVICES_PATH = '/device-management/devices';
export const DM_ASSETS_PREFIX = '/device-management/assets';

export function dmSectionPath(section: string): string {
  return `${DM_MAP_PATH}/${section}`;
}

export function deviceDetailsPath(deviceId: string): string {
  return `${DM_DEVICES_PATH}/${deviceId}`;
}

export function assetDetailsPath(assetId: string): string {
  return `${DM_ASSETS_PREFIX}/${assetId}`;
}

const LEGACY_ROOTS = [
  '/devices',
  '/assets',
  '/geofences',
  '/alerts',
  '/configurations',
  '/firmware-updates',
  '/ibss',
  '/partners',
] as const;

/** Map the current Device Management URL, including bookmarked paths, onto the product prefix. */
export function normalizeDeviceManagementPath(pathname: string): string {
  if (pathname === '/') {
    return DM_MAP_PATH;
  }

  if (pathname === DM_MAP_PATH || pathname.startsWith(`${DM_MAP_PATH}/`)) {
    return pathname;
  }

  const legacy = LEGACY_ROOTS.find(
    (root) => pathname === root || pathname.startsWith(`${root}/`),
  );
  if (legacy) {
    return `${DM_MAP_PATH}${pathname}`;
  }

  return pathname;
}
