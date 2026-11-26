import assetDefaultActive from '../assets/map-markers/assets/default_active.svg';
import assetDefaultNotReporting from '../assets/map-markers/assets/default_notreporting.svg';
import assetDefaultWarning from '../assets/map-markers/assets/default_warning.svg';
import dozerActive from '../assets/map-markers/assets/dozer_active.svg';
import dozerNotReporting from '../assets/map-markers/assets/dozer_notreporting.svg';
import dozerWarning from '../assets/map-markers/assets/dozer_warning.svg';
import excavatorActive from '../assets/map-markers/assets/exacavator_active.svg';
import excavatorNotReporting from '../assets/map-markers/assets/excavator_notreporting.svg';
import excavatorWarning from '../assets/map-markers/assets/excavator_warning.svg';
import assetTabletActive from '../assets/map-markers/assets/tablet_active.svg';
import assetTabletNotReporting from '../assets/map-markers/assets/tablet_notreporting.svg';
import assetTabletWarning from '../assets/map-markers/assets/tablet_warning.svg';
import cb460Active from '../assets/map-markers/devices/CB460_active.svg';
import cb460NotReporting from '../assets/map-markers/devices/CB460_notreporting.svg';
import cb460Warning from '../assets/map-markers/devices/CB460_warning.svg';
import deviceDefaultActive from '../assets/map-markers/devices/default_active.svg';
import deviceDefaultNotReporting from '../assets/map-markers/devices/default_notreporting.svg';
import deviceDefaultWarning from '../assets/map-markers/devices/default_warning.svg';
import ec520Active from '../assets/map-markers/devices/EC520_active.svg';
import ec520NotReporting from '../assets/map-markers/devices/EC520_notreporting.svg';
import ec520Warning from '../assets/map-markers/devices/EC520_warning.svg';
import deviceTabletActive from '../assets/map-markers/devices/tablet_active.svg';
import deviceTabletNotReporting from '../assets/map-markers/devices/tablet_notreporting.svg';
import deviceTabletWarning from '../assets/map-markers/devices/tablet_warning.svg';
import tsc7Active from '../assets/map-markers/devices/TSC7_active.svg';
import tsc7NotReporting from '../assets/map-markers/devices/TSC7_notreporting.svg';
import tsc7Warning from '../assets/map-markers/devices/TSC7_warning.svg';

import type { DeviceConnectivity } from './devices';

/** Marker suffix chosen from whether the device is reporting. */
export type ReportingState = 'active' | 'notreporting' | 'warning';

const REPORTING_LABEL: Record<ReportingState, string> = {
  active: 'Reporting',
  notreporting: 'Not reporting',
  warning: 'Warning',
};

type MarkerSet = Record<ReportingState, string>;

const DEVICE_MARKERS: Record<string, MarkerSet> = {
  CB460: {
    active: cb460Active,
    notreporting: cb460NotReporting,
    warning: cb460Warning,
  },
  EC520: {
    active: ec520Active,
    notreporting: ec520NotReporting,
    warning: ec520Warning,
  },
  TSC7: {
    active: tsc7Active,
    notreporting: tsc7NotReporting,
    warning: tsc7Warning,
  },
  tablet: {
    active: deviceTabletActive,
    notreporting: deviceTabletNotReporting,
    warning: deviceTabletWarning,
  },
  default: {
    active: deviceDefaultActive,
    notreporting: deviceDefaultNotReporting,
    warning: deviceDefaultWarning,
  },
};

const ASSET_MARKERS: Record<string, MarkerSet> = {
  dozer: {
    active: dozerActive,
    notreporting: dozerNotReporting,
    warning: dozerWarning,
  },
  excavator: {
    active: excavatorActive,
    notreporting: excavatorNotReporting,
    warning: excavatorWarning,
  },
  tablet: {
    active: assetTabletActive,
    notreporting: assetTabletNotReporting,
    warning: assetTabletWarning,
  },
  default: {
    active: assetDefaultActive,
    notreporting: assetDefaultNotReporting,
    warning: assetDefaultWarning,
  },
};

/**
 * Connectivity off is not reporting. A connected device with an alert is a warning.
 * Everything else is reporting.
 */
export function deviceReportingState(device: {
  connectivity: DeviceConnectivity;
  alert?: boolean;
}): ReportingState {
  if (device.alert) {
    return 'warning';
  }
  if (device.connectivity === 'off') {
    return 'notreporting';
  }
  return 'active';
}

/** Warning wins. An asset is not reporting only when every associated device is quiet. */
export function combinedReporting(states: ReportingState[]): ReportingState {
  if (states.some((state) => state === 'warning')) {
    return 'warning';
  }
  if (states.length === 0 || states.every((state) => state === 'notreporting')) {
    return 'notreporting';
  }
  return 'active';
}

export function reportingLabel(state: ReportingState): string {
  return REPORTING_LABEL[state];
}

function deviceFamily(model: string): string {
  const key = model.trim().toLowerCase();
  if (key === 'ec520' || key === 'ec520-w') {
    return 'EC520';
  }
  if (key === 'tablet') {
    return 'tablet';
  }
  if (key === 'cb460') {
    return 'CB460';
  }
  if (key === 'tsc7') {
    return 'TSC7';
  }
  return 'default';
}

function assetFamily(type: string): string {
  const key = type.trim().toLowerCase();
  if (key.includes('excavator')) {
    return 'excavator';
  }
  if (key.includes('dozer')) {
    return 'dozer';
  }
  if (key.includes('tablet')) {
    return 'tablet';
  }
  return 'default';
}

export function deviceMarkerUrl(model: string, state: ReportingState): string {
  return DEVICE_MARKERS[deviceFamily(model)][state];
}

export function assetMarkerUrl(type: string, state: ReportingState): string {
  return ASSET_MARKERS[assetFamily(type)][state];
}
