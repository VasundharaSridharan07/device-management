import { NO_ASSOCIATED_ASSET, type Asset } from './assets';
import { DEVICES } from './devices';
import {
  assetMarkerUrl,
  combinedReporting,
  deviceMarkerUrl,
  deviceReportingState,
  reportingLabel,
  type ReportingState,
} from './mapMarkers';
import type { MapFilter } from './mapScene';
import { projectMembershipLabel, projectsByIds, type Project } from './projects';

export type MapSelectionField = {
  label: string;
  value: string;
};

export type MapSelection = {
  id: string;
  title: string;
  detailsPath: string;
  fields: MapSelectionField[];
};

export type MapDeviceItem = {
  id: string;
  name: string;
  model: string;
  reporting: ReportingState;
  reportingLabel: string;
  assetName: string;
  lastReport: string;
  unavailable: boolean;
  alert: boolean;
  latitude: number;
  longitude: number;
  locationLabel: string;
  markerUrl: string;
};

export type MapAssetItem = {
  id: string;
  name: string;
  type: string;
  projectName: string;
  projectSearch: string;
  locationLabel: string;
  deviceCount: number;
  latitude: number;
  longitude: number;
  reporting: ReportingState;
  markerUrl: string;
};

export type MapPin = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  markerUrl: string;
};

const DEVICE_BY_ID = new Map(DEVICES.map((device) => [device.id, device]));

function deviceCountText(count: number): string {
  return `${count} ${count === 1 ? 'device' : 'devices'}`;
}

export function buildMapDevices(assets: Asset[]): MapDeviceItem[] {
  return DEVICES.map((device) => {
    const reporting = deviceReportingState(device);
    const asset = assets.find((item) => item.deviceIds.includes(device.id));
    return {
      id: device.id,
      name: device.name,
      model: device.model,
      reporting,
      reportingLabel: reportingLabel(reporting),
      assetName: asset?.name ?? NO_ASSOCIATED_ASSET,
      lastReport: device.lastUpdated,
      unavailable: device.connectivity === 'off',
      alert: reporting === 'warning',
      latitude: Number(device.latitude),
      longitude: Number(device.longitude),
      locationLabel: device.approximateLocation,
      markerUrl: deviceMarkerUrl(device.model, reporting),
    };
  });
}

export function buildMapAssets(assets: Asset[], projects: Project[]): MapAssetItem[] {
  return assets.map((asset) => {
    const reporting = combinedReporting(
      asset.deviceIds.map((deviceId) => {
        const device = DEVICE_BY_ID.get(deviceId);
        return device ? deviceReportingState(device) : 'notreporting';
      }),
    );
    const assigned = projectsByIds(projects, asset.projectIds);

    return {
      id: asset.id,
      name: asset.name,
      type: asset.type,
      projectName: projectMembershipLabel(projects, asset.projectIds),
      projectSearch: assigned.map((project) => project.name).join(' '),
      locationLabel: asset.locationLabel,
      deviceCount: asset.deviceIds.length,
      latitude: asset.latitude,
      longitude: asset.longitude,
      reporting,
      markerUrl: assetMarkerUrl(asset.type, reporting),
    };
  });
}

export function visibleMapDevices(
  devices: MapDeviceItem[],
  query: string,
  filter: MapFilter,
): MapDeviceItem[] {
  const needle = query.trim().toLowerCase();

  return devices.filter((device) => {
    if (filter === 'alerts' && !device.alert) {
      return false;
    }
    if (filter === 'unavailable' && !device.unavailable) {
      return false;
    }
    if (needle.length > 0 && !device.name.toLowerCase().includes(needle)) {
      return false;
    }
    return true;
  });
}

export function visibleMapAssets(assets: MapAssetItem[], query: string): MapAssetItem[] {
  const needle = query.trim().toLowerCase();
  if (needle.length === 0) {
    return assets;
  }

  return assets.filter((asset) => {
    const haystack = `${asset.name} ${asset.type} ${asset.projectSearch}`.toLowerCase();
    return haystack.includes(needle);
  });
}

export function deviceSelection(device: MapDeviceItem): MapSelection {
  return {
    id: device.id,
    title: device.name,
    detailsPath: `/devices/${device.id}`,
    fields: [
      { label: 'Model', value: device.model },
      { label: 'Reporting', value: device.reportingLabel },
      { label: 'Associated asset', value: device.assetName },
      { label: 'Last reported', value: device.lastReport },
      { label: 'Location', value: device.locationLabel },
    ],
  };
}

export function assetSelection(asset: MapAssetItem): MapSelection {
  return {
    id: asset.id,
    title: asset.name,
    detailsPath: `/assets/${asset.id}`,
    fields: [
      { label: 'Type', value: asset.type },
      { label: 'Project', value: asset.projectName },
      { label: 'Location', value: asset.locationLabel },
      { label: 'Devices', value: deviceCountText(asset.deviceCount) },
    ],
  };
}

export function assetRowDetail(asset: MapAssetItem): string {
  return `${asset.type} · ${asset.projectName} · ${asset.locationLabel} · ${deviceCountText(asset.deviceCount)}`;
}

export function deviceRowDetail(device: MapDeviceItem): string {
  return `${device.model} · ${device.reportingLabel} · ${device.assetName}`;
}

export function toMapPin(item: {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  markerUrl: string;
}): MapPin {
  return {
    id: item.id,
    name: item.name,
    latitude: item.latitude,
    longitude: item.longitude,
    markerUrl: item.markerUrl,
  };
}
