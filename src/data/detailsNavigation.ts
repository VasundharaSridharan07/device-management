import {
  DM_DEVICES_PATH,
  DM_MAP_PATH,
  assetDetailsPath,
  deviceDetailsPath,
} from '../modules/device-management/paths';
import type { MapEntityView } from './mapScene';

export type DetailsLocationState = {
  returnTo: 'map' | 'devices' | 'asset' | 'device';
  entityView?: MapEntityView;
  assetId?: string;
  deviceId?: string;
  parent?: DetailsLocationState;
};

const RETURN_TARGETS = new Set<DetailsLocationState['returnTo']>([
  'map',
  'devices',
  'asset',
  'device',
]);

export function detailsStateFrom(value: unknown): DetailsLocationState | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const state = value as DetailsLocationState;
  if (!RETURN_TARGETS.has(state.returnTo)) {
    return null;
  }

  return state;
}

export function listDeviceState(): DetailsLocationState {
  return { returnTo: 'devices', entityView: 'devices' };
}

export function listAssetState(): DetailsLocationState {
  return { returnTo: 'devices', entityView: 'assets' };
}

export function deviceFromAssetState(
  assetId: string,
  parent: DetailsLocationState | null,
): DetailsLocationState {
  return {
    returnTo: 'asset',
    assetId,
    entityView: 'assets',
    parent: parent ?? listAssetState(),
  };
}

export function assetFromDeviceState(
  deviceId: string,
  parent: DetailsLocationState | null,
): DetailsLocationState {
  return {
    returnTo: 'device',
    deviceId,
    entityView: 'devices',
    parent: parent ?? listDeviceState(),
  };
}

export function backLocation(state: DetailsLocationState | null): {
  pathname: string;
  state?: DetailsLocationState;
} {
  if (state?.returnTo === 'map') {
    return { pathname: DM_MAP_PATH };
  }

  if (state?.returnTo === 'asset' && state.assetId) {
    return {
      pathname: assetDetailsPath(state.assetId),
      state: state.parent ?? listAssetState(),
    };
  }

  if (state?.returnTo === 'device' && state.deviceId) {
    return {
      pathname: deviceDetailsPath(state.deviceId),
      state: state.parent ?? listDeviceState(),
    };
  }

  return {
    pathname: DM_DEVICES_PATH,
    state: {
      returnTo: 'devices',
      entityView: state?.entityView ?? 'devices',
    },
  };
}

export function backLabel(state: DetailsLocationState | null): string {
  if (state?.returnTo === 'map') {
    return 'Back to map';
  }
  if (state?.returnTo === 'asset') {
    return 'Back to asset';
  }
  if (state?.returnTo === 'device') {
    return 'Back to device';
  }
  return 'Back to devices';
}
